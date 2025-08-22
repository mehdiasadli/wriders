'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => Promise<void>;
  title: string;
  type: 'chapter' | 'book' | 'series';
  description?: string;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  type,
  description,
}: DeleteConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (inputValue !== title) {
      setError('Title does not match');
      return;
    }

    startTransition(async () => {
      try {
        await onConfirm(inputValue);
        onClose();
        setInputValue('');
        setError('');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    });
  };

  const handleClose = () => {
    if (!isPending) {
      onClose();
      setInputValue('');
      setError('');
    }
  };

  const getWarningText = () => {
    switch (type) {
      case 'chapter':
        return 'This will permanently delete this chapter and all its comments. This action cannot be undone.';
      case 'book':
        return 'This will permanently delete this book, all its chapters, and all comments. This action cannot be undone.';
      case 'series':
        return 'This will permanently delete this series. Books in the series will no longer be grouped together. This action cannot be undone.';
      default:
        return 'This action cannot be undone.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='bg-white border border-gray-200 shadow-lg rounded-none max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl font-serif text-gray-900'>Delete {type}</DialogTitle>
          <DialogDescription className='text-sm text-gray-600'>{description || getWarningText()}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='p-4 border border-red-200 bg-red-50'>
            <p className='text-sm text-red-800 mb-2'>
              <strong>Warning:</strong> This action is permanent and cannot be undone.
            </p>
            <p className='text-sm text-red-700'>To confirm deletion, type the {type} title below:</p>
            <p className='text-sm font-medium text-red-900 mt-2 break-all'>&quot;{title}&quot;</p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='title-input' className='text-sm font-medium text-gray-700'>
              {type.charAt(0).toUpperCase() + type.slice(1)} title
            </Label>
            <Input
              id='title-input'
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (error) setError('');
              }}
              placeholder={`Type "${title}" to confirm`}
              className='border-gray-300 rounded-none focus:border-gray-500 focus:ring-0'
              disabled={isPending}
            />
          </div>

          {error && <div className='text-sm text-red-600 p-2 border border-red-200 bg-red-50'>{error}</div>}
        </div>

        <DialogFooter className='flex gap-3 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}
            disabled={isPending}
            className='border-gray-300 text-gray-700 hover:bg-gray-50 rounded-none'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleConfirm}
            disabled={isPending || inputValue !== title}
            className='bg-red-600 hover:bg-red-700 text-white rounded-none'
          >
            {isPending ? 'Deleting...' : `Delete ${type}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
