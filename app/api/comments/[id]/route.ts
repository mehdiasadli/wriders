import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCommentSchema } from '@/schemas/comments.schema';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        chapter: {
          select: { status: true, book: { select: { authorId: true } } },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user can edit (author of comment or chapter author)
    if (comment.authorId !== session.user.id && comment.chapter.book.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Cannot edit this comment' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateCommentSchema.parse(body);

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: validatedData.content,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        chapter: {
          select: { status: true, book: { select: { authorId: true } } },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user can delete (author of comment or chapter author)
    if (comment.authorId !== session.user.id && comment.chapter.book.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Cannot delete this comment' }, { status: 403 });
    }

    // If comment has replies, don't allow deletion
    if (comment._count.replies > 0) {
      return NextResponse.json({ error: 'Cannot delete comment with replies' }, { status: 400 });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
