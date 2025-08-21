import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import type { AppResponse } from '@/lib/api-response';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<AppResponse<{ following: boolean }>>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    const { slug } = await context.params;

    // Find the book
    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true, authorId: true, status: true },
    });

    if (!book) {
      return NextResponse.json(createErrorResponse('Book not found', 404), { status: 404 });
    }

    // Allow following for all users, including authors of their own books
    // Can only follow SOON and PUBLISHED books
    if (book.status !== 'PUBLISHED' && book.status !== 'SOON') {
      return NextResponse.json(createErrorResponse('Can only follow published or upcoming books', 403), {
        status: 403,
      });
    }

    // Check if already following
    const existingFollow = await prisma.bookFollow.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.bookFollow.delete({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
      });

      return NextResponse.json(createSuccessResponse({ following: false }, 'Unfollowed book'));
    } else {
      // Follow
      await prisma.bookFollow.create({
        data: {
          userId: user.id,
          bookId: book.id,
        },
      });

      return NextResponse.json(createSuccessResponse({ following: true }, 'Following book'));
    }
  } catch (error) {
    console.error('Error toggling book follow:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 500), { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<AppResponse<{ following: boolean; count: number }>>> {
  try {
    const user = await getCurrentUser();
    const { slug } = await context.params;

    // Find the book
    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!book) {
      return NextResponse.json(createErrorResponse('Book not found', 404), { status: 404 });
    }

    // Get follow count
    const followCount = await prisma.bookFollow.count({
      where: { bookId: book.id },
    });

    // Check if current user is following (if logged in)
    let following = false;
    if (user) {
      const userFollow = await prisma.bookFollow.findUnique({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
      });
      following = !!userFollow;
    }

    return NextResponse.json(createSuccessResponse({ following, count: followCount }));
  } catch (error) {
    console.error('Error getting book follow status:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 500), { status: 500 });
  }
}
