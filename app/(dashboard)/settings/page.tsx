import { getCurrentUserFresh } from '@/lib/auth-utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - Manage Your Account',
  description:
    'Manage your Wriders account settings, profile information, and preferences. Update your writing profile and privacy settings.',
  keywords: ['account settings', 'profile management', 'user preferences', 'account security'],
  robots: {
    index: false, // Settings pages typically shouldn't be indexed
    follow: false,
  },
  openGraph: {
    title: 'Settings - Manage Your Account | Wriders',
    description: 'Manage your Wriders account settings, profile information, and preferences.',
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/settings`,
    type: 'website',
  },
};

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

        {/* Currently no settings */}
        <div className='text-center'>
          <p className='text-sm text-gray-600'>Currently no settings available.</p>
        </div>
        {/* Form */}
        {/* <div className='max-w-2xl mx-auto'>
          <UpdateUserForm
            user={{
              id: data.id,
              name: data.name,
              email: data.email,
              slug: data.slug,
            }}
          />
        </div> */}
      </div>
    </div>
  );
}
