import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = createUserSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    // Generate slug from name
    const slug = slugify(validatedData.data.name);

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...validatedData.data,
        password: hashedPassword,
        slug,
      },
    });

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(createSuccessResponse(userWithoutPassword, 'User created successfully', 201), {
      status: 201,
    });
  } catch (error) {
    console.error('Error creating user:', error);

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
