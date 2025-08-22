import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ContentStatus, BookVisibility } from '@prisma/client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home - Discover Stories and Authors',
  description:
    'Explore the latest books and chapters from talented writers. Join the Wriders community to discover amazing stories and connect with authors.',
  keywords: ['latest books', 'new stories', 'recent chapters', 'book discovery', 'author community'],
  openGraph: {
    title: 'Home - Discover Stories and Authors | Wriders',
    description:
      'Explore the latest books and chapters from talented writers. Join the Wriders community to discover amazing stories and connect with authors.',
    url: process.env.NEXT_PUBLIC_APP_URL!,
    type: 'website',
  },
  twitter: {
    title: 'Home - Discover Stories and Authors | Wriders',
    description:
      'Explore the latest books and chapters from talented writers. Join the Wriders community to discover amazing stories and connect with authors.',
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL!,
  },
};

type BookWithAuthor = {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  status: ContentStatus;
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    name: string;
    slug: string;
  };
  _count: {
    chapters: number;
  };
};

type ChapterWithBook = {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  order: number;
  publishedAt: Date | null;
  book: {
    title: string;
    slug: string;
    author: {
      name: string;
      slug: string;
    };
  };
  _count: {
    comments: number;
  };
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const userId = user?.id;

  const data = await prisma.$transaction(async (tx) => {
    // Visibility conditions for books/chapters
    const bookVisibilityWhere = userId
      ? {
          OR: [
            { authorId: userId },
            {
              status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
              visibility: BookVisibility.PUBLIC,
            },
            {
              status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
              visibility: BookVisibility.PRIVATE,
              followers: { some: { userId } },
            },
          ],
        }
      : {
          status: { in: [ContentStatus.SOON, ContentStatus.PUBLISHED] },
          visibility: BookVisibility.PUBLIC,
        };

    // Recent Books (3 items)
    const recentBooks = await tx.book.findMany({
      take: 3,
      where: bookVisibilityWhere,
      select: {
        id: true,
        slug: true,
        title: true,
        synopsis: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { chapters: true },
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    // Recent Chapters (4 items)
    const recentChapters = await tx.chapter.findMany({
      take: 4,
      where: {
        status: ContentStatus.PUBLISHED,
        book: bookVisibilityWhere,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        synopsis: true,
        order: true,
        publishedAt: true,
        book: {
          select: {
            title: true,
            slug: true,
            author: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return {
      recentBooks,
      recentChapters,
    };
  });

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <h1 className='text-3xl font-serif text-gray-900 mb-2'>
            {user ? `Welcome back, ${user.name}` : 'Welcome to wriders'}
          </h1>
          <p className='text-sm text-gray-600'>
            {user
              ? "Here's what's new in your reading community"
              : 'Discover stories, connect with authors, and join the conversation'}
          </p>
        </div>

        {/* Recent Books Section */}
        {data.recentBooks.length > 0 && (
          <section className='mb-12'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-serif text-gray-900'>Recent Books</h2>
              <Link
                href='/explore'
                className='text-sm text-gray-600 hover:text-gray-900 border-b border-dotted border-gray-400 hover:border-gray-600'
              >
                View all
              </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {data.recentBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Chapters Section */}
        {data.recentChapters.length > 0 && (
          <section className='mb-12'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-2xl font-serif text-gray-900'>Latest Chapters</h2>
              <Link
                href='/explore'
                className='text-sm text-gray-600 hover:text-gray-900 border-b border-dotted border-gray-400 hover:border-gray-600'
              >
                View all
              </Link>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {data.recentChapters.map((chapter) => (
                <ChapterCard key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {data.recentBooks.length === 0 && data.recentChapters.length === 0 && (
          <div className='text-center py-12'>
            <h3 className='text-xl font-serif text-gray-900 mb-2'>No content yet</h3>
            <p className='text-gray-600 mb-6'>
              {user
                ? 'Follow some authors to see activity here.'
                : 'Sign up to discover amazing stories and connect with authors.'}
            </p>
            {!user && (
              <Link
                href='/auth/signup'
                className='inline-block px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors'
              >
                Get Started
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({ book }: { book: BookWithAuthor }) {
  return (
    <Link href={`/books/${book.slug}`}>
      <article className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white h-full flex flex-col group'>
        <div className='flex items-start justify-between mb-4'>
          <span className='text-xs text-gray-700 bg-white border border-gray-300 px-2 py-1'>Book</span>
          {book.status && (
            <span className='text-xs text-gray-500 border border-gray-300 px-2 py-1 bg-white'>{book.status}</span>
          )}
        </div>

        <div className='flex-1'>
          <h3 className='text-lg font-serif text-gray-900 mb-3 group-hover:text-gray-700 transition-colors'>
            {book.title}
          </h3>

          <p className='text-sm text-gray-600 mb-3'>by {book.author.name}</p>

          {book.synopsis && <p className='text-sm text-gray-500 leading-relaxed'>{book.synopsis}</p>}
        </div>

        <div className='mt-6 pt-4 border-t border-gray-100'>
          <p className='text-xs text-gray-500'>
            {book._count.chapters} chapters
            {book.publishedAt && <span> • Published {new Date(book.publishedAt).toLocaleDateString()}</span>}
          </p>
        </div>
      </article>
    </Link>
  );
}

function ChapterCard({ chapter }: { chapter: ChapterWithBook }) {
  return (
    <Link href={`/books/${chapter.book.slug}/chapters/${chapter.slug}`}>
      <article className='border border-gray-200 hover:border-gray-400 transition-colors p-6 bg-white flex flex-col group'>
        <div className='flex items-start justify-between mb-4'>
          <span className='text-xs text-gray-700 bg-white border border-gray-300 px-2 py-1'>Chapter</span>
          <span className='text-xs text-gray-500'>Chapter {chapter.order}</span>
        </div>

        <h3 className='text-lg font-serif text-gray-900 mb-3 group-hover:text-gray-700 transition-colors'>
          {chapter.title}
        </h3>

        <p className='text-sm text-gray-600 mb-3'>
          {chapter.book.title} by {chapter.book.author.name}
        </p>

        {chapter.synopsis && <p className='text-sm text-gray-500 leading-relaxed mb-4'>{chapter.synopsis}</p>}

        <div className='mt-auto pt-4 border-t border-gray-100'>
          <p className='text-xs text-gray-500'>
            {chapter._count.comments} comments
            {chapter.publishedAt && <span> • Published {new Date(chapter.publishedAt).toLocaleDateString()}</span>}
          </p>
        </div>
      </article>
    </Link>
  );
}
