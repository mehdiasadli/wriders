import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Chapter {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  order: number;
  status: 'DRAFT' | 'SOON' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: Date | null;
  content: string;
  _count: {
    reads: number;
    comments: number;
  };
}

interface TableOfContentsProps {
  chapters: Chapter[];
  bookSlug: string;
  isAuthor: boolean;
  searchParams: Promise<{ order?: string }>;
}

type OrderOption =
  | 'newest'
  | 'oldest'
  | 'longest'
  | 'shortest'
  | 'most-read'
  | 'most-discussed'
  | 'popular'
  | 'order-asc'
  | 'order-desc';

const orderOptions: { value: OrderOption; label: string }[] = [
  { value: 'order-asc', label: 'Chapter Order' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-read', label: 'Most Read' },
  { value: 'most-discussed', label: 'Most Discussed' },
  { value: 'longest', label: 'Longest' },
  { value: 'shortest', label: 'Shortest' },
  { value: 'popular', label: 'Popular' },
];

function sortChapters(chapters: Chapter[], order: OrderOption): Chapter[] {
  const sorted = [...chapters];

  switch (order) {
    case 'newest':
      return sorted.sort((a, b) => {
        if (!a.publishedAt && !b.publishedAt) return 0;
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

    case 'oldest':
      return sorted.sort((a, b) => {
        if (!a.publishedAt && !b.publishedAt) return 0;
        if (!a.publishedAt) return 1;
        if (!b.publishedAt) return -1;
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      });

    case 'longest':
      return sorted.sort((a, b) => b.content.length - a.content.length);

    case 'shortest':
      return sorted.sort((a, b) => a.content.length - b.content.length);

    case 'most-read':
      return sorted.sort((a, b) => b._count.reads - a._count.reads);

    case 'most-discussed':
      return sorted.sort((a, b) => b._count.comments - a._count.comments);

    case 'popular':
      return sorted.sort((a, b) => {
        // Popularity score: reads * 2 + comments * 3 + recency bonus
        const getRecencyBonus = (publishedAt: Date | null) => {
          if (!publishedAt) return 0;
          const daysSincePublished = (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60 * 24);
          return Math.max(0, 10 - daysSincePublished); // Bonus decreases over time
        };

        const scoreA = a._count.reads * 2 + a._count.comments * 3 + getRecencyBonus(a.publishedAt);
        const scoreB = b._count.reads * 2 + b._count.comments * 3 + getRecencyBonus(b.publishedAt);
        return scoreB - scoreA;
      });

    case 'order-asc':
      return sorted.sort((a, b) => a.order - b.order);

    case 'order-desc':
      return sorted.sort((a, b) => b.order - a.order);

    default:
      return sorted.sort((a, b) => a.order - b.order); // Default to chapter order
  }
}

export async function TableOfContents({ chapters, bookSlug, isAuthor, searchParams }: TableOfContentsProps) {
  const { order = 'order-asc' } = await searchParams;
  const currentOrder = order as OrderOption;

  // Filter chapters based on user type
  const visibleChapters = isAuthor ? chapters : chapters.filter((chapter) => chapter.status === 'PUBLISHED');

  const sortedChapters = sortChapters(visibleChapters, currentOrder);
  const publishedChapters = chapters.filter((chapter) => chapter.status === 'PUBLISHED');

  return (
    <div>
      {/* Header */}
      <div className='text-center mb-12'>
        <h2 className='text-4xl font-serif text-gray-900 mb-4'>Chapters</h2>

        <p className='text-sm text-gray-600 mb-6'>
          {publishedChapters.length} chapter{publishedChapters.length !== 1 ? 's' : ''} published
        </p>

        <div className='flex items-center justify-center gap-4'>
          {isAuthor && (
            <Link
              href={`/books/${bookSlug}/chapters/create`}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              Write New Chapter
            </Link>
          )}

          {isAuthor && chapters.length > 1 && (
            <Link
              href={`/books/${bookSlug}/reorder-chapters`}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              Reorder Chapters
            </Link>
          )}
        </div>
      </div>

      {/* Ordering Controls */}
      {visibleChapters.length > 1 && (
        <div className='mb-8 text-center'>
          <div className='flex flex-wrap items-center justify-center gap-4'>
            {orderOptions.map((option) => (
              <Link
                key={option.value}
                href={`?order=${option.value}`}
                className={`text-sm transition-colors border-b pb-1 ${
                  currentOrder === option.value
                    ? 'text-gray-900 border-gray-400'
                    : 'text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-400'
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Chapters List */}
      {sortedChapters.length > 0 ? (
        <div className='space-y-4'>
          {sortedChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} bookSlug={bookSlug} isAuthor={isAuthor} />
          ))}
        </div>
      ) : (
        /* No Chapters Message */
        <div className='text-center py-16'>
          <BookOpen className='w-8 h-8 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No chapters yet</h3>
          <p className='text-sm text-gray-600 mb-6'>
            {isAuthor
              ? 'Start writing your first chapter to bring your story to life.'
              : "This book doesn't have any chapters yet."}
          </p>
        </div>
      )}
    </div>
  );
}

function ChapterCard({ chapter, bookSlug, isAuthor }: { chapter: Chapter; bookSlug: string; isAuthor: boolean }) {
  const wordCount = chapter.content ? chapter.content.split(/\s+/).length : 0;

  return (
    <Link href={`/books/${bookSlug}/chapters/${chapter.slug}`}>
      <article className='border-b border-gray-200 pb-6 hover:bg-gray-50 transition-colors px-4 py-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Chapter Number and Status */}
          <div className='md:col-span-1'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-mono text-gray-900 font-medium'>Chapter {chapter.order}</span>
              {isAuthor && chapter.status !== 'PUBLISHED' && (
                <span className='text-xs text-gray-500'>
                  {chapter.status === 'DRAFT' ? '(Draft)' : '(Coming Soon)'}
                </span>
              )}
            </div>
          </div>

          {/* Title and Synopsis */}
          <div className='md:col-span-2'>
            <h3 className='text-lg font-serif text-gray-900 mb-2 hover:text-gray-700 transition-colors'>
              {chapter.title}
            </h3>
            {chapter.synopsis && <p className='text-sm text-gray-600 leading-relaxed'>{chapter.synopsis}</p>}
          </div>

          {/* Metadata */}
          <div className='md:col-span-1 space-y-1 text-sm text-gray-600'>
            <div className='flex items-center justify-between'>
              <span>Words</span>
              <span className='text-gray-900'>{wordCount}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Reads</span>
              <span className='text-gray-900'>{chapter._count.reads}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Comments</span>
              <span className='text-gray-900'>{chapter._count.comments}</span>
            </div>
            {chapter.publishedAt && (
              <div className='text-xs text-gray-500 mt-2'>{formatDistanceToNow(new Date(chapter.publishedAt))} ago</div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
