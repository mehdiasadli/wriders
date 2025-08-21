'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCommentSchema, type CreateCommentSchema } from '@/schemas/comments.schema';
import { toast } from 'sonner';

interface AddReplyProps {
  parentId: string;
  chapterSlug: string;
  onReplyAdded: () => void;
  onCancel?: () => void;
}

export function AddReply({ parentId, chapterSlug, onReplyAdded, onCancel }: AddReplyProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateCommentSchema>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
      parentId,
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
        body: JSON.stringify({
          ...data,
          parentId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create reply');
      }

      toast.success('Reply added successfully');
      form.reset();
      onReplyAdded();
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='mt-4 pt-4 border-t border-gray-200'>
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm text-gray-700'>Reply</h4>
        {onCancel && (
          <button onClick={onCancel} className='text-xs text-gray-500 hover:text-gray-700 transition-colors'>
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <textarea
            {...form.register('content')}
            placeholder='Write your reply...'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900 resize-vertical min-h-[80px]'
            disabled={isSubmitting}
          />
          {form.formState.errors.content && (
            <p className='text-sm text-red-600 mt-1'>{form.formState.errors.content.message}</p>
          )}
        </div>

        <div className='flex justify-between items-center'>
          <div className='text-xs text-gray-500'>{form.watch('content')?.length || 0}/1000 characters</div>
          <div className='flex items-center gap-3'>
            {onCancel && (
              <button
                type='button'
                onClick={onCancel}
                disabled={isSubmitting}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
              >
                Cancel
              </button>
            )}
            <button
              type='submit'
              disabled={isSubmitting}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
            >
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
