import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createCommentSchema } from '@/schemas/comments.schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Get the chapter to check access
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        book: {
          select: {
            authorId: true,
            slug: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const session = await auth();

    // Check if user can view comments (published chapter or author)
    if (chapter.status !== 'PUBLISHED' && chapter.book.authorId !== session?.user?.id) {
      return NextResponse.json({ error: 'Comments not available' }, { status: 403 });
    }

    // Get comments with nested replies (up to depth 4)
    const comments = await prisma.comment.findMany({
      where: {
        chapterId: chapter.id,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
                _count: {
                  select: {
                    replies: true,
                  },
                },
                replies: {
                  include: {
                    author: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                      },
                    },
                    _count: {
                      select: {
                        replies: true,
                      },
                    },
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: {
        id: true,
        status: true,
        book: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user can comment (published chapter or author)
    if (chapter.status !== 'PUBLISHED' && chapter.book.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Cannot comment on this chapter' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createCommentSchema.parse(body);

    // Calculate depth for replies
    let depth = 1;
    if (validatedData.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: validatedData.parentId },
        select: { depth: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }

      depth = parentComment.depth + 1;
      if (depth > 4) {
        return NextResponse.json({ error: 'Maximum reply depth exceeded' }, { status: 400 });
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        depth,
        authorId: session.user.id,
        chapterId: chapter.id,
        parentId: validatedData.parentId || null,
        slug: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
