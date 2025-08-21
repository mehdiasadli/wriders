import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import { getWordCount } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserReadsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserReadsPage({ params }: UserReadsPageProps) {
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
  const isCurrentUserAuthor = currentUser?.roles.includes('AUTHOR');

  // Get read chapters with complex filtering
  const allReadChapters = await prisma.chapterRead.findMany({
    where: { userId: profileUser.id },
    select: {
      readAt: true,
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
              id: true,
              slug: true,
              title: true,
              status: true,
              visibility: true,
              authorId: true,
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
      readAt: 'desc',
    },
    take: 100,
  });

  // Check which books current user follows (for private book access)
  const followedBookIds = currentUser
    ? await prisma.bookFollow
        .findMany({
          where: { userId: currentUser.id },
          select: { bookId: true },
        })
        .then((follows) => follows.map((f) => f.bookId))
    : [];

  // Filter and categorize reads based on visibility rules
  const readChapters = [];
  const privateCounts = { chapters: 0 };
  const archivedCounts = { chapters: 0 };

  for (const read of allReadChapters) {
    const book = read.chapter.book;
    const isBookAuthor = currentUser?.id === book.authorId;
    const isFollowingBook = followedBookIds.includes(book.id);

    if (isOwnProfile || isCurrentUserAuthor) {
      // Authors can see everything
      readChapters.push(read);
    } else {
      // Non-authors: complex visibility rules
      if (book.status === 'ARCHIVED') {
        archivedCounts.chapters++;
      } else if (book.status === 'PUBLISHED') {
        if (book.visibility === 'PUBLIC') {
          readChapters.push(read);
        } else if (book.visibility === 'PRIVATE') {
          if (isFollowingBook) {
            readChapters.push(read);
          } else {
            privateCounts.chapters++;
          }
        }
      }
      // DRAFT and SOON books are not shown for non-authors
    }
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-serif text-gray-900'>
        {isOwnProfile ? 'My Reading History' : `${profileUser.name}'s Reading History`}
      </h2>

      {readChapters && readChapters.length > 0 ? (
        <div className='space-y-6'>
          {readChapters.map((read) => (
            <article
              key={`${read.chapter.id}-${read.readAt}`}
              className='border-b border-gray-200 pb-6 last:border-b-0'
            >
              <div className='space-y-2'>
                <div className='flex items-start justify-between'>
                  <div>
                    <Link
                      href={`/books/${read.chapter.book.slug}/chapters/${read.chapter.slug}`}
                      className='text-lg font-serif text-gray-900 hover:text-gray-600 transition-colors'
                    >
                      Chapter {read.chapter.order}: {read.chapter.title}
                    </Link>
                    <div className='text-sm text-gray-600 mt-1'>
                      from{' '}
                      <Link
                        href={`/books/${read.chapter.book.slug}`}
                        className='border-b border-dotted border-gray-400 hover:border-gray-600'
                      >
                        {read.chapter.book.title}
                      </Link>{' '}
                      by{' '}
                      <Link
                        href={`/users/${read.chapter.book.author.slug}`}
                        className='border-b border-dotted border-gray-400 hover:border-gray-600'
                      >
                        {read.chapter.book.author.name}
                      </Link>
                    </div>
                  </div>
                  <div className='text-right text-sm text-gray-500'>
                    {getWordCount(read.chapter.content, true).toLocaleString()} words
                  </div>
                </div>

                <div className='text-xs text-gray-500'>Read {format(read.readAt, "MMM dd, yyyy 'at' h:mm a")}</div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {/* Indicators for private/archived content */}
      {!isOwnProfile && !isCurrentUserAuthor && (
        <div className='space-y-2 text-center py-6'>
          {privateCounts.chapters > 0 && (
            <div className='text-sm text-gray-500'>
              {privateCounts.chapters} private {privateCounts.chapters === 1 ? 'chapter' : 'chapters'}
            </div>
          )}
          {archivedCounts.chapters > 0 && (
            <div className='text-sm text-gray-500'>
              {archivedCounts.chapters} archived {archivedCounts.chapters === 1 ? 'chapter' : 'chapters'}
            </div>
          )}
        </div>
      )}

      {readChapters.length === 0 && privateCounts.chapters === 0 && archivedCounts.chapters === 0 && (
        <div className='text-center py-12 text-gray-500'>
          {isOwnProfile ? "You haven't read any chapters yet." : `${profileUser.name} hasn't read any chapters yet.`}
        </div>
      )}
    </div>
  );
}
