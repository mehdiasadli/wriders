import { NextRequest, NextResponse } from 'next/server';
import { updateCharacterSchema, findCharacterBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();

    // Validate slug parameter
    const slugValidation = findCharacterBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid character slug', 400), { status: 400 });
    }

    // Validate request body
    const validatedData = updateCharacterSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
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
      return NextResponse.json(createErrorResponse('You do not have permission to edit this character', 403), {
        status: 403,
      });
    }

    // Update character
    const updatedCharacter = await prisma.character.update({
      where: { slug: params.slug },
      data: validatedData.data,
    });

    return NextResponse.json(createSuccessResponse(updatedCharacter, 'Character updated successfully'), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating character:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(createErrorResponse('A character with this name already exists', 409), {
          status: 409,
        });
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
