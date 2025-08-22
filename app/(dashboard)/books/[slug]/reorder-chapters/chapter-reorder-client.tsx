'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, MessageCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
  status: string;
  synopsis: string | null;
  publishedAt: Date | null;
  _count: {
    comments: number;
    reads: number;
  };
}

interface ChapterReorderClientProps {
  bookSlug: string;
  chapters: Chapter[];
}

function SortableChapterItem({ chapter }: { chapter: Chapter }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-3 ${
        isDragging ? 'shadow-lg opacity-50' : 'shadow-sm hover:shadow-md'
      } transition-all duration-200`}
    >
      <div className='flex items-start gap-4'>
        {/* Drag Handle */}
        <div
          className='flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors'
          {...attributes}
          {...listeners}
        >
          <GripVertical className='w-5 h-5' />
        </div>

        {/* Chapter Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-3 mb-2'>
            <span className='text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded'>
              Chapter {chapter.order}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full uppercase tracking-wide ${
                chapter.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-800'
                  : chapter.status === 'DRAFT'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {chapter.status}
            </span>
          </div>

          <h3 className='text-lg font-semibold text-gray-900 mb-1 truncate'>{chapter.title}</h3>

          {chapter.synopsis && <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{chapter.synopsis}</p>}

          <div className='flex items-center gap-4 text-xs text-gray-500'>
            <div className='flex items-center gap-1'>
              <Eye className='w-3 h-3' />
              <span>{chapter._count.reads} reads</span>
            </div>
            <div className='flex items-center gap-1'>
              <MessageCircle className='w-3 h-3' />
              <span>{chapter._count.comments} comments</span>
            </div>
            {chapter.publishedAt && (
              <div className='flex items-center gap-1'>
                <Calendar className='w-3 h-3' />
                <span>Published {formatDistanceToNow(new Date(chapter.publishedAt))} ago</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChapterReorderClient({ bookSlug, chapters: initialChapters }: ChapterReorderClientProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = chapters.findIndex((chapter) => chapter.id === active.id);
        const newIndex = chapters.findIndex((chapter) => chapter.id === over?.id);

        const newChapters = arrayMove(chapters, oldIndex, newIndex);

        // Update order numbers
        const updatedChapters = newChapters.map((chapter, index) => ({
          ...chapter,
          order: index + 1,
        }));

        setChapters(updatedChapters);

        // Save to server
        setIsSaving(true);
        try {
          const response = await fetch('/api/chapters/reorder', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookSlug,
              chapters: updatedChapters.map((chapter) => ({
                id: chapter.id,
                order: chapter.order,
              })),
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to reorder chapters');
          }

          toast.success('Chapter order saved successfully');
        } catch (error) {
          console.error('Error saving chapter order:', error);
          toast.error('Failed to save chapter order');
          // Revert changes on error
          setChapters(initialChapters);
        } finally {
          setIsSaving(false);
        }
      }
    },
    [chapters, bookSlug, initialChapters]
  );

  return (
    <div className='space-y-4'>
      {isSaving && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
          <p className='text-sm text-blue-700'>Saving changes...</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {chapters.map((chapter) => (
            <SortableChapterItem key={chapter.id} chapter={chapter} />
          ))}
        </SortableContext>
      </DndContext>

      <div className='mt-8 p-4 bg-gray-50 rounded-lg'>
        <h3 className='text-sm font-medium text-gray-900 mb-2'>Instructions:</h3>
        <ul className='text-sm text-gray-600 space-y-1'>
          <li>• Click and drag the grip icon (⋮⋮) to reorder chapters</li>
          <li>• Changes are saved automatically when you drop a chapter</li>
          <li>• Chapter numbers will update automatically based on the new order</li>
        </ul>
      </div>
    </div>
  );
}
