'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentSchema, type CreateCommentSchema } from '@/schemas/comments.schema';
import { toast } from 'sonner';

interface AddCommentProps {
  chapterSlug: string;
  onCommentAdded?: () => void;
}

export function AddComment({ chapterSlug, onCommentAdded }: AddCommentProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCommentSchema>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: CreateCommentSchema) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chapters/${chapterSlug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create comment');
      }

      toast.success('Comment added successfully');
      form.reset();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='border-b border-gray-200 pb-6 mb-6'>
      <h3 className='text-sm text-gray-700 mb-4'>Add a Comment</h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <textarea
            {...form.register('content')}
            placeholder='Share your thoughts about this chapter...'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical min-h-[100px]'
            disabled={isSubmitting}
          />
          {form.formState.errors.content && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.content.message}</p>
          )}
        </div>

        <div className='flex justify-between items-center'>
          <div className='text-xs text-gray-500'>{form.watch('content')?.length || 0}/1000 characters</div>
          <button
            type='submit'
            disabled={isSubmitting}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}
