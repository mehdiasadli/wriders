import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { EditChapterForm } from '@/components/edit-chapter-form';
import Link from 'next/link';

interface EditChapterPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function EditChapterPage({ params }: EditChapterPageProps) {
  const { slug, chapterSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      slug: chapterSlug,
      book: {
        slug,
        authorId: session.user.id, // Only author can edit chapters
      },
    },
    include: {
      book: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!chapter) {
    redirect('/books');
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link
            href={`/books/${chapter.book.slug}/chapters/${chapter.slug}`}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← Back to {chapter.title}
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Edit Chapter</h1>

          <p className='text-sm text-gray-600 mb-8'>Update chapter information and settings</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <EditChapterForm
            chapter={{
              id: chapter.id,
              slug: chapter.slug,
              title: chapter.title,
              synopsis: chapter.synopsis,
              order: chapter.order,
              status: chapter.status,
              publishedAt: chapter.publishedAt,
            }}
            bookSlug={chapter.book.slug}
          />
        </div>
      </div>
    </div>
  );
}
