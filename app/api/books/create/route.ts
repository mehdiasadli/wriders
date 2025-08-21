import { NextRequest, NextResponse } from 'next/server';
import { createBookSchema } from '@/schemas';
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
    const validatedData = createBookSchema.safeParse(body);
    console.log('BODY:', body);
    console.log('VALIDATED:', validatedData);

    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Generate slug from title
    const slug = slugify(validatedData.data.title);

    // Create book
    const book = await prisma.book.create({
      data: {
        ...validatedData.data,
        slug,
        authorId: userId,
      },
    });

    return NextResponse.json(createSuccessResponse(book, 'Book created successfully', 201), { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(createErrorResponse('A book with this title already exists', 409), { status: 409 });
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
