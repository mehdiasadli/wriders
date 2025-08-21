import { NextRequest, NextResponse } from 'next/server';
import { updateChapterSchema, findChapterBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate slug parameter
    const slugValidation = findChapterBySlugSchema.safeParse({ slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid chapter slug', 400), { status: 400 });
    }

    // Validate request body
    const validatedData = updateChapterSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Check if chapter exists and user has permission
    const existingChapter = await prisma.chapter.findUnique({
      where: { slug },
      include: { book: true },
    });

    if (!existingChapter) {
      return NextResponse.json(createErrorResponse('Chapter not found', 404), { status: 404 });
    }

    if (existingChapter.book.authorId !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to edit this chapter', 403), {
        status: 403,
      });
    }

    // check if the chapter's status is published and it is the first time it is published, set the date
    let publishedAt: Date | undefined = undefined;
    if (validatedData.data.status && validatedData.data.status === 'PUBLISHED' && !existingChapter.publishedAt) {
      publishedAt = new Date();
    }

    // if title is updated, update the slug
    let newSlug = existingChapter.slug;
    if (validatedData.data.title && validatedData.data.title !== existingChapter.title) {
      newSlug = slugify(validatedData.data.title);
    }

    // Update chapter
    const updatedChapter = await prisma.chapter.update({
      where: { slug },
      data: {
        ...validatedData.data,
        content: validatedData.data.content || undefined,
        publishedAt,
        slug: newSlug,
      },
    });

    return NextResponse.json(createSuccessResponse(updatedChapter, 'Chapter updated successfully'), { status: 200 });
  } catch (error) {
    console.error('Error updating chapter:', error);

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
