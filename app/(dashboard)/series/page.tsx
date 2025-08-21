import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: 'Series | SAG',
  description: 'Explore book series and collections.',
};

export default async function SeriesPage() {
  const user = await getCurrentUser();

  const series = await prisma.series.findMany({
    include: {
      _count: {
        select: {
          books: true,
        },
      },
      books: {
        where: {
          OR: [{ visibility: 'PUBLIC' }, { authorId: user?.id }],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          visibility: true,
        },
        orderBy: {
          orderInSeries: 'asc',
        },
        take: 3, // Show first 3 books
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-6xl font-serif text-gray-900 mb-4'>Series</h1>
          <p className='text-sm text-gray-600 mb-8'>Collections and book series from our community</p>

          {user && (
            <Link
              href='/series/create'
              className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
            >
              Create New Series
            </Link>
          )}
        </div>

        {/* Series List */}
        {series.length > 0 ? (
          <div className='max-w-4xl mx-auto space-y-8'>
            {series.map((serie) => (
              <article key={serie.id} className='border-b border-gray-200 pb-8 last:border-b-0'>
                <Link href={`/series/${serie.slug}`}>
                  <h2 className='text-2xl font-serif text-gray-900 hover:text-gray-700 transition-colors mb-2'>
                    {serie.title}
                  </h2>
                </Link>

                <div className='text-sm text-gray-600 mb-4'>
                  {serie._count.books} book{serie._count.books !== 1 ? 's' : ''}
                </div>

                {serie.synopsis && <p className='text-sm text-gray-700 mb-4 leading-relaxed'>{serie.synopsis}</p>}

                {/* Books in series */}
                {serie.books.length > 0 && (
                  <div className='space-y-1'>
                    {serie.books.map((book, index) => (
                      <div key={book.id} className='text-sm text-gray-600'>
                        {index + 1}. {book.title}
                        {book.visibility === 'PRIVATE' && <span className='text-xs text-gray-500 ml-2'>(Private)</span>}
                      </div>
                    ))}
                    {serie._count.books > 3 && (
                      <div className='text-sm text-gray-500'>+{serie._count.books - 3} more</div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          /* No Series Message */
          <div className='text-center py-16'>
            <h3 className='text-lg font-serif text-gray-900 mb-2'>No series yet</h3>
            <p className='text-sm text-gray-600 mb-8'>
              {user ? 'Create your first series to organize your books.' : 'No series have been created yet.'}
            </p>
            {user && (
              <Link
                href='/series/create'
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
              >
                Create First Series
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
