'use server';

import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const deleteChapterSchema = z.object({
  chapterId: z.string(),
  title: z.string().min(1, 'Title is required'),
});

export async function deleteChapter(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const data = {
      chapterId: formData.get('chapterId') as string,
      title: formData.get('title') as string,
    };

    const validatedData = deleteChapterSchema.parse(data);

    // Get chapter with book to verify ownership and title
    const chapter = await prisma.chapter.findUnique({
      where: { id: validatedData.chapterId },
      include: {
        book: {
          select: {
            authorId: true,
            slug: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    // Only the book author can delete chapters
    if (chapter.book.authorId !== user.id) {
      throw new Error('Only the book author can delete chapters');
    }

    // Verify the title matches exactly
    if (chapter.title !== validatedData.title) {
      throw new Error('Chapter title does not match');
    }

    // Delete the chapter
    await prisma.chapter.delete({
      where: { id: validatedData.chapterId },
    });

    // Redirect to book page
    redirect(`/books/${chapter.book.slug}`);
  } catch (error) {
    console.error('Delete chapter error:', error);
    throw error;
  }
}
