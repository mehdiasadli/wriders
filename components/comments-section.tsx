'use client';

import { useState } from 'react';
import { AddComment } from './add-comment';
import { CommentList } from './comment-list';

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

interface CommentsSectionProps {
  chapterSlug: string;
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  initialComments: CommentData[];
  currentUserId?: string;
  chapterAuthorId: string;
}

export function CommentsSection({
  chapterSlug,
  bookSlug,
  bookTitle,
  chapterTitle,
  initialComments,
  currentUserId,
  chapterAuthorId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Single refresh function that fetches fresh data from server
  const refreshComments = async () => {
    setIsRefreshing(true);
    try {
      // First, revalidate the server cache
      await fetch(`/api/revalidate?path=/books/${bookSlug}/chapters/${chapterSlug}/comments`, {
        method: 'POST',
      });

      // Then fetch fresh data
      const response = await fetch(`/api/chapters/${chapterSlug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error refreshing comments:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Single handler for all comment operations
  const handleCommentAction = async (action: 'add' | 'update' | 'delete' | 'reply') => {
    await refreshComments();
  };

  return (
    <div className='space-y-6'>
      {/* Add Comment Form */}
      {currentUserId && <AddComment chapterSlug={chapterSlug} onCommentAdded={() => handleCommentAction('add')} />}

      {/* Comments List */}
      <CommentList
        chapterSlug={chapterSlug}
        bookSlug={bookSlug}
        bookTitle={bookTitle}
        chapterTitle={chapterTitle}
        initialComments={comments}
        currentUserId={currentUserId}
        chapterAuthorId={chapterAuthorId}
        onCommentAction={handleCommentAction}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
