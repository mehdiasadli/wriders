import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Metadata } from 'next';
import { CommentsSection } from '@/components/comments-section';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { slug, chapterSlug } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug, book: { slug } },
    select: { title: true, order: true, synopsis: true, book: { select: { title: true } } },
  });

  if (!chapter) {
    return { title: 'Chapter Comments' };
  }

  return {
    title: `Comments - ${chapter.title} - ${chapter.book.title} #${chapter.order}`,
    description: `Discussion for chapter "${chapter.title}" from "${chapter.book.title}"`,
  };
}

interface CommentsPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function CommentsPage({ params }: CommentsPageProps) {
  const { slug, chapterSlug } = await params;
  const session = await auth();

  const chapter = await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
      book: {
        slug,
      },
    },
    include: {
      book: {
        select: {
          title: true,
          slug: true,
          author: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      _count: {
        select: {
          reads: true,
          comments: true,
        },
      },
    },
  });

  if (!chapter) {
    redirect('/books');
  }

  // Check if user can view this chapter
  if (chapter.status !== 'PUBLISHED' && chapter.book.author.id !== session?.user?.id) {
    redirect('/books');
  }

  // Get initial comments data
  const initialComments = await prisma.comment.findMany({
    where: {
      chapterId: chapter.id,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
      replies: {
        include: {
          replies: {
            include: {
              replies: {
                include: {
                  author: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                  _count: {
                    select: {
                      replies: true,
                    },
                  },
                },
              },
              author: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              _count: {
                select: {
                  replies: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link
            href={`/books/${slug}/chapters/${chapterSlug}`}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← Back to Chapter
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-4'>Discussion</h1>

          <div className='text-sm text-gray-600 space-y-1'>
            <div>{chapter.title}</div>
            <div className='text-gray-500'>
              Chapter {chapter.order} • {chapter._count.comments} comments
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className='max-w-3xl mx-auto'>
          <CommentsSection
            chapterSlug={chapterSlug}
            bookSlug={slug}
            bookTitle={chapter.book.title}
            chapterTitle={chapter.title}
            initialComments={initialComments}
            currentUserId={session?.user?.id}
            chapterAuthorId={chapter.book.author.id}
          />
        </div>
      </div>
    </div>
  );
}
