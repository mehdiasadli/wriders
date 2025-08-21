import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CreateChapterForm } from '@/components/create-chapter-form';
import { auth } from '@/lib/auth';
import Link from 'next/link';

interface CreateChapterPageProps {
  params: {
    slug: string;
  };
}

export default async function CreateChapterPage({ params }: CreateChapterPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const book = await prisma.book.findUnique({
    where: {
      slug: params.slug,
      authorId: session.user.id, // Only author can create chapters
    },
    select: {
      id: true,
      title: true,
      slug: true,
      chapters: {
        select: {
          order: true,
        },
      },
    },
  });

  if (!book) {
    redirect('/books');
  }

  const existingChapterOrders = book.chapters.map((chapter) => chapter.order);

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/books/${book.slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Back to {book.title}
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>New Chapter</h1>

          <p className='text-sm text-gray-600 mb-8'>Create a new chapter for your book</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <CreateChapterForm
            existingChapterOrders={existingChapterOrders}
            bookId={book.id}
            bookTitle={book.title}
            bookSlug={book.slug}
          />
        </div>
      </div>
    </div>
  );
}
