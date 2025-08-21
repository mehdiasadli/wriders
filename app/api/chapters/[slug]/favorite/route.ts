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

    // Find the chapter with book info
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        book: {
          select: {
            id: true,
            status: true,
            visibility: true,
            authorId: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(createErrorResponse('Chapter not found', 404), { status: 404 });
    }

    // Only allow favoriting published chapters
    if (chapter.status !== 'PUBLISHED') {
      return NextResponse.json(createErrorResponse('Can only favorite published chapters', 403), { status: 403 });
    }

    // Check if user can access the book (for private books)
    if (chapter.book.visibility === 'PRIVATE') {
      const isAuthor = chapter.book.authorId === user.id;
      if (!isAuthor) {
        const isFollowing = await prisma.bookFollow.findUnique({
          where: {
            userId_bookId: {
              userId: user.id,
              bookId: chapter.book.id,
            },
          },
        });

        if (!isFollowing) {
          return NextResponse.json(createErrorResponse('Cannot favorite this chapter', 403), { status: 403 });
        }
      }
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteChapter.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId: chapter.id,
        },
      },
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteChapter.delete({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: chapter.id,
          },
        },
      });

      return NextResponse.json(createSuccessResponse({ favorited: false }, 'Removed from favorites'));
    } else {
      // Add to favorites
      await prisma.favoriteChapter.create({
        data: {
          userId: user.id,
          chapterId: chapter.id,
        },
      });

      return NextResponse.json(createSuccessResponse({ favorited: true }, 'Added to favorites'));
    }
  } catch (error) {
    console.error('Error toggling chapter favorite:', error);
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

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!chapter) {
      return NextResponse.json(createErrorResponse('Chapter not found', 404), { status: 404 });
    }

    // Get favorite count
    const favoriteCount = await prisma.favoriteChapter.count({
      where: { chapterId: chapter.id },
    });

    // Check if current user has favorited (if logged in)
    let favorited = false;
    if (user) {
      const userFavorite = await prisma.favoriteChapter.findUnique({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: chapter.id,
          },
        },
      });
      favorited = !!userFavorite;
    }

    return NextResponse.json(createSuccessResponse({ favorited, count: favoriteCount }));
  } catch (error) {
    console.error('Error getting chapter favorite status:', error);
    return NextResponse.json(createErrorResponse('Internal server error', 500), { status: 500 });
  }
}
