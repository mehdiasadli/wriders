import { Prisma } from '@prisma/client';

export function booksFindManyWhere(userId: string) {
  return {
    OR: [
      { authorId: userId },
      { status: 'PUBLISHED', visibility: 'PUBLIC' },
      { status: 'PUBLISHED', visibility: 'PRIVATE', followers: { some: { userId } } },
    ],
  } as const;
}

export function chaptersFindManyWhere(userId: string) {
  return {
    OR: [
      { book: { authorId: userId } },
      { status: 'PUBLISHED', book: { status: 'PUBLISHED', visibility: 'PUBLIC' } },
      { status: 'PUBLISHED', book: { status: 'PUBLISHED', visibility: 'PRIVATE', followers: { some: { userId } } } },
    ] as const,
  };
}

export function commentsFindManyWhere(userId: string): Prisma.CommentWhereInput {
  return {
    OR: [
      { chapter: { book: { authorId: userId } } },
      { chapter: { status: 'PUBLISHED', book: { status: 'PUBLISHED', visibility: 'PUBLIC' } } },
      {
        chapter: {
          status: 'PUBLISHED',
          book: { status: 'PUBLISHED', visibility: 'PRIVATE', followers: { some: { userId } } },
        },
      },
    ] as const,
  };
}
