import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { getWordCount } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserFavoritesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserFavoritesPage({ params }: UserFavoritesPageProps) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  // Find the profile user
  const profileUser = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
    },
  });

  if (!profileUser) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  // Get favorite books and chapters
  const [favoriteBooks, favoriteChapters] = await Promise.all([
    prisma.favoriteBook.findMany({
      where: { userId: profileUser.id },
      select: {
        createdAt: true,
        book: {
          select: {
            id: true,
            slug: true,
            title: true,
            synopsis: true,
            status: true,
            visibility: true,
            publishedAt: true,
            author: {
              select: {
                name: true,
                slug: true,
              },
            },

            _count: {
              select: {
                chapters: {
                  where: {
                    status: 'PUBLISHED',
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.favoriteChapter.findMany({
      where: { userId: profileUser.id },
      select: {
        createdAt: true,
        chapter: {
          select: {
            id: true,
            slug: true,
            title: true,
            order: true,
            status: true,
            publishedAt: true,
            content: true,
            book: {
              select: {
                slug: true,
                title: true,
                author: {
                  select: {
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return (
    <div className='space-y-8'>
      <h2 className='text-xl font-serif text-gray-900'>
        {isOwnProfile ? 'My Favorites' : `${profileUser.name}'s Favorites`}
      </h2>

      {/* Favorite Books */}
      {favoriteBooks && favoriteBooks.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-serif text-gray-800'>Books</h3>
          <div className='space-y-6'>
            {favoriteBooks.map((favorite) => (
              <article key={favorite.book.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
                <div className='space-y-2'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <Link
                        href={`/books/${favorite.book.slug}`}
                        className='text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors'
                      >
                        {favorite.book.title}
                      </Link>
                      <div className='text-sm text-gray-600 mt-1'>
                        by{' '}
                        <Link
                          href={`/users/${favorite.book.author.slug}`}
                          className='border-b border-dotted border-gray-400 hover:border-gray-600'
                        >
                          {favorite.book.author.name}
                        </Link>
                      </div>
                    </div>
                    <div className='text-right text-sm text-gray-500'>{favorite.book._count.chapters} chapters</div>
                  </div>

                  {favorite.book.synopsis && (
                    <p className='text-gray-700 text-sm leading-relaxed'>{favorite.book.synopsis}</p>
                  )}

                  <div className='text-xs text-gray-500'>Favorited {format(favorite.createdAt, 'MMM dd, yyyy')}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Chapters */}
      {favoriteChapters && favoriteChapters.length > 0 && (
        <div className='space-y-4'>
          <h3 className='text-lg font-serif text-gray-800'>Chapters</h3>
          <div className='space-y-6'>
            {favoriteChapters.map((favorite) => (
              <article key={favorite.chapter.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
                <div className='space-y-2'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <Link
                        href={`/books/${favorite.chapter.book.slug}/chapters/${favorite.chapter.slug}`}
                        className='text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors'
                      >
                        Chapter {favorite.chapter.order}: {favorite.chapter.title}
                      </Link>
                      <div className='text-sm text-gray-600 mt-1'>
                        from{' '}
                        <Link
                          href={`/books/${favorite.chapter.book.slug}`}
                          className='border-b border-dotted border-gray-400 hover:border-gray-600'
                        >
                          {favorite.chapter.book.title}
                        </Link>{' '}
                        by{' '}
                        <Link
                          href={`/users/${favorite.chapter.book.author.slug}`}
                          className='border-b border-dotted border-gray-400 hover:border-gray-600'
                        >
                          {favorite.chapter.book.author.name}
                        </Link>
                      </div>
                    </div>
                    <div className='text-right text-sm text-gray-500'>
                      {getWordCount(favorite.chapter.content, true).toLocaleString()} words
                    </div>
                  </div>

                  <div className='text-xs text-gray-500'>Favorited {format(favorite.createdAt, 'MMM dd, yyyy')}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {(!favoriteBooks || favoriteBooks.length === 0) && (!favoriteChapters || favoriteChapters.length === 0) && (
        <div className='text-center py-12 text-gray-500'>
          {isOwnProfile ? "You haven't favorited anything yet." : `${profileUser.name} hasn't favorited anything yet.`}
        </div>
      )}
    </div>
  );
}
