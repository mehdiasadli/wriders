'use server';

import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const deleteSeriesSchema = z.object({
  seriesId: z.string(),
  title: z.string().min(1, 'Title is required'),
});

export async function deleteSeries(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const data = {
      seriesId: formData.get('seriesId') as string,
      title: formData.get('title') as string,
    };

    const validatedData = deleteSeriesSchema.parse(data);

    // Get series with its books to verify authorization and title
    const series = await prisma.series.findUnique({
      where: { id: validatedData.seriesId },
      include: {
        books: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!series) {
      throw new Error('Series not found');
    }

    // Verify the title matches exactly
    if (series.title !== validatedData.title) {
      throw new Error('Series title does not match');
    }

    // Check authorization: user must be author of at least one book in the series
    const userIsAuthorOfBook = series.books.some((book) => book.authorId === user.id);

    if (!userIsAuthorOfBook) {
      throw new Error('Only authors of books in this series can delete it');
    }

    // Check if there are books by other authors that would prevent deletion
    const booksFromOtherAuthors = series.books.filter((book) => book.authorId !== user.id);

    if (booksFromOtherAuthors.length > 0) {
      throw new Error('Cannot delete series: it contains books by other authors');
    }

    // Delete the series (this will set seriesId to null for associated books)
    await prisma.series.delete({
      where: { id: validatedData.seriesId },
    });

    // Redirect to series list page
    redirect('/series');
  } catch (error) {
    console.error('Delete series error:', error);
    throw error;
  }
}
