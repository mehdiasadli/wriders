import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChapterReorderClient } from './chapter-reorder-client';

export default async function ReorderChaptersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const book = await prisma.book.findUnique({
    where: {
      slug,
      authorId: user.id, // Only book authors can access this page
    },
    include: {
      chapters: {
        select: {
          id: true,
          title: true,
          slug: true,
          order: true,
          status: true,
          synopsis: true,
          publishedAt: true,
          _count: {
            select: {
              comments: true,
              reads: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
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
        <div className='mb-8'>
          <Link
            href={`/books/${slug}`}
            className='inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to {book.title}
          </Link>

          <h1 className='text-4xl font-serif text-gray-900 mb-2'>Reorder Chapters</h1>
          <p className='text-gray-600'>Drag and drop chapters to reorder them. Changes will be saved automatically.</p>
        </div>

        {/* Chapter List */}
        {book.chapters.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg mb-4'>No chapters found</p>
            <Link
              href={`/books/${slug}/chapters/create`}
              className='text-blue-600 hover:text-blue-700 transition-colors'
            >
              Create your first chapter
            </Link>
          </div>
        ) : (
          <ChapterReorderClient bookSlug={slug} chapters={book.chapters} />
        )}
      </div>
    </div>
  );
}
