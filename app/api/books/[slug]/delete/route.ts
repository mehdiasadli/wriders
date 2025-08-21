import { NextRequest, NextResponse } from 'next/server';
import { findBookBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Validate slug parameter
    const slugValidation = findBookBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid book slug', 400), { status: 400 });
    }

    // TODO: Get user ID from authentication token
    const userId = 'temp-user-id'; // Replace with actual user ID from token

    // Check if book exists and user has permission
    const existingBook = await prisma.book.findUnique({
      where: { slug: params.slug },
    });

    if (!existingBook) {
      return NextResponse.json(createErrorResponse('Book not found', 404), { status: 404 });
    }

    if (existingBook.authorId !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to delete this book', 403), {
        status: 403,
      });
    }

    // Delete book
    await prisma.book.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(createSuccessResponse(null, 'Book deleted successfully'), { status: 200 });
  } catch (error) {
    console.error('Error deleting book:', error);

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
