import { NextRequest, NextResponse } from 'next/server';
import { findUserBySlugSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Validate slug parameter
    const slugValidation = findUserBySlugSchema.safeParse({ slug: params.slug });
    if (!slugValidation.success) {
      return NextResponse.json(createErrorResponse('Invalid user slug', 400), { status: 400 });
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
      return NextResponse.json(createErrorResponse('You do not have permission to delete this user', 403), {
        status: 403,
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(createSuccessResponse(null, 'User deleted successfully'), { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);

    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
