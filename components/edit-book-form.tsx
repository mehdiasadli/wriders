'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { updateBookSchema, type UpdateBookSchema } from '@/schemas/books.schema';
import { Eye, Lock } from 'lucide-react';

interface EditBookFormProps {
  book: {
    id: string;
    slug: string;
    title: string;
    synopsis: string | null;
    visibility: 'PUBLIC' | 'PRIVATE';
    status: 'DRAFT' | 'SOON' | 'ARCHIVED' | 'PUBLISHED';
    series?: {
      id: string;
      title: string;
      books: { orderInSeries: number | null; title: string }[];
    } | null;
    orderInSeries: number | null;
  };
}

export function EditBookForm({ book }: EditBookFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<UpdateBookSchema>({
    resolver: zodResolver(updateBookSchema),
    defaultValues: {
      synopsis: book.synopsis || undefined,
      visibility: book.visibility,
      status: book.status,
      orderInSeries: book.orderInSeries || null,
    },
  });

  const onSubmit = async (data: UpdateBookSchema) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/books/${book.slug}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to update book');
      } else {
        setSuccess('Book updated successfully! Redirecting...');
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

  const handleReset = () => {
    form.reset({
      synopsis: book.synopsis || undefined,
      visibility: book.visibility,
      status: book.status,
      orderInSeries: book.orderInSeries || null,
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Book Title (Read-only) */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Book Title</label>
          <input
            type='text'
            value={book.title}
            disabled
            className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none bg-gray-50 text-gray-500'
          />
          <p className='text-sm text-gray-500 mt-1'>Book titles cannot be changed after creation</p>
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

        {/* Status */}
        <div>
          <label className='block text-sm font-medium text-gray-900 mb-2'>Status</label>
          <p className='text-sm text-gray-600 mb-2'>What stage is your book in?</p>

          <div className='space-y-3'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <input type='radio' value='DRAFT' className='w-4 h-4' {...form.register('status')} />
              <span className='text-sm text-gray-900'>Draft - Work in progress</span>
            </label>

            <label className='flex items-center gap-3 cursor-pointer'>
              <input type='radio' value='SOON' className='w-4 h-4' {...form.register('status')} />
              <span className='text-sm text-gray-900'>Coming Soon - Ready to publish</span>
            </label>

            <label className='flex items-center gap-3 cursor-pointer'>
              <input type='radio' value='PUBLISHED' className='w-4 h-4' {...form.register('status')} />
              <span className='text-sm text-gray-900'>Published - Live and available</span>
            </label>

            <label className='flex items-center gap-3 cursor-pointer'>
              <input type='radio' value='ARCHIVED' className='w-4 h-4' {...form.register('status')} />
              <span className='text-sm text-gray-900'>Archived - Hidden from public</span>
            </label>
          </div>

          {form.formState.errors.status && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.status.message}</p>
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

        {/* Series (Read-only) */}
        {book.series && (
          <div>
            <label className='block text-sm font-medium text-gray-900 mb-2'>Series</label>
            <input
              type='text'
              value={book.series.title}
              disabled
              className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none bg-gray-50 text-gray-500'
            />
            <p className='text-sm text-gray-500 mt-1'>Series cannot be changed after creation</p>
          </div>
        )}

        {/* Order in Series */}
        {book.series && (
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

        {/* Action Buttons */}
        <div className='pt-4 border-t border-gray-200 space-y-4'>
          <button
            type='button'
            onClick={handleReset}
            disabled={isLoading}
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
          >
            Reset Changes
          </button>

          <button
            type='submit'
            className='w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
            disabled={isLoading}
          >
            {isLoading ? 'Updating book...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
