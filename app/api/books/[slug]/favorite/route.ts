import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';
import type { AppResponse } from '@/lib/api-response';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<AppResponse<{ favorited: boolean }>>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(createErrorResponse('Unauthorized', 401), { status: 401 });
    }

    const { slug } = await context.params;

    // Find the book
    const book = await prisma.book.findUnique({
      where: { slug },
      select: { id: true, status: true, visibility: true, authorId: true },
    });

    if (!book) {
      return NextResponse.json(createErrorResponse('Book not found', 404), { status: 404 });
    }

    // Can only favorite PUBLISHED books
    if (book.status !== 'PUBLISHED') {
      return NextResponse.json(createErrorResponse('Can only favorite published books', 403), { status: 403 });
    }

    // Check if user can see this book (for private books)
    if (book.visibility === 'PRIVATE') {
      const isAuthor = book.authorId === user.id;
      const isFollowing = await prisma.bookFollow.findUnique({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
      });

      if (!isAuthor && !isFollowing) {
        return NextResponse.json(createErrorResponse('Cannot favorite this book', 403), { status: 403 });
      }
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteBook.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: book.id,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteBook.delete({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
      });

      return NextResponse.json(createSuccessResponse({ favorited: false }, 'Removed from favorites'));
    } else {
      // Add to favorites
      await prisma.favoriteBook.create({
        data: {
          userId: user.id,
          bookId: book.id,
        },
      });

      return NextResponse.json(createSuccessResponse({ favorited: true }, 'Added to favorites'));
    }
  } catch (error) {
    console.error('Error toggling book favorite:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 500), { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
): Promise<NextResponse<AppResponse<{ favorited: boolean; count: number }>>> {
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

    // Get favorite count
    const favoriteCount = await prisma.favoriteBook.count({
      where: { bookId: book.id },
    });

    // Check if current user has favorited (if logged in)
    let favorited = false;
    if (user) {
      const userFavorite = await prisma.favoriteBook.findUnique({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: book.id,
          },
        },
      });
      favorited = !!userFavorite;
    }

    return NextResponse.json(createSuccessResponse({ favorited, count: favoriteCount }));
  } catch (error) {
    console.error('Error getting book favorite status:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 500), { status: 500 });
  }
}
