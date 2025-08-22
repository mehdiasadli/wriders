import { LoginForm } from '@/components/login-form';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Access Your Account',
  description:
    'Sign in to your Wriders account to access your books, continue reading, and connect with the writing community.',
  keywords: ['sign in', 'login', 'account access', 'user login'],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Sign In - Access Your Account | Wriders',
    description:
      'Sign in to your Wriders account to access your books, continue reading, and connect with the writing community.',
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/auth/signin`,
    type: 'website',
  },
};

export default function SigninPage() {
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

          <h1 className='text-4xl font-serif text-gray-900 mb-4'>Sign In</h1>
          <p className='text-sm text-gray-600'>Welcome back to your writing journey</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
