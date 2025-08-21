import { NextRequest, NextResponse } from 'next/server';
import { updateUserSchema, findUserBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();

    // Validate slug parameter
    const slugValidation = findUserBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid user slug', 400), { status: 400 });
    }

    // Validate request body
    const validatedData = updateUserSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // TODO: Get user ID from authentication token
    const userId = 'temp-user-id'; // Replace with actual user ID from token

    // Check if user exists and has permission
    const existingUser = await prisma.user.findUnique({
      where: { slug: params.slug },
    });

    if (!existingUser) {
      return NextResponse.json(createErrorResponse('User not found', 404), { status: 404 });
    }

    if (existingUser.id !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to edit this user', 403), {
        status: 403,
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { slug: params.slug },
      data: validatedData.data,
    });

    return NextResponse.json(createSuccessResponse(updatedUser, 'User updated successfully'), { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('email')) {
          return NextResponse.json(createErrorResponse('A user with this email already exists', 409), { status: 409 });
        }
        if (error.message.includes('slug')) {
          return NextResponse.json(createErrorResponse('A user with this name already exists', 409), { status: 409 });
        }
      }
    }

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
