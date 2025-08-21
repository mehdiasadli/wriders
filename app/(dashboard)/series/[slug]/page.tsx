import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { getCurrentUser } from '@/lib/auth-utils';

interface SeriesPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;

  const series = await prisma.series.findUnique({
    where: { slug },
    select: { title: true, synopsis: true },
  });

  if (!series) {
    return {
      title: 'Series Not Found | SAG',
    };
  }

  return {
    title: `${series.title} | Series | SAG`,
    description: series.synopsis || `Explore the ${series.title} series.`,
  };
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const series = await prisma.series.findUnique({
    where: {
      slug,
    },
    include: {
      books: {
        where: {
          OR: [{ visibility: 'PUBLIC' }, { authorId: user?.id }],
        },
        include: {
          _count: {
            select: {
              chapters: true,
              followers: true,
              favoritedBy: true,
            },
          },
          chapters: {
            where: {
              OR: [{ status: 'PUBLISHED' }, { book: { authorId: user?.id } }],
            },
            select: {
              status: true,
            },
          },
          author: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: {
          orderInSeries: 'asc',
        },
      },
    },
  });

  if (!series) {
    notFound();
  }

  // Check if user is author of any book in the series
  const isAuthor = series.books.some((book) => book.authorId === user?.id);
  const publishedBooks = series.books.filter((book) => book.visibility === 'PUBLIC');
  const totalChapters = series.books.reduce((sum, book) => sum + book._count.chapters, 0);
  const publishedChapters = series.books.reduce(
    (sum, book) => sum + book.chapters.filter((ch) => ch.status === 'PUBLISHED').length,
    0
  );

  // Get the first book's author for display (assuming all books have same author)
  const firstBook = series.books[0];
  const seriesAuthor = firstBook?.author;

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href='/series' className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Back to Series
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-4'>{series.title}</h1>

          <div className='text-sm text-gray-600 space-y-1'>
            {seriesAuthor && (
              <div>
                by{' '}
                <Link
                  href={`/users/${seriesAuthor.slug}`}
                  className='text-gray-900 hover:text-gray-700 transition-colors'
                >
                  {seriesAuthor.name}
                </Link>
              </div>
            )}
            <div className='text-gray-500'>
              {series.books.length} book{series.books.length !== 1 ? 's' : ''} • {publishedChapters} chapters
            </div>
          </div>

          {isAuthor && (
            <div className='mt-8'>
              <Link
                href={`/books/create?seriesId=${series.id}`}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
              >
                Add Book to Series
              </Link>
            </div>
          )}
        </div>

        {/* Synopsis */}
        {series.synopsis && (
          <div className='max-w-4xl mx-auto mb-12 text-center'>
            <p className='text-sm text-gray-700 leading-relaxed'>{series.synopsis}</p>
          </div>
        )}

        {/* Books List */}
        <div className='max-w-4xl mx-auto'>
          {series.books.length > 0 ? (
            <div className='space-y-8'>
              {series.books.map((book) => (
                <article key={book.id} className='border-b border-gray-200 pb-8 last:border-b-0'>
                  <div className='flex justify-between items-start mb-4'>
                    <div className='flex-1'>
                      <Link href={`/books/${book.slug}`}>
                        <h2 className='text-2xl font-serif text-gray-900 hover:text-gray-700 transition-colors mb-2'>
                          {book.title}
                        </h2>
                      </Link>

                      <div className='text-sm text-gray-600 space-x-4'>
                        {book.orderInSeries && <span>Book {book.orderInSeries}</span>}
                        <span>{book._count.chapters} chapters</span>
                        <span>{book._count.followers} followers</span>
                        {book.visibility === 'PRIVATE' && <span className='text-gray-500'>(Private)</span>}
                      </div>
                    </div>

                    <div className='text-xs text-gray-500'>{formatDistanceToNow(new Date(book.createdAt))} ago</div>
                  </div>

                  {book.synopsis && <p className='text-sm text-gray-700 leading-relaxed'>{book.synopsis}</p>}
                </article>
              ))}
            </div>
          ) : (
            /* No Books Message */
            <div className='text-center py-16'>
              <h3 className='text-lg font-serif text-gray-900 mb-2'>No books yet</h3>
              <p className='text-sm text-gray-600 mb-8'>
                {isAuthor
                  ? 'Start adding books to this series to bring your story to life.'
                  : "This series doesn't have any books yet."}
              </p>
              {isAuthor && (
                <Link
                  href='/books/create'
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
                >
                  Add First Book
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
