import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
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

    // Check if user can read this chapter (published chapter or author)
    if (chapter.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Only published chapters can be marked as read' }, { status: 403 });
    }

    // Check if already read
    const existingRead = await prisma.chapterRead.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: session.user.id,
        },
      },
    });

    if (existingRead) {
      return NextResponse.json({ message: 'Chapter already marked as read' });
    }

    // Mark as read
    await prisma.chapterRead.create({
      data: {
        chapterId: chapter.id,
        userId: session.user.id,
      },
    });

    // Get updated read count
    const readCount = await prisma.chapterRead.count({
      where: { chapterId: chapter.id },
    });

    return NextResponse.json({
      message: 'Chapter marked as read',
      readCount,
    });
  } catch (error) {
    console.error('Error marking chapter as read:', error);
    return NextResponse.json({ error: 'Failed to mark chapter as read' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the chapter
    const chapter = await prisma.chapter.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    // Check if user has read this chapter
    const readRecord = await prisma.chapterRead.findUnique({
      where: {
        chapterId_userId: {
          chapterId: chapter.id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({
      hasRead: !!readRecord,
      readAt: readRecord?.readAt || null,
    });
  } catch (error) {
    console.error('Error checking chapter read status:', error);
    return NextResponse.json({ error: 'Failed to check read status' }, { status: 500 });
  }
}
