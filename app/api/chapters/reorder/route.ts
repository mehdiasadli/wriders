import { getCurrentUser } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { reorderChaptersSchema } from '@/schemas/chapters.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = reorderChaptersSchema.parse(body);

    // Check if user is the author of the book
    const book = await prisma.book.findUnique({
      where: { slug: validatedData.bookSlug },
      select: { id: true, authorId: true },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (book.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You are not the author of this book' }, { status: 403 });
    }

    // Verify all chapters belong to this book
    const chapterIds = validatedData.chapters.map((c) => c.id);
    const existingChapters = await prisma.chapter.findMany({
      where: {
        id: { in: chapterIds },
        bookId: book.id,
      },
      select: { id: true },
    });

    if (existingChapters.length !== chapterIds.length) {
      return NextResponse.json({ error: 'Some chapters do not belong to this book' }, { status: 400 });
    }

    // Update chapter orders in a transaction
    // First, set all orders to negative values to avoid unique constraint conflicts
    await prisma.$transaction([
      // Set all chapters to negative order values first
      ...validatedData.chapters.map((chapter, index) =>
        prisma.chapter.update({
          where: { id: chapter.id },
          data: { order: -(index + 1) },
        })
      ),
      // Then set them to the correct positive values
      ...validatedData.chapters.map((chapter) =>
        prisma.chapter.update({
          where: { id: chapter.id },
          data: { order: chapter.order },
        })
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering chapters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
