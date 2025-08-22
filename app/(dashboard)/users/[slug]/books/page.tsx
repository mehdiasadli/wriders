import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserBooksPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserBooksPage({ params }: UserBooksPageProps) {
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
    },
  });

  if (!profileUser) {
    notFound();
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

  // Get authored books
  const books = await prisma.book.findMany({
    where: {
      authorId: profileUser.id,
      ...(isOwnProfile || isCurrentUserAuthor
        ? {}
        : {
            status: 'PUBLISHED',
            OR: [{ visibility: 'PUBLIC' }, ...(isFollowingUser ? [{ visibility: 'PRIVATE' as const }] : [])],
          }),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      synopsis: true,
      status: true,
      visibility: true,
      publishedAt: true,
      createdAt: true,
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
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-serif text-gray-900'>
          {isOwnProfile ? 'My Books' : `${profileUser.name}'s Books`}
        </h2>
      </div>

      {books && books.length > 0 ? (
        <div className='space-y-6'>
          {books.map((book) => (
            <article key={book.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
              <div className='space-y-2'>
                <div className='flex items-start justify-between'>
                  <div>
                    <Link
                      href={`/books/${book.slug}`}
                      className='text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors'
                    >
                      {book.title}
                    </Link>
                  </div>
                  <div className='text-right text-sm text-gray-500'>{book._count.chapters} chapters</div>
                </div>

                {book.synopsis && <p className='text-gray-700 text-sm leading-relaxed'>{book.synopsis}</p>}

                <div className='flex items-center gap-4 text-xs text-gray-500'>
                  {(isOwnProfile || isCurrentUserAuthor) && (
                    <span className='px-2 py-1 border border-gray-300 text-gray-700 bg-white rounded text-xs'>
                      {book.status}
                    </span>
                  )}

                  {(isOwnProfile || isCurrentUserAuthor) && (
                    <span className='px-2 py-1 border border-gray-300 text-gray-700 bg-white rounded text-xs'>
                      {book.visibility}
                    </span>
                  )}

                  {book.publishedAt && <span>Published {format(book.publishedAt, 'MMM dd, yyyy')}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className='text-center py-12 text-gray-500'>
          {isOwnProfile ? "You haven't written any books yet." : `${profileUser.name} hasn't written any books yet.`}
        </div>
      )}
    </div>
  );
}
