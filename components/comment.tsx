'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { AddReply } from './add-reply';
import { EditComment } from './edit-comment';
import { CommentShareOptions } from './comment-share-options';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

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

interface CommentProps {
  comment: CommentData;
  currentUserId?: string;
  chapterAuthorId: string;
  chapterSlug: string;
  bookSlug: string;
  bookTitle: string;
  chapterTitle: string;
  onCommentAction: (action: 'add' | 'update' | 'delete' | 'reply') => Promise<void>;
}

export function Comment({
  comment,
  currentUserId,
  chapterAuthorId,
  chapterSlug,
  bookSlug,
  bookTitle,
  chapterTitle,
  onCommentAction,
}: CommentProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [localComment] = useState(comment);

  const canEdit = currentUserId === comment.authorId || currentUserId === chapterAuthorId;
  const canDelete = currentUserId === comment.authorId || currentUserId === chapterAuthorId;
  const canReply = comment.depth < 4;

  const handleDelete = async () => {
    setIsDeleteModalOpen(false);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      toast.success('Comment deleted successfully');
      onCommentAction('delete');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  };

  const handleCommentUpdate = () => {
    setIsEditing(false);
    onCommentAction('update');
  };

  const handleReplyAdded = () => {
    setIsReplying(false);
    onCommentAction('reply');
  };

  return (
    <div className='border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0'>
      {/* Comment Header */}
      <div className='flex justify-between items-start mb-3'>
        <div className='flex items-center gap-3'>
          <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700'>
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <Link
                href={`/users/${comment.author.slug}`}
                className='text-sm text-gray-900 hover:text-gray-700 transition-colors'
              >
                {comment.author.name}
              </Link>
              {comment.authorId === chapterAuthorId && <span className='text-xs text-gray-500'>Author</span>}
            </div>
            <div className='text-xs text-gray-500'>
              {formatDistanceToNow(new Date(comment.createdAt))} ago
              {comment.updatedAt > comment.createdAt && ' (edited)'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center gap-4 text-xs'>
          <CommentShareOptions
            commentTitle={comment.content.substring(0, 50)}
            commentUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/books/${bookSlug}/chapters/${chapterSlug}/comments/${comment.slug}`}
            bookTitle={bookTitle}
            chapterTitle={chapterTitle}
            authorName={comment.author.name}
          />
          {canReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
            >
              Reply
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Comment Content */}
      {isEditing ? (
        <EditComment comment={localComment} onUpdate={handleCommentUpdate} onCancel={() => setIsEditing(false)} />
      ) : (
        <div className='text-gray-800 mb-4 text-sm leading-relaxed'>
          <p className='whitespace-pre-wrap'>{localComment.content}</p>
        </div>
      )}

      {/* Reply Form */}
      {isReplying && (
        <div className='mb-4'>
          <AddReply
            parentId={comment.id}
            chapterSlug={chapterSlug}
            onReplyAdded={handleReplyAdded}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className='mt-4'>
          <div className='space-y-4 ml-4 border-l border-gray-200 pl-4'>
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className='bg-white border border-gray-200 shadow-lg max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-lg font-serif text-gray-900'>Delete Comment</DialogTitle>
            <DialogDescription className='text-sm text-gray-600'>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex justify-end gap-3'>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors px-4 py-2'
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className='text-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors px-4 py-2'
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
