import { NextRequest, NextResponse } from 'next/server';
import { createSeriesSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createSeriesSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Generate slug from title
    const slug = slugify(validatedData.data.title);

    // Create series
    const series = await prisma.series.create({
      data: {
        ...validatedData.data,
        slug,
      },
    });

    return NextResponse.json(createSuccessResponse(series, 'Series created successfully', 201), { status: 201 });
  } catch (error) {
    console.error('Error creating series:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(createErrorResponse('A series with this title already exists', 409), { status: 409 });
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
