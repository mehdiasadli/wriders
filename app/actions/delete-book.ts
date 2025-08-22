'use server';

import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const deleteBookSchema = z.object({
  bookId: z.string(),
  title: z.string().min(1, 'Title is required'),
});

export async function deleteBook(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const data = {
      bookId: formData.get('bookId') as string,
      title: formData.get('title') as string,
    };

    const validatedData = deleteBookSchema.parse(data);

    // Get book to verify ownership and title
    const book = await prisma.book.findUnique({
      where: { id: validatedData.bookId },
      select: {
        id: true,
        title: true,
        authorId: true,
      },
    });

    if (!book) {
      throw new Error('Book not found');
    }

    // Only the author can delete their own books
    if (book.authorId !== user.id) {
      throw new Error('Only the author can delete their own books');
    }

    // Verify the title matches exactly
    if (book.title !== validatedData.title) {
      throw new Error('Book title does not match');
    }

    // Delete the book (this will cascade delete chapters, comments, etc.)
    await prisma.book.delete({
      where: { id: validatedData.bookId },
    });

    // Redirect to author's books page
    redirect(`/users/${user.slug}/books`);
  } catch (error) {
    console.error('Delete book error:', error);
    throw error;
  }
}
