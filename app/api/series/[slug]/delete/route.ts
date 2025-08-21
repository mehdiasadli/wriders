import { NextRequest, NextResponse } from 'next/server';
import { findSeriesBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Validate slug parameter
    const slugValidation = findSeriesBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid series slug', 400), { status: 400 });
    }

    // Check if series exists
    const existingSeries = await prisma.series.findUnique({
      where: { slug: params.slug },
    });

    if (!existingSeries) {
      return NextResponse.json(createErrorResponse('Series not found', 404), { status: 404 });
    }

    // Delete series
    await prisma.series.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(createSuccessResponse(null, 'Series deleted successfully'), { status: 200 });
  } catch (error) {
    console.error('Error deleting series:', error);

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
