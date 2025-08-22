'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface ResendVerificationFormProps {
  email?: string;
  onSuccess?: () => void;
}

export function ResendVerificationForm({ email: initialEmail, onSuccess }: ResendVerificationFormProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to send verification email');
        return;
      }

      setSuccess(result.message);
      toast.success('Verification email sent successfully!');

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h2 className='text-2xl font-serif text-gray-900 mb-2'>Resend Verification Email</h2>
        <p className='text-sm text-gray-600'>Enter your email address to receive a new verification link.</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label htmlFor='email' className='block text-sm text-gray-700 mb-2'>
            Email Address
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='Enter your email address'
            className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
            disabled={isLoading}
            required
          />
        </div>

        {error && <div className='text-sm text-red-600 p-3 border border-red-200 bg-red-50'>{error}</div>}

        {success && <div className='text-sm text-green-600 p-3 border border-green-200 bg-green-50'>{success}</div>}

        <button
          type='submit'
          disabled={isLoading}
          className='w-full py-3 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? 'Sending...' : 'Send Verification Email'}
        </button>
      </form>
    </div>
  );
}
