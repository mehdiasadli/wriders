'use client';

import { useState } from 'react';
import { deleteChapter } from '@/app/actions/delete-chapter';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

interface DeleteChapterButtonProps {
  chapterId: string;
  chapterTitle: string;
}

export function DeleteChapterButton({ chapterId, chapterTitle }: DeleteChapterButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (confirmedTitle: string) => {
    const formData = new FormData();
    formData.append('chapterId', chapterId);
    formData.append('title', confirmedTitle);

    await deleteChapter(formData);
  };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className='text-red-600 hover:text-red-800 transition-colors border-b border-red-200 hover:border-red-400 pb-1'
      >
        Delete Chapter
      </button>

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title={chapterTitle}
        type='chapter'
      />
    </>
  );
}
