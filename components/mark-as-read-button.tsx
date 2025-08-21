'use client';

import { BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface MarkAsReadButtonProps {
  chapterSlug: string;
  initialReadCount: number;
}

export function MarkAsReadButton({ chapterSlug, initialReadCount }: MarkAsReadButtonProps) {
  const [hasRead, setHasRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [readCount, setReadCount] = useState(initialReadCount);

  // Check initial read status
  useEffect(() => {
    const checkReadStatus = async () => {
      try {
        const response = await fetch(`/api/chapters/${chapterSlug}/read`);
        if (response.ok) {
          const data = await response.json();
          setHasRead(data.hasRead);
        }
      } catch (error) {
        console.error('Error checking read status:', error);
      }
    };

    checkReadStatus();
  }, [chapterSlug]);

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chapters/${chapterSlug}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as read');
      }

      const data = await response.json();
      setHasRead(true);
      setReadCount(data.readCount);
      toast.success('Chapter marked as read!');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark as read');
    } finally {
      setIsLoading(false);
    }
  };

  if (hasRead) {
    return (
      <div className='text-center py-4'>
        <div className='flex items-center justify-center gap-2 text-sm text-gray-600'>
          <span>✓ Read</span>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-3'>
      <button
        onClick={handleMarkAsRead}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <BookOpen className={`w-4 h-4`} />
        {isLoading ? 'Marking as Read...' : 'Mark as Read'}
      </button>
    </div>
  );
}
