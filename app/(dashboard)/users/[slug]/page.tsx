import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import type { Metadata } from 'next';

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const user = await prisma.user.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      roles: true,
      _count: {
        select: {
          booksAuthored: {
            where: {
              status: 'PUBLISHED',
              visibility: 'PUBLIC',
            },
          },
        },
      },
    },
  });

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'The requested user profile could not be found.',
    };
  }

  const isAuthor = user.roles.includes('AUTHOR');
  const bookCount = user._count.booksAuthored;

  return {
    title: `${user.name} - ${isAuthor ? 'Author' : 'Reader'} Profile`,
    description: `${user.name}'s profile on Wriders. ${
      isAuthor ? `Author of ${bookCount} ${bookCount === 1 ? 'book' : 'books'}.` : 'Active reader and community member.'
    } Discover their reading activity and published works.`,
    keywords: [user.name, 'author profile', 'writer profile', 'user profile', 'books', 'stories'],
    openGraph: {
      title: `${user.name} - Profile | Wriders`,
      description: `${user.name}'s profile on Wriders. ${
        isAuthor
          ? `Author of ${bookCount} ${bookCount === 1 ? 'book' : 'books'}.`
          : 'Active reader and community member.'
      }`,
      url: `${process.env.NEXT_PUBLIC_APP_URL!}/users/${user.slug}`,
      type: 'profile',
    },
    twitter: {
      title: `${user.name} - Profile | Wriders`,
      description: `${user.name}'s profile on Wriders. ${
        isAuthor
          ? `Author of ${bookCount} ${bookCount === 1 ? 'book' : 'books'}.`
          : 'Active reader and community member.'
      }`,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL!}/users/${user.slug}`,
    },
  };
}

interface UserOverviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserOverviewPage({ params }: UserOverviewPageProps) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  // Find the profile user (basic info only, layout handles the rest)
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
    return null; // Layout will handle notFound
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const isCurrentUserAuthor = currentUser?.roles.includes('AUTHOR');

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

  // Get user statistics for overview
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

  return (
    <div className='space-y-8'>
      {/* Statistics */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6'>
        <div className='text-center'>
          <div className='text-2xl font-serif text-gray-900'>{authoredBooksCount}</div>
          <div className='text-sm text-gray-600'>Books</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-serif text-gray-900'>{followingBooksCount}</div>
          <div className='text-sm text-gray-600'>Following</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-serif text-gray-900'>{commentsCount}</div>
          <div className='text-sm text-gray-600'>Comments</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-serif text-gray-900'>{readChaptersCount}</div>
          <div className='text-sm text-gray-600'>Chapters Read</div>
        </div>
        <div className='text-center'>
          <div className='text-2xl font-serif text-gray-900'>{favoriteItemsCount}</div>
          <div className='text-sm text-gray-600'>Favorites</div>
        </div>
      </div>
    </div>
  );
}
