import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Calendar, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { TableOfContents } from '@/components/table-of-contents';
import { FavoriteBookButton } from '@/components/favorite-book-button';
import { FollowBookButton } from '@/components/follow-book-button';
import { DeleteBookButton } from '@/components/delete-book-button';
import { BookStructuredData } from '@/components/structured-data';
import { Metadata } from 'next';

// export const revalidate = 3600; // 1 hour

// // Generate static params for published public books
// export async function generateStaticParams() {
//   const books = await prisma.book.findMany({
//     where: {
//       visibility: 'PUBLIC',
//       status: 'PUBLISHED',
//     },
//     select: { slug: true },
//     take: 1000, // Limit to prevent excessive build times
//     orderBy: [
//       { followers: { _count: 'desc' } }, // Popular books first
//       { publishedAt: 'desc' }, // Then recent
//     ],
//   });

//   return books.map((book) => ({
//     slug: book.slug,
//   }));
// }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await prisma.book.findUnique({
    where: {
      slug,
      visibility: 'PUBLIC',
      status: 'PUBLISHED',
    },
    select: {
      title: true,
      synopsis: true,
      slug: true,
      publishedAt: true,
      createdAt: true,
      status: true,
      author: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          chapters: true,
          followers: true,
          favoritedBy: true,
        },
      },
      chapters: {
        where: { status: 'PUBLISHED' },
        select: {
          publishedAt: true,
          _count: {
            select: {
              reads: true,
              comments: true,
            },
          },
        },
        take: 1,
        orderBy: { publishedAt: 'desc' },
      },
    },
  });

  if (!book) {
    return {
      title: 'Book Not Found',
      description: 'The requested book could not be found on Wriders.',
      robots: { index: false, follow: false },
    };
  }

  const chapterCount = book._count.chapters;
  const followerCount = book._count.followers;
  const totalReads = book.chapters.reduce((sum, ch) => sum + ch._count.reads, 0);

  const publishedDate = book.publishedAt || book.createdAt;
  const lastChapterDate = book.chapters[0]?.publishedAt;

  const description =
    book.synopsis ||
    `${book.title} by ${book.author.name} on Wriders. ${chapterCount} ${chapterCount === 1 ? 'chapter' : 'chapters'} available. ${followerCount} followers, ${totalReads} total reads.`;

  const keywords = [
    book.title,
    book.author.name,
    'book',
    'story',
    'novel',
    'fiction',
    'online book',
    'free reading',
    'chapters',
    'serial',
    'wriders',
    'author',
    'literature',
  ];

  return {
    title: `${book.title} by ${book.author.name}`,
    description,
    keywords,
    authors: [{ name: book.author.name, url: `${process.env.NEXT_PUBLIC_APP_URL!}/users/${book.author.slug}` }],
    creator: book.author.name,
    publisher: 'Wriders',
    openGraph: {
      type: 'book',
      title: `${book.title} by ${book.author.name}`,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${book.slug}`,
      siteName: 'Wriders',
      locale: 'en_US',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL!}/api/og?type=book&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author.name)}`,
          width: 1200,
          height: 630,
          alt: `${book.title} by ${book.author.name} - Read on Wriders`,
          type: 'image/png',
        },
      ],
      authors: [book.author.name],
      tags: ['book', 'story', 'novel', 'fiction', 'online reading'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.title} by ${book.author.name}`,
      description,
      images: [
        `${process.env.NEXT_PUBLIC_APP_URL!}/api/og?type=book&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author.name)}`,
      ],
      creator: '@wriders',
      site: '@wriders',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL!}/books/${book.slug}`,
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
      // Book-specific meta tags
      'book:author': book.author.name,
      'book:isbn': '', // Add if you have ISBNs
      'book:release_date': publishedDate?.toISOString().split('T')[0] || '',
      'book:tag': 'fiction,novel,story',
      // Article-like tags for better indexing
      'article:author': `${process.env.NEXT_PUBLIC_APP_URL!}/users/${book.author.slug}`,
      'article:published_time': publishedDate?.toISOString() || '',
      'article:modified_time': lastChapterDate?.toISOString() || publishedDate?.toISOString() || '',
      'article:section': 'Books',
      'article:tag': 'book,story,novel,fiction',
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
      OR: user
        ? [
            { authorId: user.id },
            { visibility: 'PUBLIC', status: 'PUBLISHED' },
            { visibility: 'PRIVATE', status: 'PUBLISHED', followers: { some: { userId: user.id } } },
          ]
        : [
            { visibility: 'PUBLIC', status: 'PUBLISHED' }, // Only public books for unauthenticated users
          ],
    },
    include: {
      _count: {
        select: {
          chapters: true,
          followers: true,
          favoritedBy: true,
        },
      },
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
      chapters: {
        where: user
          ? {
              OR: [{ status: 'PUBLISHED' }, { book: { authorId: user.id } }],
            }
          : {
              status: 'PUBLISHED', // Only published chapters for unauthenticated users
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

  const isAuthor = user ? book.authorId === user.id : false;
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
                  {(book.status === 'PUBLISHED' || book.status === 'SOON') && <FollowBookButton bookSlug={book.slug} />}
                  {book.status === 'PUBLISHED' && <FavoriteBookButton bookSlug={book.slug} />}
                </div>
                <div className='flex items-center gap-4'>
                  <Link
                    href={`/books/${book.slug}/edit`}
                    className='text-sm text-gray-600 hover:text-gray-900 transition-colors border-b border-gray-200 hover:border-gray-400 pb-1'
                  >
                    Edit Book
                  </Link>
                  <DeleteBookButton bookId={book.id} bookTitle={book.title} />
                </div>
              </div>
            ) : (
              user && (
                <>
                  {(book.status === 'PUBLISHED' || book.status === 'SOON') && <FollowBookButton bookSlug={book.slug} />}
                  {book.status === 'PUBLISHED' && <FavoriteBookButton bookSlug={book.slug} />}
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

        {/* Table of Contents */}
        <div className='space-y-6'>
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
        </div>

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

      {/* Structured Data for SEO */}
      <BookStructuredData book={book} totalReads={totalReads} totalComments={totalComments} />
    </div>
  );
}
