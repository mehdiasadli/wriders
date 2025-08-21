import { EditBookForm } from '@/components/edit-book-form';
import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EditBookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const book = await prisma.book.findUnique({
    where: {
      slug,
      authorId: user.id, // Only author can edit
    },
    include: {
      series: {
        select: {
          id: true,
          title: true,
          books: {
            select: {
              orderInSeries: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!book) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/books/${book.slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Back to {book.title}
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Edit Book</h1>

          <p className='text-sm text-gray-600 mb-8'>Update your book's information and settings</p>

          {/* Current Book Info */}
          <div className='max-w-2xl mx-auto mb-8'>
            <h2 className='text-2xl font-serif text-gray-900 mb-2'>{book.title}</h2>
            <div className='flex items-center justify-center gap-4 text-sm text-gray-600'>
              <span>Status: {book.status}</span>
              <span>•</span>
              <span>Visibility: {book.visibility}</span>
              {book.series && (
                <>
                  <span>•</span>
                  <span>Series: {book.series.title}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <EditBookForm
            book={{
              id: book.id,
              slug: book.slug,
              title: book.title,
              synopsis: book.synopsis,
              visibility: book.visibility,
              status: book.status,
              series: book.series,
              orderInSeries: book.orderInSeries,
            }}
          />
        </div>
      </div>
    </div>
  );
}
