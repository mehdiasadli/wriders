'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSeriesSchema, type CreateSeriesSchema } from '@/schemas/series.schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CreateSeriesFormProps {
  onSuccess?: () => void;
  className?: string;
  refData?: {
    ref: string;
    title?: string;
    synopsis?: string;
    visibility?: string;
  };
}

export function CreateSeriesForm({ onSuccess, refData }: CreateSeriesFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSeriesSchema>({
    resolver: zodResolver(createSeriesSchema),
    defaultValues: {
      title: '',
      synopsis: '',
    },
  });

  const handleSubmit = async (data: CreateSeriesSchema) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/series/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create series');
      }

      const result = await response.json();

      if (refData) {
        router.push(
          `/books/create?seriesId=${result.data.id}&title=${encodeURIComponent(refData.title || '')}&synopsis=${encodeURIComponent(refData.synopsis || '')}&visibility=${refData.visibility}`
        );
      } else {
        // Redirect to the newly created series page
        router.push(`/series/${result.data.slug}`);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating series:', error);
      // You could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
        <div className='space-y-2'>
          <label htmlFor='title' className='text-sm text-gray-700'>
            Series Title
          </label>
          <input
            id='title'
            type='text'
            placeholder='Enter series title...'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 text-lg'
            {...form.register('title')}
          />
          {form.formState.errors.title && <p className='text-sm text-red-600'>{form.formState.errors.title.message}</p>}
        </div>

        <div className='space-y-2'>
          <label htmlFor='synopsis' className='text-sm text-gray-700'>
            Series Synopsis
          </label>
          <textarea
            id='synopsis'
            placeholder='Brief description of this series...'
            rows={6}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical'
            {...form.register('synopsis')}
          />
          {form.formState.errors.synopsis && (
            <p className='text-sm text-red-600'>{form.formState.errors.synopsis.message}</p>
          )}
          <p className='text-xs text-gray-500'>
            Describe the overall story, themes, and what readers can expect from this series.
          </p>
        </div>

        <div className='flex justify-between pt-4'>
          <Link href='/series' className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>
            ← Back to Series
          </Link>

          <button
            type='submit'
            disabled={isSubmitting}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isSubmitting ? 'Creating...' : 'Create Series'}
          </button>
        </div>
      </form>
    </div>
  );
}
