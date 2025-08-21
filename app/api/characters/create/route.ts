import { NextRequest, NextResponse } from 'next/server';
import { createCharacterSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createCharacterSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // TODO: Get user ID from authentication token
    const userId = 'temp-user-id'; // Replace with actual user ID from token

    // Generate slug from fullName or description
    const slugSource = validatedData.data.fullName || validatedData.data.description || 'character';
    const slug = slugify(slugSource);

    // Create character
    const character = await prisma.character.create({
      data: {
        ...validatedData.data,
        slug,
        creatorId: userId,
      },
    });

    return NextResponse.json(createSuccessResponse(character, 'Character created successfully', 201), { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);

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
