import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserFollowingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserFollowingPage({ params }: UserFollowingPageProps) {
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

  // Get books user is following
  const followedBooks = await prisma.bookFollow.findMany({
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
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-serif text-gray-900'>
        {isOwnProfile ? 'Books I Follow' : `Books ${profileUser.name} Follows`}
      </h2>

      {followedBooks && followedBooks.length > 0 ? (
        <div className='space-y-6'>
          {followedBooks.map((follow) => (
            <article key={follow.book.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
              <div className='space-y-2'>
                <div className='flex items-start justify-between'>
                  <div>
                    <Link
                      href={`/books/${follow.book.slug}`}
                      className='text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors'
                    >
                      {follow.book.title}
                    </Link>
                    <div className='text-sm text-gray-600 mt-1'>
                      by{' '}
                      <Link
                        href={`/users/${follow.book.author.slug}`}
                        className='border-b border-dotted border-gray-400 hover:border-gray-600'
                      >
                        {follow.book.author.name}
                      </Link>
                    </div>
                  </div>
                  <div className='text-right text-sm text-gray-500'>{follow.book._count.chapters} chapters</div>
                </div>

                {follow.book.synopsis && (
                  <p className='text-gray-700 text-sm leading-relaxed'>{follow.book.synopsis}</p>
                )}

                <div className='flex items-center gap-4 text-xs text-gray-500'>
                  <span>Followed {format(follow.createdAt, 'MMM dd, yyyy')}</span>
                  {follow.book.publishedAt && <span>Published {format(follow.book.publishedAt, 'MMM dd, yyyy')}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className='text-center py-12 text-gray-500'>
          {isOwnProfile ? "You aren't following any books yet." : `${profileUser.name} isn't following any books yet.`}
        </div>
      )}
    </div>
  );
}
