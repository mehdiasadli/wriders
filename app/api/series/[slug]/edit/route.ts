import { NextRequest, NextResponse } from 'next/server';
import { updateSeriesSchema, findSeriesBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();

    // Validate slug parameter
    const slugValidation = findSeriesBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid series slug', 400), { status: 400 });
    }

    // Validate request body
    const validatedData = updateSeriesSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Check if series exists
    const existingSeries = await prisma.series.findUnique({
      where: { slug: params.slug },
    });

    if (!existingSeries) {
      return NextResponse.json(createErrorResponse('Series not found', 404), { status: 404 });
    }

    // Update series
    const updatedSeries = await prisma.series.update({
      where: { slug: params.slug },
      data: validatedData.data,
    });

    return NextResponse.json(createSuccessResponse(updatedSeries, 'Series updated successfully'), { status: 200 });
  } catch (error) {
    console.error('Error updating series:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(createErrorResponse('A series with this title already exists', 409), { status: 409 });
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
