import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { calculateReadingTime, getWordCount } from '@/lib/utils';
import { Metadata } from 'next';
import '@/components/chapter-content.css';
import { ChapterShareOptions } from '@/components/chapter-share-options';
import { MarkAsReadButton } from '@/components/mark-as-read-button';
import { FavoriteChapterButton } from '@/components/favorite-chapter-button';
import { DeleteChapterButton } from '@/components/delete-chapter-button';
import { ChapterStructuredData } from '@/components/structured-data';

// Generate static params for published chapters
export async function generateStaticParams() {
  const chapters = await prisma.chapter.findMany({
    where: {
      status: 'PUBLISHED',
      book: {
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
    },
    select: {
      slug: true,
      book: { select: { slug: true } },
      _count: {
        select: {
          reads: true,
          comments: true,
        },
      },
    },
    take: 2000, // Limit to prevent excessive build times
    orderBy: [
      { reads: { _count: 'desc' } }, // Popular chapters first
      { publishedAt: 'desc' }, // Then recent
    ],
  });

  return chapters.map((chapter) => ({
    slug: chapter.book.slug,
    chapterSlug: chapter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { slug, chapterSlug } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
      book: {
        slug,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
      status: 'PUBLISHED',
    },
    select: {
      title: true,
      order: true,
      synopsis: true,
      content: true,
      publishedAt: true,
      updatedAt: true,
      _count: {
        select: {
          reads: true,
          comments: true,
          favoritedBy: true,
        },
      },
      book: {
        select: {
          title: true,
          slug: true,
          synopsis: true,
          author: {
            select: {
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              chapters: true,
            },
          },
        },
      },
    },
  });

  if (!chapter) {
    return {
      title: 'Chapter Not Found',
      description: 'The requested chapter could not be found on Wriders.',
      robots: { index: false, follow: false },
    };
  }

  const wordCount = getWordCount(chapter.content || '');
  const readingTime = calculateReadingTime(wordCount, 238); // Default WPM
  const readCount = chapter._count.reads;
  const commentCount = chapter._count.comments;
  const favoriteCount = chapter._count.favoritedBy;

  const description =
    chapter.synopsis ||
    `Chapter ${chapter.order} of ${chapter.book.title} by ${chapter.book.author.name}. ${wordCount} words, ${readingTime} min read. ${readCount} reads, ${commentCount} comments on Wriders.`;

  const keywords = [
    chapter.title,
    chapter.book.title,
    chapter.book.author.name,
    'chapter',
    'story',
    'novel',
    'fiction',
    'online reading',
    'free chapter',
    `chapter ${chapter.order}`,
    'serial story',
    'wriders',
    'literature',
    'book chapter',
  ];

  return {
    title: `${chapter.title} - ${chapter.book.title} (Chapter ${chapter.order})`,
    description,
    keywords,
    authors: [
      { name: chapter.book.author.name, url: `${process.env.NEXT_PUBLIC_APP_URL!}/users/${chapter.book.author.slug}` },
    ],
    creator: chapter.book.author.name,
    publisher: 'Wriders',
    openGraph: {
      type: 'article',
      title: `${chapter.title} - ${chapter.book.title}`,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${slug}/chapters/${chapterSlug}`,
      siteName: 'Wriders',
      locale: 'en_US',
      images: [
        {
          url: '/wriders-og.png',
          width: 1200,
          height: 630,
          alt: `${chapter.title} - Chapter ${chapter.order} of ${chapter.book.title} by ${chapter.book.author.name}`,
          type: 'image/png',
        },
      ],
      authors: [chapter.book.author.name],
      publishedTime: chapter.publishedAt?.toISOString(),
      modifiedTime: chapter.updatedAt?.toISOString(),
      section: 'Chapters',
      tags: ['chapter', 'story', 'novel', 'fiction', 'online reading', `chapter-${chapter.order}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${chapter.title} - ${chapter.book.title}`,
      description,
      images: ['/wriders-og.png'],
      creator: '@wriders',
      site: '@wriders',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${slug}/chapters/${chapterSlug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      // Article-specific meta tags
      'article:author': `${process.env.NEXT_PUBLIC_APP_URL!}/users/${chapter.book.author.slug}`,
      'article:published_time': chapter.publishedAt?.toISOString() || '',
      'article:modified_time': chapter.updatedAt?.toISOString() || '',
      'article:section': 'Chapters',
      'article:tag': `chapter,story,novel,fiction,${chapter.book.title.toLowerCase()}`,
      // Reading-specific meta tags
      'reading:time': `${readingTime}`,
      'reading:word_count': `${wordCount}`,
      'reading:chapter_number': `${chapter.order}`,
      'reading:total_chapters': `${chapter.book._count.chapters}`,
      // Book series meta tags
      'book:author': chapter.book.author.name,
      'book:series': chapter.book.title,
      'book:chapter': `${chapter.order}`,
    },
  };
}

interface ChapterPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug, chapterSlug } = await params;
  const session = await auth();

  const { wpm } = session?.user?.id
    ? ((await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: { wpm: true },
      })) ?? { wpm: 238 })
    : { wpm: 238 };

  const chapter = await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
      book: {
        slug,
      },
    },
    include: {
      book: {
        select: {
          title: true,
          slug: true,
          author: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          reads: true,
          comments: true,
        },
      },
    },
  });

  // Get all chapters for navigation
  const allChapters = await prisma.chapter.findMany({
    where: {
      book: {
        slug,
      },
      OR: session?.user?.id
        ? [{ status: 'PUBLISHED' }, { book: { authorId: session.user.id } }]
        : [{ status: 'PUBLISHED' }],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      order: true,
      status: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Find navigation chapters
  const currentChapterIndex = allChapters.findIndex((ch) => ch.slug === chapterSlug);
  const previousChapter = currentChapterIndex > 0 ? allChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < allChapters.length - 1 ? allChapters[currentChapterIndex + 1] : null;

  if (!chapter) {
    redirect('/books');
  }

  const wordCount = getWordCount(chapter.content);
  const readingTime = calculateReadingTime(wordCount, wpm);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-16'>
          <Link href={`/books/${slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← {chapter.book.title}
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-2'>{chapter.title}</h1>

          <p className='text-sm text-gray-500'>
            #{chapter.order} Chapter • {readingTime} min. read
          </p>
        </div>

        {/* Content */}
        <div className='prose prose-lg max-w-none'>
          <div
            className='chapter-content'
            dangerouslySetInnerHTML={{ __html: chapter.content || '<p>No content available.</p>' }}
          />
        </div>

        {/* Chapter Actions */}
        {session?.user && (
          <div className='mt-8 pt-6 border-t border-gray-200'>
            <div className='flex items-center justify-center gap-6'>
              <FavoriteChapterButton chapterSlug={chapterSlug} />
              <MarkAsReadButton chapterSlug={chapterSlug} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='mt-16 pt-8 border-t border-gray-200 text-center space-y-6'>
          {/* Quick Actions */}
          <div className='flex items-center justify-center gap-6 text-sm'>
            <Link
              href={`/books/${slug}/chapters/${chapterSlug}/comments`}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              Discussion ({chapter._count.comments})
            </Link>

            <Link
              href={`/books/${slug}/chapters/${chapterSlug}/download`}
              className='text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              Download
            </Link>

            {(chapter.status === 'PUBLISHED' || chapter.status === 'SOON') && (
              <ChapterShareOptions
                chapterTitle={chapter.title}
                chapterUrl={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/books/${slug}/chapters/${chapterSlug}`}
                bookTitle={chapter.book.title}
                authorName={chapter.book.author.name}
              />
            )}

            {/* Author Edit Links */}
            {session?.user && session.user.id === chapter.book.author.id && (
              <>
                <Link
                  href={`/books/${slug}/chapters/${chapterSlug}/edit`}
                  className='text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
                >
                  Edit Chapter
                </Link>
                <Link
                  href={`/books/${slug}/chapters/${chapterSlug}/edit/content`}
                  className='text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
                >
                  Edit Content
                </Link>
                <DeleteChapterButton chapterId={chapter.id} chapterTitle={chapter.title} />
              </>
            )}
          </div>

          {/* Chapter Navigation */}
          <div className='pt-4 border-t border-gray-200'>
            <div className='flex items-center justify-center gap-8'>
              {previousChapter ? (
                <Link
                  href={`/books/${slug}/chapters/${previousChapter.slug}`}
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                >
                  ← {previousChapter.title}
                </Link>
              ) : (
                <span className='text-sm text-gray-400'>← Previous</span>
              )}

              <Link
                href={`/books/${slug}`}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-3 py-1'
              >
                All Chapters
              </Link>

              {nextChapter ? (
                <Link
                  href={`/books/${slug}/chapters/${nextChapter.slug}`}
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                >
                  {nextChapter.title} →
                </Link>
              ) : (
                <span className='text-sm text-gray-400'>Next →</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className='pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1'>
            <div>
              {wordCount} words • {chapter._count.reads} reads
            </div>
            <div>
              <Link href={`/books/${slug}`} className='hover:text-gray-700 transition-colors'>
                {chapter.book.title}
              </Link>
              {' by '}
              <Link href={`/users/${chapter.book.author.slug}`} className='hover:text-gray-700 transition-colors'>
                {chapter.book.author.name}
              </Link>
            </div>
            {chapter.publishedAt && <div>Published {formatDistanceToNow(new Date(chapter.publishedAt))} ago</div>}
          </div>
        </div>
      </div>

      {/* Structured Data for SEO */}
      <ChapterStructuredData
        chapter={chapter}
        bookSlug={slug}
        chapterSlug={chapterSlug}
        wordCount={wordCount}
        readingTime={readingTime}
      />
    </div>
  );
}
