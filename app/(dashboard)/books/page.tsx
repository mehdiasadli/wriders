import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { BookOpen, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';

export async function generateMetadata() {
  return {
    title: 'Books',
    description: 'List of all published books on Wriders',
    openGraph: {
      title: 'Books',
      description: 'List of all published books on Wriders',
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/books`,
      siteName: 'Wriders',
      images: [],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Books',
      description: 'List of all published books on Wriders',
      images: [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL!}/books`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; order?: string }>;
}) {
  const user = await getCurrentUser();
  const { search, order } = await searchParams;

  // Build orderBy clause
  let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: 'desc' }; // default: recent first

  switch (order) {
    case 'oldest':
      orderBy = { createdAt: 'asc' };
      break;
    case 'popular':
      orderBy = { followers: { _count: 'desc' } };
      break;
    case 'largest':
      orderBy = { chapters: { _count: 'desc' } };
      break;
    case 'shortest':
      orderBy = { chapters: { _count: 'asc' } };
      break;
    case 'discussed':
      orderBy = { chapters: { _count: 'desc' } }; // Will be refined with comment counts
      break;
    case 'favorited':
      orderBy = { favoritedBy: { _count: 'desc' } };
      break;
    default:
      orderBy = { createdAt: 'desc' }; // recent first
  }

  const books = await prisma.book.findMany({
    where: {
      OR: user
        ? [
            { authorId: user.id },
            { visibility: 'PUBLIC', status: 'PUBLISHED' },
            { visibility: 'PRIVATE', status: 'PUBLISHED', followers: { some: { userId: user.id } } },
          ]
        : [
            { visibility: 'PUBLIC', status: 'PUBLISHED' }, // Only public books for unauthenticated users
          ],
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { synopsis: { contains: search, mode: 'insensitive' as const } },
          { author: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }),
    },
    include: {
      _count: {
        select: {
          favoritedBy: true,
          followers: true,
          chapters: true,
        },
      },
      chapters: {
        where: {
          OR: [{ status: 'PUBLISHED' }, { book: { authorId: user.id } }],
        },
        select: {
          title: true,
          status: true,
          order: true,
          _count: {
            select: {
              reads: true,
              comments: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      author: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy,
  });

  const totalBooks = books.length;

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-6xl font-serif text-gray-900 mb-4'>Books</h1>
          <p className='text-sm text-gray-600 mb-8'>A collection of stories waiting to be discovered</p>

          <Link
            href='/books/create'
            className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
          >
            Create New Book
          </Link>
        </div>

        {/* Search and Filter */}
        <div className='mb-12'>
          <form className='max-w-2xl mx-auto'>
            <div className='mb-6'>
              <input
                type='text'
                placeholder='Search books, authors, or series...'
                className='w-full px-4 py-3 text-sm border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 bg-white'
                defaultValue={search}
                name='search'
              />
            </div>

            <div className='flex items-center justify-center gap-8 text-sm'>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='order'
                  value='recent'
                  defaultChecked={!order || order === 'recent'}
                  className='w-3 h-3'
                />
                <span className='text-gray-600'>Recent</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='order'
                  value='oldest'
                  defaultChecked={order === 'oldest'}
                  className='w-3 h-3'
                />
                <span className='text-gray-600'>Oldest</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='order'
                  value='popular'
                  defaultChecked={order === 'popular'}
                  className='w-3 h-3'
                />
                <span className='text-gray-600'>Popular</span>
              </label>
              <label className='flex items-center gap-2'>
                <input
                  type='radio'
                  name='order'
                  value='largest'
                  defaultChecked={order === 'largest'}
                  className='w-3 h-3'
                />
                <span className='text-gray-600'>Most Chapters</span>
              </label>
            </div>

            <div className='text-center mt-6'>
              <button
                type='submit'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className='mb-8 text-center'>
          <p className='text-sm text-gray-500'>
            {totalBooks} book{totalBooks !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Books List */}
        {books.length === 0 ? (
          <div className='text-center py-16'>
            <BookOpen className='w-8 h-8 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No books found</h3>
            <p className='text-sm text-gray-600 mb-6'>
              {search ? `No books match your search for "${search}"` : 'No books are available yet.'}
            </p>
            <Link
              href={search ? '/books' : '/books/create'}
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              {search ? 'Clear search' : 'Create the first book'}
            </Link>
          </div>
        ) : (
          <div className='space-y-8'>
            {books.map((book) => {
              const totalReads = book.chapters.reduce((sum, ch) => sum + ch._count.reads, 0);
              const totalComments = book.chapters.reduce((sum, ch) => sum + ch._count.comments, 0);

              return (
                <Link key={book.id} href={`/books/${book.slug}`}>
                  <article className='border-b border-gray-200 pb-8 hover:bg-gray-50 transition-colors px-4 py-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                      {/* Main Content */}
                      <div className='md:col-span-2'>
                        <h2 className='text-2xl font-serif text-gray-900 mb-2'>{book.title}</h2>

                        <div className='flex items-center gap-4 text-sm text-gray-600 mb-4'>
                          <div className='flex items-center gap-1'>
                            <User className='w-4 h-4' />
                            <span>{book.author.name}</span>
                          </div>
                          {book.publishedAt && (
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-4 h-4' />
                              <span>{formatDistanceToNow(new Date(book.publishedAt))} ago</span>
                            </div>
                          )}
                        </div>

                        <p className='text-gray-700 leading-relaxed text-sm'>
                          {book.synopsis || 'No synopsis available.'}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className='space-y-3 text-sm text-gray-600'>
                        <div>
                          <span className='font-medium text-gray-900'>Statistics</span>
                        </div>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span>Chapters</span>
                            <span className='text-gray-900'>{book.chapters.length}</span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span>Reads</span>
                            <span className='text-gray-900'>{totalReads}</span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span>Comments</span>
                            <span className='text-gray-900'>{totalComments}</span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span>Followers</span>
                            <span className='text-gray-900'>{book._count.followers}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
