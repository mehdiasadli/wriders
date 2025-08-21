import { NextRequest, NextResponse } from 'next/server';
import { createChapterSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    const validatedData = createChapterSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Check if user has permission to add chapters to this book
    const book = await prisma.book.findUnique({
      where: { id: validatedData.data.bookId },
    });

    if (!book) {
      return NextResponse.json(createErrorResponse('Book not found', 404), { status: 404 });
    }

    if (book.authorId !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to add chapters to this book', 403), {
        status: 403,
      });
    }

    // Generate slug from title
    const slug = slugify(validatedData.data.title);

    // Create chapter with default values
    const chapter = await prisma.chapter.create({
      data: {
        ...validatedData.data,
        slug,
        status: 'DRAFT', // Default status
        content: '', // Empty content initially
      },
    });

    return NextResponse.json(createSuccessResponse(chapter, 'Chapter created successfully', 201), { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(createErrorResponse('A chapter with this title already exists in this book', 409), {
          status: 409,
        });
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
