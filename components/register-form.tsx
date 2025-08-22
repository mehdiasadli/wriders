'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, type RegisterSchema } from '@/schemas/auth.schema';

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          roles: ['USER'],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Registration failed');
      } else {
        setSuccess(
          result.message ||
            'Account created successfully! Please check your email for a verification link before signing in.'
        );
        // Don't auto-redirect, let user verify email first
      }
    } catch (error) {
      console.log(error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-2'>
          <label htmlFor='name' className='text-sm text-gray-700'>
            Full Name
          </label>
          <input
            id='name'
            type='text'
            placeholder='John Doe'
            disabled={isLoading}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            {...form.register('name')}
          />
          {form.formState.errors.name && <p className='text-sm text-red-600'>{form.formState.errors.name.message}</p>}
        </div>

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

        <div className='space-y-2'>
          <label htmlFor='confirmPassword' className='text-sm text-gray-700'>
            Confirm Password
          </label>
          <input
            id='confirmPassword'
            type='password'
            placeholder='Confirm your password'
            disabled={isLoading}
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            {...form.register('confirmPassword')}
          />
          {form.formState.errors.confirmPassword && (
            <p className='text-sm text-red-600'>{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        {error && <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>}

        {success && (
          <div className='space-y-3'>
            <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{success}</div>
            <div className='text-center'>
              <Link
                href={`/auth/resend-verification?email=${encodeURIComponent(form.getValues('email') || '')}`}
                className='text-sm text-gray-600 hover:text-gray-900 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
              >
                Didn&apos;t receive the email? Resend verification link
              </Link>
            </div>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading || !!success}
          className='w-full py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Creating account...' : success ? 'Account Created' : 'Create Account'}
        </button>
      </form>

      <div className='mt-8 text-center'>
        <p className='text-sm text-gray-600'>
          Already have an account?{' '}
          <Link
            href='/auth/signin'
            className='text-gray-900 hover:text-gray-700 border-b border-dotted border-gray-400 hover:border-gray-600 transition-colors'
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
