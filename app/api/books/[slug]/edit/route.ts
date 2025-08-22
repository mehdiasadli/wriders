import { NextRequest, NextResponse } from 'next/server';
import { updateBookSchema, findBookBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    const { slug } = await params;

    const userId = session.user.id;
    const body = await request.json();

    // Validate slug parameter
    const slugValidation = findBookBySlugSchema.safeParse({ slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid book slug', 400), { status: 400 });
    }

    // Validate request body
    const validatedData = updateBookSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Check if book exists and user has permission
    const existingBook = await prisma.book.findUnique({
      where: { slug },
    });

    if (!existingBook) {
      return NextResponse.json(createErrorResponse('Book not found', 404), { status: 404 });
    }

    if (existingBook.authorId !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to edit this book', 403), {
        status: 403,
      });
    }

    // check if the book's status is published and it is the first time it is published, set the date
    let publishedAt: Date | undefined = undefined;
    if (validatedData.data.status && validatedData.data.status === 'PUBLISHED' && !existingBook.publishedAt) {
      publishedAt = new Date();
    }

    // Update book
    const updatedBook = await prisma.book.update({
      where: { slug },
      data: { ...validatedData.data, publishedAt },
    });

    return NextResponse.json(createSuccessResponse(updatedBook, 'Book updated successfully'), { status: 200 });
  } catch (error) {
    console.error('Error updating book:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(createErrorResponse('A book with this title already exists', 409), { status: 409 });
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
