import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Calendar, Eye, Heart, MessageCircle, BookOpen, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { TableOfContents } from '@/components/table-of-contents';
import { FavoriteBookButton } from '@/components/favorite-book-button';
import { FollowBookButton } from '@/components/follow-book-button';

// generate static params
export async function generateStaticParams() {
  const books = await prisma.book.findMany({
    where: {
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
    },
    select: { slug: true },
  });

  return books.map((book) => ({
    slug: book.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await prisma.book.findUnique({
    where: { slug },
    select: { title: true, synopsis: true, slug: true },
  });

  if (!book) {
    notFound();
  }

  return {
    title: book.title,
    description: book.synopsis,
    openGraph: {
      title: book.title,
      description: book.synopsis,
      url: `https://wriders.com/books/${book.slug}`,
      siteName: 'Wriders',
      images: [],
    },
    twitter: {
      card: 'summary_large_image',
      title: book.title,
    },
    alternates: {
      canonical: `https://wriders.com/books/${book.slug}`,
    },
    robots: {
      index: true,
    },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const book = await prisma.book.findUnique({
    where: {
      slug,
      OR: [
        { authorId: user.id },
        { visibility: 'PUBLIC', status: 'PUBLISHED' },
        { visibility: 'PRIVATE', status: 'PUBLISHED', followers: { some: { userId: user.id } } },
      ],
    },
    include: {
      wikiPages: {
        take: 10,
        select: {
          wikiPage: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      followers: {
        select: {
          user: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      favoritedBy: {
        select: {
          user: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
      series: {
        select: {
          slug: true,
          title: true,
          _count: {
            select: {
              books: true,
            },
          },
        },
      },
      chapters: {
        where: {
          OR: [{ status: 'PUBLISHED' }, { book: { authorId: user.id } }],
        },
        select: {
          id: true,
          status: true,
          publishedAt: true,
          order: true,
          slug: true,
          title: true,
          synopsis: true,
          content: true,
          _count: {
            select: {
              comments: true,
              favoritedBy: true,
              reads: true,
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
  });

  if (!book) {
    notFound();
  }

  const isAuthor = book.authorId === user.id;
  const isFollowing = book.followers.some((f) => f.user.slug === user.slug);
  const isFavorited = book.favoritedBy.some((f) => f.user.slug === user.slug);

  const totalReads = book.chapters.reduce((sum, ch) => sum + ch._count.reads, 0);
  const totalComments = book.chapters.reduce((sum, ch) => sum + ch._count.comments, 0);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href='/books' className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Back to Books
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>{book.title}</h1>

          <div className='flex items-center justify-center gap-4 text-sm text-gray-600 mb-6'>
            <div className='flex items-center gap-1'>
              <User className='w-4 h-4' />
              <Link href={`/users/${book.author.slug}`} className='hover:text-gray-900 transition-colors'>
                {book.author.name}
              </Link>
            </div>
            {book.publishedAt && (
              <div className='flex items-center gap-1'>
                <Calendar className='w-4 h-4' />
                <span>Published {formatDistanceToNow(new Date(book.publishedAt))} ago</span>
              </div>
            )}
          </div>

          {book.synopsis && <p className='text-gray-700 leading-relaxed max-w-2xl mx-auto mb-8'>{book.synopsis}</p>}

          {/* Actions */}
          <div className='flex items-center justify-center gap-4'>
            {isAuthor ? (
              <div className='flex flex-col items-center gap-4'>
                <div className='flex items-center gap-4'>
                  <FollowBookButton bookSlug={book.slug} />
                  <FavoriteBookButton bookSlug={book.slug} />
                </div>
                <Link
                  href={`/books/${book.slug}/edit`}
                  className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
                >
                  Edit Book
                </Link>
              </div>
            ) : (
              user && (
                <>
                  <FollowBookButton bookSlug={book.slug} />
                  <FavoriteBookButton bookSlug={book.slug} />
                </>
              )
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-center'>
          <div>
            <div className='text-2xl font-serif text-gray-900 mb-1'>{book.chapters.length}</div>
            <div className='text-sm text-gray-600'>Chapters</div>
          </div>
          <div>
            <div className='text-2xl font-serif text-gray-900 mb-1'>{totalReads}</div>
            <div className='text-sm text-gray-600'>Reads</div>
          </div>
          <div>
            <div className='text-2xl font-serif text-gray-900 mb-1'>{totalComments}</div>
            <div className='text-sm text-gray-600'>Comments</div>
          </div>
          <div>
            <div className='text-2xl font-serif text-gray-900 mb-1'>{book.followers.length}</div>
            <div className='text-sm text-gray-600'>Followers</div>
          </div>
        </div>

        {/* Series Information */}
        {book.series && (
          <div className='mb-12 text-center'>
            <p className='text-sm text-gray-600 mb-2'>Part of series</p>
            <Link
              href={`/series/${book.series.slug}`}
              className='text-lg font-serif text-gray-900 hover:text-gray-700 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
            >
              {book.series.title}
            </Link>
            <p className='text-sm text-gray-500 mt-1'>
              {book.series._count.books} book{book.series._count.books !== 1 ? 's' : ''} in this series
            </p>
          </div>
        )}

        {/* Table of Contents */}
        <TableOfContents
          chapters={book.chapters.map((chapter) => ({
            id: chapter.id,
            slug: chapter.slug,
            title: chapter.title,
            synopsis: chapter.synopsis,
            order: chapter.order,
            status: chapter.status,
            publishedAt: chapter.publishedAt,
            content: chapter.content,
            _count: {
              reads: chapter._count.reads,
              comments: chapter._count.comments,
            },
          }))}
          bookSlug={book.slug}
          isAuthor={isAuthor}
          searchParams={searchParams}
        />

        {/* Additional Information */}
        <div className='mt-16 space-y-8'>
          {/* Wiki Pages */}
          {book.wikiPages.length > 0 && (
            <div>
              <h2 className='text-2xl font-serif text-gray-900 mb-6 text-center'>World & Characters</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {book.wikiPages.map(({ wikiPage }) => (
                  <Link
                    key={wikiPage.slug}
                    href={`/wiki/${wikiPage.slug}`}
                    className='block p-4 border border-gray-200 hover:bg-gray-50 transition-colors'
                  >
                    <h3 className='font-medium text-gray-900'>{wikiPage.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Followers */}
          {book.followers.length > 0 && (
            <div>
              <h2 className='text-2xl font-serif text-gray-900 mb-6 text-center'>Readers</h2>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center'>
                {book.followers.slice(0, 12).map(({ user }) => (
                  <Link key={user.slug} href={`/users/${user.slug}`} className='block'>
                    <div className='text-sm text-gray-600 hover:text-gray-900 transition-colors'>{user.name}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
