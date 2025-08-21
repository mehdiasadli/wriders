import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserCommentsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserCommentsPage({ params }: UserCommentsPageProps) {
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

  // Get recent comments
  const comments = await prisma.comment.findMany({
    where: { authorId: profileUser.id },
    select: {
      id: true,
      slug: true,
      content: true,
      createdAt: true,
      chapter: {
        select: {
          slug: true,
          title: true,
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
      parent: {
        select: {
          id: true,
          author: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-serif text-gray-900'>
        {isOwnProfile ? 'My Comments' : `${profileUser.name}'s Comments`}
      </h2>

      {comments && comments.length > 0 ? (
        <div className='space-y-6'>
          {comments.map((comment) => (
            <article key={comment.id} className='border-b border-gray-200 pb-6 last:border-b-0'>
              <div className='space-y-2'>
                <div className='text-sm text-gray-600'>
                  {comment.parent ? (
                    <>
                      Replied to{' '}
                      <Link
                        href={`/users/${comment.parent.author.slug}`}
                        className='border-b border-dotted border-gray-400 hover:border-gray-600'
                      >
                        {comment.parent.author.name}
                      </Link>{' '}
                      on{' '}
                    </>
                  ) : (
                    'Commented on '
                  )}
                  <Link
                    href={`/books/${comment.chapter.book.slug}/chapters/${comment.chapter.slug}`}
                    className='border-b border-dotted border-gray-400 hover:border-gray-600'
                  >
                    {comment.chapter.title}
                  </Link>{' '}
                  from{' '}
                  <Link
                    href={`/books/${comment.chapter.book.slug}`}
                    className='border-b border-dotted border-gray-400 hover:border-gray-600'
                  >
                    {comment.chapter.book.title}
                  </Link>{' '}
                  by{' '}
                  <Link
                    href={`/users/${comment.chapter.book.author.slug}`}
                    className='border-b border-dotted border-gray-400 hover:border-gray-600'
                  >
                    {comment.chapter.book.author.name}
                  </Link>
                </div>

                <div
                  className='text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                />

                <div className='flex items-center justify-between text-xs text-gray-500'>
                  <span>{format(comment.createdAt, "MMM dd, yyyy 'at' h:mm a")}</span>
                  <Link
                    href={`/books/${comment.chapter.book.slug}/chapters/${comment.chapter.slug}/comments/${comment.slug}`}
                    className='text-gray-600 hover:text-gray-900 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
                  >
                    View Comment
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className='text-center py-12 text-gray-500'>
          {isOwnProfile ? "You haven't made any comments yet." : `${profileUser.name} hasn't made any comments yet.`}
        </div>
      )}
    </div>
  );
}
