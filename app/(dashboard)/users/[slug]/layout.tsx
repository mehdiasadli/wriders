import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { UserNavigation } from './user-navigation';

interface UserLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function UserLayout({ children, params }: UserLayoutProps) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  // Find the profile user
  const profileUser = await prisma.user.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      roles: true,
      createdAt: true,
      wpm: true,
    },
  });

  if (!profileUser) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isCurrentUserAuthor = currentUser?.roles.includes('AUTHOR');
  const isProfileUserAuthor = profileUser.roles.includes('AUTHOR');

  // Check if current user follows any of the profile user's books
  const followsUser = currentUser
    ? await prisma.bookFollow.findFirst({
        where: {
          userId: currentUser.id,
          book: {
            authorId: profileUser.id,
          },
        },
      })
    : null;

  const isFollowingUser = !!followsUser;

  // Get user statistics for navigation counts
  const [
    authoredBooksCount,
    followingBooksCount,
    favoriteBooksCount,
    favoriteChaptersCount,
    commentsCount,
    readChaptersCount,
  ] = await Promise.all([
    // Authored books count
    prisma.book.count({
      where: {
        authorId: profileUser.id,
        ...(isOwnProfile || isCurrentUserAuthor
          ? {}
          : {
              status: 'PUBLISHED',
              OR: [{ visibility: 'PUBLIC' }, ...(isFollowingUser ? [{ visibility: 'PRIVATE' as const }] : [])],
            }),
      },
    }),
    // Following books count
    prisma.bookFollow.count({
      where: { userId: profileUser.id },
    }),
    // Favorite books count
    prisma.favoriteBook.count({
      where: { userId: profileUser.id },
    }),
    // Favorite chapters count
    prisma.favoriteChapter.count({
      where: { userId: profileUser.id },
    }),
    // Comments count
    prisma.comment.count({
      where: { authorId: profileUser.id },
    }),
    // Read chapters count
    prisma.chapterRead.count({
      where: { userId: profileUser.id },
    }),
  ]);

  const favoriteItemsCount = favoriteBooksCount + favoriteChaptersCount;

  const navigationItems = [
    { href: `/users/${slug}`, label: 'Overview', count: null },
    { href: `/users/${slug}/books`, label: 'Books', count: authoredBooksCount },
    { href: `/users/${slug}/following`, label: 'Following', count: followingBooksCount },
    { href: `/users/${slug}/comments`, label: 'Comments', count: commentsCount },
    { href: `/users/${slug}/favorites`, label: 'Favorites', count: favoriteItemsCount },
    { href: `/users/${slug}/reads`, label: 'Read', count: readChaptersCount },
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <div className='border-b border-gray-200 bg-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-3xl font-serif text-gray-900 mb-2'>{profileUser.name}</h1>
              <div className='flex items-center gap-4 text-sm text-gray-600'>
                <span>@{profileUser.slug}</span>
                {isProfileUserAuthor && (
                  <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs'>Author</span>
                )}
                <span>Joined {format(profileUser.createdAt, 'MMMM yyyy')}</span>
                {isOwnProfile ? (
                  <Link
                    href='/wpm'
                    className='hover:text-gray-900 transition-colors border-b border-dotted border-gray-400 hover:border-gray-600'
                  >
                    {profileUser.wpm} WPM
                  </Link>
                ) : (
                  <span>{profileUser.wpm} WPM</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <UserNavigation navigationItems={navigationItems} />

      {/* Content */}
      <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>{children}</div>
    </div>
  );
}
