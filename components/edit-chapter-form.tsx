'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateChapterSchema, type UpdateChapterSchema } from '@/schemas/chapters.schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EditChapterFormProps {
  chapter: {
    id: string;
    slug: string;
    title: string;
    synopsis: string | null;
    order: number;
    status: 'DRAFT' | 'SOON' | 'PUBLISHED' | 'ARCHIVED';
    publishedAt: Date | null;
  };
  bookSlug: string;
  bookTitle: string;
  onSuccess?: () => void;
  className?: string;
}

export function EditChapterForm({ chapter, bookSlug, bookTitle, onSuccess }: EditChapterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateChapterSchema>({
    resolver: zodResolver(updateChapterSchema),
    defaultValues: {
      title: chapter.title,
      synopsis: chapter.synopsis || '',
      order: chapter.order,
      status: chapter.status,
    },
  });

  const handleSubmit = async (data: UpdateChapterSchema) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chapters/${chapter.slug}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update chapter');
      }

      router.push(`/books/${bookSlug}/chapters/${chapter.slug}`);
    } catch (error) {
      console.error('Error updating chapter:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label htmlFor='title' className='text-sm text-gray-700'>
              Chapter Title
            </label>
            <input
              id='title'
              type='text'
              placeholder='Enter chapter title...'
              className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className='text-sm text-red-600'>{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label htmlFor='order' className='text-sm text-gray-700'>
              Chapter Order
            </label>
            <input
              id='order'
              type='number'
              min='1'
              placeholder='1'
              className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
              {...form.register('order', { valueAsNumber: true })}
            />
            {form.formState.errors.order && (
              <p className='text-sm text-red-600'>{form.formState.errors.order.message}</p>
            )}
          </div>
        </div>

        <div className='space-y-2'>
          <label htmlFor='synopsis' className='text-sm text-gray-700'>
            Chapter Synopsis
          </label>
          <textarea
            id='synopsis'
            placeholder='Brief description of this chapter...'
            rows={3}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical'
            {...form.register('synopsis')}
          />
          {form.formState.errors.synopsis && (
            <p className='text-sm text-red-600'>{form.formState.errors.synopsis.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className='text-sm text-gray-700'>Status</label>
          <div className='space-y-2'>
            {[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'SOON', label: 'Coming Soon' },
              { value: 'PUBLISHED', label: 'Published' },
              { value: 'ARCHIVED', label: 'Archived' },
            ].map((option) => (
              <label key={option.value} className='flex items-center gap-2 text-sm'>
                <input type='radio' value={option.value} className='text-gray-600' {...form.register('status')} />
                <span className='text-gray-700'>{option.label}</span>
              </label>
            ))}
          </div>
          {form.formState.errors.status && (
            <p className='text-sm text-red-600'>{form.formState.errors.status.message}</p>
          )}
        </div>

        <div className='flex justify-between pt-4'>
          <Link
            href={`/books/${bookSlug}/chapters/${chapter.slug}`}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            ← Back to Chapter
          </Link>

          <button
            type='submit'
            disabled={isSubmitting}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isSubmitting ? 'Updating...' : 'Update Chapter'}
          </button>
        </div>
      </form>
    </div>
  );
}
