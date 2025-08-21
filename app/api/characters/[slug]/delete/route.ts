import { NextRequest, NextResponse } from 'next/server';
import { findCharacterBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Validate slug parameter
    const slugValidation = findCharacterBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid character slug', 400), { status: 400 });
    }

    // TODO: Get user ID from authentication token
    const userId = 'temp-user-id'; // Replace with actual user ID from token

    // Check if character exists and user has permission
    const existingCharacter = await prisma.character.findUnique({
      where: { slug: params.slug },
    });

    if (!existingCharacter) {
      return NextResponse.json(createErrorResponse('Character not found', 404), { status: 404 });
    }

    if (existingCharacter.creatorId !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to delete this character', 403), {
        status: 403,
      });
    }

    // Delete character
    await prisma.character.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(createSuccessResponse(null, 'Character deleted successfully'), { status: 200 });
  } catch (error) {
    console.error('Error deleting character:', error);

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
