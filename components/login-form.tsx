'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, type LoginSchema } from '@/schemas/auth.schema';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Check if it's an unverified user issue
        setError('Invalid email or password');
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (_error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-2'>
          <label htmlFor='email' className='text-sm text-gray-700'>
            Email
          </label>
          <input
            id='email'
            type='email'
            placeholder='m@example.com'
            disabled={isLoading}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            {...form.register('email')}
          />
          {form.formState.errors.email && <p className='text-sm text-red-600'>{form.formState.errors.email.message}</p>}
        </div>

        <div className='space-y-2'>
          <label htmlFor='password' className='text-sm text-gray-700'>
            Password
          </label>
          <input
            id='password'
            type='password'
            placeholder='Enter your password'
            disabled={isLoading}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            {...form.register('password')}
          />
          {form.formState.errors.password && (
            <p className='text-sm text-red-600'>{form.formState.errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className='space-y-3'>
            <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading}
          className='w-full py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-600'>
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/signup'
            className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
          >
            Join Wriders
          </Link>
        </p>
        {error && (
          <p className='text-sm text-gray-600 mt-3'>
            <Link
              href={`/auth/resend-verification?email=${encodeURIComponent(form.getValues('email') || '')}`}
              className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
            >
              Resend verification email
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
