import { Metadata } from 'next';
import { CreateSeriesForm } from '@/components/create-series-form';

export const metadata: Metadata = {
  title: 'Create Series',
  description: 'Create a new book series to organize your stories.',
};

export default async function CreateSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; title?: string; synopsis?: string; visibility?: string }>;
}) {
  const { ref, title, synopsis, visibility } = await searchParams;

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create New Series</h1>
          <p className='text-gray-600'>
            Start a new book series to organize your stories and create a cohesive reading experience.
          </p>
        </div>

        <CreateSeriesForm
          refData={
            ref && ref === 'create-book'
              ? {
                  ref,
                  title,
                  synopsis,
                  visibility,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
