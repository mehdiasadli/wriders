// resend verification email

import { createErrorResponse, createSuccessResponse } from '@/lib/api-response';
import { sendVerificationEmail } from '@/lib/mailjet';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const resendVerificationSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email({ message: 'Invalid email address' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resendVerificationSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(createErrorResponse(validatedData.error.errors[0].message, 400), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: validatedData.data.email },
    });

    if (!user) {
      return NextResponse.json(createErrorResponse('User not found', 404), { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json(createErrorResponse('User already verified. Try to login.', 400), { status: 400 });
    }

    // delete all existing verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // create new verification token
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
      // delete that verification token in db
      await prisma.emailVerificationToken.delete({
        where: { id: emailVerificationToken.id },
      });

      return NextResponse.json(createErrorResponse('Failed to send verification email. Please try again.', 500), {
        status: 500,
      });
    }

    return NextResponse.json(
      createSuccessResponse(
        emailResult.data,
        'Verification email sent successfully. Please check your email address (and spam folder) for a verification email.',
        200
      ),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(createErrorResponse(), { status: 500 });
  }
}
