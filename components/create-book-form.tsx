'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { createBookSchema, type CreateBookSchema } from '@/schemas/books.schema';
import { Eye, Lock } from 'lucide-react';
import { BookVisibilitySchema } from '@/schemas';

interface CreateBookFormProps {
  initialFormData: {
    title?: string;
    synopsis?: string;
    visibility?: string;
  };
}

export function CreateBookForm({ initialFormData }: CreateBookFormProps) {
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
    },
  });

  const onSubmit = async (data: CreateBookSchema) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/books/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
    } catch (_error) {
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
