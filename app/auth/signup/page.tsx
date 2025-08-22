import { RegisterForm } from '@/components/register-form';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Join the Writing Community',
  description:
    'Create your Wriders account to start publishing stories, reading amazing books, and connecting with fellow writers and readers.',
  keywords: ['sign up', 'register', 'join community', 'create account', 'writer registration'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Sign Up - Join the Writing Community | Wriders',
    description:
      'Create your Wriders account to start publishing stories, reading amazing books, and connecting with fellow writers and readers.',
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/auth/signup`,
    type: 'website',
  },
};

export default function SignupPage() {
  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4 py-8'>
      <div className='w-full max-w-md'>
        {/* Header */}
        <div className='text-center mb-12'>
          <Link href='/' className='flex items-center justify-center gap-3 mb-8'>
            <svg width='32' height='32' viewBox='0 0 24 24' className='text-gray-900'>
              <circle cx='12' cy='12' r='11' fill='none' stroke='currentColor' strokeWidth='1' />
              <text x='12' y='16' textAnchor='middle' className='text-xs font-serif font-medium' fill='currentColor'>
                w.
              </text>
            </svg>
            <span className='text-2xl font-serif text-gray-900'>wriders</span>
          </Link>

          <h1 className='text-4xl font-serif text-gray-900 mb-4'>Join Wriders</h1>
          <p className='text-sm text-gray-600'>Start your writing journey today</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
