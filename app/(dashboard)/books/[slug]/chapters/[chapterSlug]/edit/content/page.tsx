import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { EditChapterContentForm } from '@/components/edit-chapter-content-form';

interface EditChapterContentPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function EditChapterContentPage({ params }: EditChapterContentPageProps) {
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
      <div className='max-w-full mx-auto'>
        <EditChapterContentForm
          chapter={{
            id: chapter.id,
            slug: chapter.slug,
            title: chapter.title,
            content: chapter.content,
          }}
          bookSlug={chapter.book.slug}
          bookTitle={chapter.book.title}
        />
      </div>
    </div>
  );
}
