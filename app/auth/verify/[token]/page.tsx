import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

type VerificationStatus = 'success' | 'expired' | 'invalid' | 'already_verified';

interface VerificationResult {
  status: VerificationStatus;
  userName?: string;
}

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const result = await verifyEmailToken(token);

  if (result.status === 'invalid') {
    return notFound();
  }

  return (
    <div className='min-h-screen bg-white flex items-center justify-center px-4'>
      <div className='max-w-md w-full'>
        {/* Logo */}
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-3 mb-6'>
            <div className='w-8 h-8 border border-gray-900 rounded-full flex items-center justify-center'>
              <span className='text-xs font-serif font-medium text-gray-900'>w.</span>
            </div>
            <span className='text-2xl font-serif text-gray-900'>wriders</span>
          </div>
        </div>

        {/* Success */}
        {result.status === 'success' && (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <h1 className='text-2xl font-serif text-gray-900 mb-4'>Email Verified Successfully!</h1>
              <p className='text-gray-600 mb-8'>
                Welcome to wriders, {result.userName}! Your email has been verified and your account is now active.
              </p>
            </div>

            <Link
              href='/auth/signin'
              className='inline-block px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium'
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Already Verified */}
        {result.status === 'already_verified' && (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h1 className='text-2xl font-serif text-gray-900 mb-4'>Already Verified</h1>
              <p className='text-gray-600 mb-8'>
                Your email address has already been verified. You can sign in to your account.
              </p>
            </div>

            <Link
              href='/auth/signin'
              className='inline-block px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium'
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Expired */}
        {result.status === 'expired' && (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h1 className='text-2xl font-serif text-gray-900 mb-4'>Verification Link Expired</h1>
              <p className='text-gray-600 mb-8'>
                This verification link has expired. Please request a new verification email to complete your
                registration.
              </p>
            </div>

            <div className='space-y-3'>
              <Link
                href='/auth/signup'
                className='block w-full px-8 py-3 text-white bg-gray-900 hover:bg-gray-800 transition-colors font-medium text-center'
              >
                Request New Verification
              </Link>
              <Link
                href='/auth/signin'
                className='block w-full px-8 py-3 text-gray-600 hover:text-gray-900 transition-colors text-center border-b border-dotted border-gray-400 hover:border-gray-600'
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='text-center mt-12 text-sm text-gray-500'>
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
}

async function verifyEmailToken(token: string): Promise<VerificationResult> {
  try {
    const emailVerificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
    });

    if (!emailVerificationToken || !emailVerificationToken.user) {
      return { status: 'invalid' };
    }

    // Check if user is already verified
    if (emailVerificationToken.user.isVerified) {
      // Clean up the token since user is already verified
      await prisma.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });
      return {
        status: 'already_verified',
        userName: emailVerificationToken.user.name,
      };
    }

    // Check if token is expired
    if (emailVerificationToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });
      return { status: 'expired' };
    }

    // Verify the user
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: emailVerificationToken.user.id },
        data: { isVerified: true },
      });

      await tx.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });
    });

    return {
      status: 'success',
      userName: emailVerificationToken.user.name,
    };
  } catch (error) {
    console.error('Error during email verification:', error);
    return { status: 'invalid' };
  }
}
