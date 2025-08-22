import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/schemas';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '@/lib/mailjet';

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

    // generate email verification token
    const emailVerificationToken = await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: nanoid(32),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
    });

    // send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      emailVerificationToken.token,
      emailVerificationToken.expiresAt,
      user.name
    );

    if (!emailResult.success) {
      console.error('Error sending verification email:', emailResult.message);
      // remove the user
      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json(createErrorResponse('Failed to create user. Please try to register again.', 500), {
        status: 500,
      });
    }

    // Remove password from response
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json(
      createSuccessResponse(
        userWithoutPassword,
        'User created successfully. Please check your email address (and spam folder) for a verification email.',
        201
      ),
      {
        status: 201,
      }
    );
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
