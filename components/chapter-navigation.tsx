'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, List, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Chapter {
  id: string;
  slug: string;
  title: string;
  order: number;
  status: 'DRAFT' | 'SOON' | 'PUBLISHED' | 'ARCHIVED';
}

interface ChapterNavigationProps {
  bookSlug: string;
  currentChapterSlug: string;
  previousChapter: Chapter | null;
  nextChapter: Chapter | null;
  allChapters: Chapter[];
  className?: string;
}

export function ChapterNavigation({
  bookSlug,
  currentChapterSlug,
  previousChapter,
  nextChapter,
  allChapters,
  className,
}: ChapterNavigationProps) {
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Previous Chapter Button */}
      <Button
        asChild
        variant='outline'
        size='sm'
        className={cn(
          'flex items-center gap-2 transition-all duration-200',
          previousChapter ? 'hover:bg-gray-100 hover:border-gray-300' : 'opacity-50 cursor-not-allowed'
        )}
        disabled={!previousChapter}
      >
        {previousChapter ? (
          <Link href={`/books/${bookSlug}/chapters/${previousChapter.slug}`}>
            <ChevronLeft className='w-4 h-4' />
            <span className='hidden sm:inline'>{previousChapter.title}</span>
          </Link>
        ) : (
          <div className='flex items-center gap-2'>
            <ChevronLeft className='w-4 h-4' />
            <span className='hidden sm:inline'>No previous chapter</span>
          </div>
        )}
      </Button>

      {/* Chapter List Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => setIsChapterListOpen(!isChapterListOpen)}
        className='flex items-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200'
      >
        <List className='w-4 h-4' />
        <span className='hidden sm:inline'>Chapters</span>
      </Button>

      {/* Next Chapter Button */}
      <Button
        asChild
        variant='outline'
        size='sm'
        className={cn(
          'flex items-center gap-2 transition-all duration-200',
          nextChapter ? 'hover:bg-gray-100 hover:border-gray-300' : 'opacity-50 cursor-not-allowed'
        )}
        disabled={!nextChapter}
      >
        {nextChapter ? (
          <Link href={`/books/${bookSlug}/chapters/${nextChapter.slug}`}>
            <span className='hidden sm:inline'>{nextChapter.title}</span>
            <ChevronRight className='w-4 h-4' />
          </Link>
        ) : (
          <div className='flex items-center gap-2'>
            <span className='hidden sm:inline'>No next chapter</span>
            <ChevronRight className='w-4 h-4' />
          </div>
        )}
      </Button>

      {/* Chapter List Dropdown */}
      {isChapterListOpen && (
        <div className='absolute top-full left-0 right-0 mt-2 z-50'>
          <Card className='shadow-xl border-gray-200'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='font-semibold text-gray-900'>Chapters</h3>
                <Button variant='ghost' size='sm' onClick={() => setIsChapterListOpen(false)} className='h-8 w-8 p-0'>
                  <X className='w-4 h-4' />
                </Button>
              </div>

              <div className='max-h-64 overflow-y-auto space-y-1'>
                {allChapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    href={`/books/${bookSlug}/chapters/${chapter.slug}`}
                    onClick={() => setIsChapterListOpen(false)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50',
                      chapter.slug === currentChapterSlug
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:border-gray-200'
                    )}
                  >
                    <div className='flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center'>
                      <span className='text-sm font-medium text-gray-700'>{chapter.order}</span>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <h4 className='font-medium text-gray-900 truncate'>{chapter.title}</h4>
                        {chapter.status !== 'PUBLISHED' && (
                          <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                            {chapter.status === 'DRAFT' ? 'Draft' : 'Coming Soon'}
                          </span>
                        )}
                      </div>
                    </div>
                    {chapter.slug === currentChapterSlug && (
                      <div className='flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full'></div>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
