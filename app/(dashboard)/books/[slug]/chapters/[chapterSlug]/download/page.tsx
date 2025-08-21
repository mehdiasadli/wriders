import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChapterDownloadOptions } from '@/components/chapter-download-options';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { slug, chapterSlug } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { slug: chapterSlug, book: { slug } },
    select: { title: true, book: { select: { title: true } } },
  });

  if (!chapter) {
    return { title: 'Chapter Download' };
  }

  return {
    title: `Download ${chapter.title} - ${chapter.book.title}`,
    description: `Download chapter "${chapter.title}" from "${chapter.book.title}"`,
  };
}

interface DownloadPageProps {
  params: Promise<{
    slug: string;
    chapterSlug: string;
  }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
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
              name: true,
              slug: true,
            },
          },
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
            href={`/books/${slug}/chapters/${chapterSlug}`}
            className='text-sm text-gray-500 hover:text-gray-700 transition-colors'
          >
            ← Back to Chapter
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-8 mb-4'>Download</h1>

          <div className='text-sm text-gray-600 space-y-1'>
            <div>{chapter.title}</div>
            <div className='text-gray-500'>
              {chapter.book.title} • {chapter.book.author.name}
            </div>
          </div>
        </div>

        {/* Download Options */}
        <div className='max-w-2xl mx-auto'>
          <ChapterDownloadOptions
            chapter={{
              id: chapter.id,
              title: chapter.title,
              content: chapter.content,
              order: chapter.order,
              slug: chapter.slug,
            }}
            book={{
              title: chapter.book.title,
              author: chapter.book.author.name,
            }}
          />
        </div>
      </div>
    </div>
  );
}
