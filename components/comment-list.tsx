'use client';

import { useState } from 'react';
import { Comment } from './comment';

interface CommentAuthor {
  id: string;
  name: string;
  slug: string;
}

interface CommentReplies {
  id: string;
  slug: string;
  content: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: CommentAuthor;
  parentId: string | null;
  _count: {
    replies: number;
  };
  replies?: CommentReplies[];
}

interface CommentData {
  id: string;
  slug: string;
  content: string;
  depth: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author: CommentAuthor;
  parentId: string | null;
  _count: {
    replies: number;
  };
  replies?: CommentReplies[];
}

interface CommentListProps {
  chapterSlug: string;
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  initialComments: CommentData[];
  currentUserId?: string;
  chapterAuthorId: string;
  onCommentAction: (action: 'add' | 'update' | 'delete' | 'reply') => Promise<void>;
  isRefreshing: boolean;
}

export function CommentList({
  chapterSlug,
  bookSlug,
  bookTitle,
  chapterTitle,
  initialComments,
  currentUserId,
  chapterAuthorId,
  onCommentAction,
  isRefreshing,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);

  // Update comments when initialComments prop changes (from parent refresh)
  if (JSON.stringify(comments) !== JSON.stringify(initialComments)) {
    setComments(initialComments);
  }

  if (comments.length === 0) {
    return (
      <div className='text-center text-gray-500 py-8'>
        <p className='text-lg font-medium'>No comments yet</p>
        <p className='text-sm'>Be the first to start the discussion!</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {isRefreshing && (
        <div className='text-center text-gray-500 py-4'>
          <div className='w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2'></div>
          <p className='text-sm'>Refreshing comments...</p>
        </div>
      )}

      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={{
            ...comment,
            replies: comment.replies || [],
          }}
          currentUserId={currentUserId}
          chapterAuthorId={chapterAuthorId}
          chapterSlug={chapterSlug}
          bookSlug={bookSlug}
          bookTitle={bookTitle}
          chapterTitle={chapterTitle}
          onCommentAction={onCommentAction}
        />
      ))}
    </div>
  );
}
