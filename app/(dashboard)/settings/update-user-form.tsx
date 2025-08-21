'use client';

import { updateUserSchema, UpdateUserSchema } from '@/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface UpdateUserFormProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'slug'>;
}

export function UpdateUserForm({ user }: UpdateUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { update: updateSession } = useSession();
  const router = useRouter();

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
    },
  });

  const handleSubmit = async (data: UpdateUserSchema) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update user');
      }

      const result = await response.json();

      if (result.success) {
        // Refresh the session to get updated user data
        await updateSession();

        toast.success('User updated successfully!');

        // Use the updated slug for navigation
        const userSlug = result.data?.user?.slug || user.slug;
        router.push(`/users/${userSlug}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='max-w-2xl mx-auto'>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm text-gray-700'>
              Name
            </label>
            <input
              id='name'
              type='text'
              placeholder='Enter your name...'
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
              placeholder='Enter your email...'
              className='w-full px-3 py-2 border border-gray-200 focus:border-gray-400 focus:outline-none bg-white text-gray-900'
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className='text-sm text-red-600'>{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='ml-auto text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-400 px-4 py-2 bg-white hover:bg-gray-50'
        >
          {isLoading ? 'Updating...' : 'Update User'}
        </button>
      </form>
    </div>
  );
}
