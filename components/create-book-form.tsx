'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createBookSchema, type CreateBookSchema } from '@/schemas/books.schema';
import { Eye, Lock } from 'lucide-react';
import Link from 'next/link';
import { BookVisibilitySchema } from '@/schemas';

interface CreateBookFormProps {
  paramSeriesId?: string;
  initialFormData: {
    title?: string;
    synopsis?: string;
    visibility?: string;
  };
  series: {
    id: string;
    title: string;
    books: { orderInSeries: number | null; title: string }[];
  }[];
}

export function CreateBookForm({ series, paramSeriesId, initialFormData }: CreateBookFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const validatedVisibility = BookVisibilitySchema.safeParse(initialFormData.visibility).data ?? 'PRIVATE';

  const form = useForm<CreateBookSchema>({
    resolver: zodResolver(createBookSchema),
    defaultValues: {
      title: decodeURIComponent(initialFormData.title || ''),
      synopsis: decodeURIComponent(initialFormData.synopsis || ''),
      visibility: validatedVisibility,
      seriesId: paramSeriesId,
      orderInSeries: null,
    },
  });

  const onSubmit = async (data: CreateBookSchema) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Transform empty seriesId to null
    const transformedData = {
      ...data,
      seriesId: data.seriesId === '' ? null : data.seriesId,
      orderInSeries: data.seriesId === '' ? null : data.orderInSeries,
    };

    try {
      const response = await fetch('/api/books/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to create book');
      } else {
        setSuccess('Book created successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/books/${result.data.slug}`);
        }, 2000);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Title */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Title</label>
          <input
            type='text'
            placeholder='Enter your book title...'
            disabled={isLoading}
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Synopsis */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Synopsis</label>
          <p className='text-sm text-gray-600 mb-2'>Give readers a glimpse into your story</p>
          <textarea
            placeholder='Tell us about your story...'
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white resize-none'
            rows={4}
            disabled={isLoading}
            {...form.register('synopsis')}
          />
          {form.formState.errors.synopsis && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.synopsis.message}</p>
          )}
        </div>

        {/* Visibility */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Visibility</label>
          <p className='text-sm text-gray-600 mb-2'>Choose who can see and read your book</p>

          <div className='space-y-3'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input type='radio' value='PRIVATE' className='w-4 h-4' {...form.register('visibility')} />
              <div className='flex items-center gap-2'>
                <Lock className='w-4 h-4 text-gray-600' />
                <span className='text-sm text-gray-900'>Private - Only followers can read</span>
              </div>
            </label>

            <label className='flex items-center gap-3 cursor-pointer'>
              <input type='radio' value='PUBLIC' className='w-4 h-4' {...form.register('visibility')} />
              <div className='flex items-center gap-2'>
                <Eye className='w-4 h-4 text-gray-600' />
                <span className='text-sm text-gray-900'>Public - Everyone can read</span>
              </div>
            </label>
          </div>

          {form.formState.errors.visibility && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.visibility.message}</p>
          )}
        </div>

        {/* Series */}
        {series.length > 0 && (
          <div>
            <div className='flex items-center gap-4 mb-2'>
              <label className='text-sm font-medium text-gray-900'>Series (Optional)</label>
              <Link
                href={`/series/create?ref=create-book&title=${encodeURIComponent(form.watch('title') || '')}&synopsis=${encodeURIComponent(form.watch('synopsis') || '')}&visibility=${form.watch('visibility')}`}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-0.5'
              >
                Create New Series
              </Link>
            </div>
            <p className='text-sm text-gray-600 mb-2'>Is this book part of a series?</p>

            <select
              className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
              disabled={isLoading}
              {...form.register('seriesId')}
            >
              <option value=''>No series</option>
              {series.map((serie) => (
                <option key={serie.id} value={serie.id}>
                  {serie.title}
                </option>
              ))}
            </select>

            {form.formState.errors.seriesId && (
              <p className='text-sm text-red-600 mt-1'>{form.formState.errors.seriesId.message}</p>
            )}
          </div>
        )}

        {/* Order in Series */}
        {form.watch('seriesId') && (
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>Order in Series (Optional)</label>
            <p className='text-sm text-gray-600 mb-2'>What position does this book hold in the series?</p>
            <input
              type='number'
              placeholder='e.g., 1, 2, 3...'
              className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
              disabled={isLoading}
              min={1}
              {...form.register('orderInSeries', { valueAsNumber: true })}
            />
            {form.formState.errors.orderInSeries && (
              <p className='text-sm text-red-600 mt-1'>{form.formState.errors.orderInSeries.message}</p>
            )}
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className='p-4 border border-red-200 bg-red-50'>
            <p className='text-sm text-red-700'>{error}</p>
          </div>
        )}

        {success && (
          <div className='p-4 border border-green-200 bg-green-50'>
            <p className='text-sm text-green-700'>{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className='pt-4 border-t border-gray-200'>
          <button
            type='submit'
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
            disabled={isLoading}
          >
            {isLoading ? 'Creating your book...' : 'Create Book'}
          </button>
        </div>
      </form>
    </div>
  );
}
