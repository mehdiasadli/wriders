import { CreateBookForm } from '@/components/create-book-form';
import Link from 'next/link';

export default async function CreateBookPage({
  searchParams,
}: {
  searchParams: Promise<{ seriesId?: string; title?: string; visibility?: string; synopsis?: string }>;
}) {
  const { title, visibility, synopsis } = await searchParams;

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href='/books' className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Back to Books
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Create Book</h1>

          <p className='text-sm text-gray-600 mb-8'>Begin your storytelling journey with a new book</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <CreateBookForm
            initialFormData={{
              title,
              synopsis,
              visibility,
            }}
          />
        </div>
      </div>
    </div>
  );
}
