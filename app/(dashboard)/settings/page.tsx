import { getCurrentUserFresh } from '@/lib/auth-utils';
import Link from 'next/link';
import { UpdateUserForm } from './update-user-form';
import { notFound } from 'next/navigation';

export default async function SettingsPage() {
  const data = await getCurrentUserFresh();

  if (!data) {
    notFound();
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href={`/users/${data.slug}`} className='text-sm text-gray-500 hover:text-gray-700 transition-colors'>
            ← Go to your profile
          </Link>

          <h1 className='text-6xl font-serif text-gray-900 mt-6 mb-4'>Settings</h1>

          <p className='text-sm text-gray-600 mb-8'>Update your user settings</p>
        </div>

        {/* Form */}
        <div className='max-w-2xl mx-auto'>
          <UpdateUserForm
            user={{
              id: data.id,
              name: data.name,
              email: data.email,
              slug: data.slug,
            }}
          />
        </div>
      </div>
    </div>
  );
}
