import { NextRequest, NextResponse } from 'next/server';
import { findChapterBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    // Validate slug parameter
    const slugValidation = findChapterBySlugSchema.safeParse({ slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid chapter slug', 400), { status: 400 });
    }

    // TODO: Get user ID from authentication token
    const userId = 'temp-user-id'; // Replace with actual user ID from token

    // Check if chapter exists and user has permission
    const existingChapter = await prisma.chapter.findUnique({
      where: { slug },
      include: { book: true },
    });

    if (!existingChapter) {
      return NextResponse.json(createErrorResponse('Chapter not found', 404), { status: 404 });
    }

    if (existingChapter.book.authorId !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to delete this chapter', 403), {
        status: 403,
      });
    }

    // Delete chapter
    await prisma.chapter.delete({
      where: { slug },
    });

    return NextResponse.json(createSuccessResponse(null, 'Chapter deleted successfully'), { status: 200 });
  } catch (error) {
    console.error('Error deleting chapter:', error);

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
