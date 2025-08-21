import { createErrorResponse, createSuccessResponse } from '@/lib/api-response';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import { updateUserSchema } from '@/schemas/users.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateUserSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }
    const userId = session.user.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(createErrorResponse('User not found', 404), { status: 404 });
    }

    if (existingUser.id !== userId) {
      return NextResponse.json(createErrorResponse('You do not have permission to update this user', 403), {
        status: 403,
      });
    }

    if (validatedData.data.email && validatedData.data.email !== existingUser.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: validatedData.data.email },
      });

      if (existingUserWithEmail) {
        return NextResponse.json(createErrorResponse('A user with this email already exists', 409), { status: 409 });
      }
    }

    let slug = existingUser.slug;
    if (validatedData.data.name && validatedData.data.name !== existingUser.name) {
      slug = slugify(validatedData.data.name);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData.data,
        slug,
      },
      select: {
        id: true,
        slug: true,
        email: true,
        name: true,
        roles: true,
        wpm: true,
      },
    });

    // Return updated user data so client can refresh session if needed
    return NextResponse.json(
      createSuccessResponse(
        {
          user: updatedUser,
          slugChanged: slug !== existingUser.slug,
        },
        'User updated successfully'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
