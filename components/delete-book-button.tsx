'use client';

import { useState } from 'react';
import { deleteBook } from '@/app/actions/delete-book';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

interface DeleteBookButtonProps {
  bookId: string;
  bookTitle: string;
}

export function DeleteBookButton({ bookId, bookTitle }: DeleteBookButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (confirmedTitle: string) => {
    const formData = new FormData();
    formData.append('bookId', bookId);
    formData.append('title', confirmedTitle);

    await deleteBook(formData);
  };

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className='cursor-pointer text-sm text-red-600 hover:text-red-800 transition-colors border-b border-red-200 hover:border-red-400 pb-1'
      >
        Delete Book
      </button>

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleDelete}
        title={bookTitle}
        type='book'
      />
    </>
  );
}
