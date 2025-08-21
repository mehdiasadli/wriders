'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/components/tiptap/rich-text-editor';
import Link from 'next/link';
import { toast } from 'sonner';
import { getWordCount } from '@/lib/utils';

interface EditChapterContentFormProps {
  chapter: {
    id: string;
    slug: string;
    title: string;
    content: string;
  };
  bookSlug: string;
  bookTitle: string;
  onSuccess?: () => void;
  className?: string;
}

export function EditChapterContentForm({ chapter, bookSlug, bookTitle, onSuccess }: EditChapterContentFormProps) {
  const [content, setContent] = useState(chapter.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = getWordCount(content, true);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chapters/${chapter.slug}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update chapter content');
      }

      toast.success('Chapter content updated successfully');
    } catch (error) {
      console.error('Error updating chapter content:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='h-screen flex flex-col'>
      {/* Minimal Header Bar */}
      <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white'>
        <div className='flex items-center gap-4'>
          <Link
            href={`/books/${bookSlug}/chapters/${chapter.slug}`}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
          >
            ← {chapter.title}
          </Link>
          <div className='text-sm text-gray-500'>Editing content</div>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-sm text-gray-500'>{wordCount.toLocaleString()} words</div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Full Height Editor */}
      <div className='flex-1 overflow-hidden'>
        <RichTextEditor
          className='h-full'
          content={content}
          onUpdate={({ editor }) => {
            setContent(editor.getHTML());
          }}
        />
      </div>
    </div>
  );
}
