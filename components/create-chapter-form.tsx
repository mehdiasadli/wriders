'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createChapterSchema, type CreateChapterSchema } from '@/schemas/chapters.schema';
import { useRouter } from 'next/navigation';

interface CreateChapterFormProps {
  bookId: string;
  bookSlug: string;
  existingChapterOrders?: number[];
  className?: string;
}

export function CreateChapterForm({ bookId, bookSlug, existingChapterOrders = [] }: CreateChapterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CreateChapterSchema>({
    resolver: zodResolver(createChapterSchema),
    defaultValues: {
      title: '',
      synopsis: '',
      order: 1,
      bookId,
    },
  });

  const handleSubmit = async (data: CreateChapterSchema) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/chapters/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create chapter');
      }

      const result = await response.json();

      // Redirect to the created chapter for content editing
      router.push(`/books/${bookSlug}/chapters/${result.data.slug}/edit/content`);
    } catch (error) {
      console.error('Error creating chapter:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextOrder = Math.max(0, ...existingChapterOrders) + 1;

  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
        {/* Title */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Chapter Title</label>
          <input
            type='text'
            placeholder='Enter chapter title...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isSubmitting}
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Order */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Chapter Order</label>
          <p className='text-sm text-gray-600 mb-2'>Position of this chapter in the book</p>
          <input
            type='number'
            placeholder={nextOrder.toString()}
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            disabled={isSubmitting}
            min={1}
            defaultValue={nextOrder}
            {...form.register('order', { valueAsNumber: true })}
          />
          {existingChapterOrders.length > 0 && (
            <p className='text-xs text-gray-500 mt-1'>
              Existing orders: {existingChapterOrders.sort((a, b) => a - b).join(', ')}
            </p>
          )}
          {form.formState.errors.order && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.order.message}</p>
          )}
        </div>

        {/* Synopsis */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Chapter Synopsis</label>
          <p className='text-sm text-gray-600 mb-2'>Brief description of this chapter (optional)</p>
          <textarea
            placeholder='Brief description of this chapter...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={3}
            disabled={isSubmitting}
            {...form.register('synopsis')}
          />
          {form.formState.errors.synopsis && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.synopsis.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className='pt-4 border-t border-gray-200'>
          <button
            type='submit'
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating chapter...' : 'Create Chapter'}
          </button>
        </div>
      </form>
    </div>
  );
}
