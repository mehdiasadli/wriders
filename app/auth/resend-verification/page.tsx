import Link from 'next/link';
import { ResendVerificationForm } from '@/components/resend-verification-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resend Email Verification',
  description:
    'Request a new email verification link for your Wriders account. Verify your email to access all features of the writing platform.',
  keywords: ['email verification', 'account verification', 'resend verification', 'email confirmation'],
  robots: {
    index: false, // Auth pages typically shouldn't be indexed
    follow: false,
  },
  openGraph: {
    title: 'Resend Email Verification | Wriders',
    description: 'Request a new email verification link for your Wriders account.',
    url: `${process.env.NEXT_PUBLIC_APP_URL!}/auth/resend-verification`,
    type: 'website',
  },
};

interface ResendVerificationPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResendVerificationPage({ searchParams }: ResendVerificationPageProps) {
  const { email } = await searchParams;

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        {/* Logo */}
        <div className='text-center mb-12'>
          <Link href='/' className='inline-flex items-center gap-3 mb-6'>
            <div className='w-8 h-8 border border-gray-900 rounded-full flex items-center justify-center'>
              <span className='text-xs font-serif font-medium text-gray-900'>w.</span>
            </div>
            <span className='text-2xl font-serif text-gray-900'>wriders</span>
          </Link>
        </div>

        {/* Resend Form */}
        <ResendVerificationForm email={email} />

        {/* Footer Links */}
        <div className='mt-8 text-center space-y-2'>
          <p className='text-sm text-gray-600'>
            <Link
              href='/auth/signin'
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              Back to Sign In
            </Link>
          </p>
          <p className='text-sm text-gray-600'>
            Don&apos;t have an account?{' '}
            <Link
              href='/auth/signup'
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
