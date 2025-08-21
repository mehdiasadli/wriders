import { z } from 'zod';
import { userSchema } from './users.schema';
import { chapterSchema } from './chapters.schema';

export const favoriteChapterSchema = z.object({
  userId: userSchema.shape.id,
  chapterId: chapterSchema.shape.id,
  createdAt: z.coerce.date({
    required_error: 'Favorite chapter created at is required',
    invalid_type_error: 'Favorite chapter created at must be a date',
  }),
});

export const createFavoriteChapterSchema = favoriteChapterSchema.omit({
  createdAt: true,
  userId: true,
});

export const findFavoriteChapterSchema = z.object({
  userId: favoriteChapterSchema.shape.userId,
  chapterId: favoriteChapterSchema.shape.chapterId,
});

export const findManyFavoriteChaptersSchema = z.object({
  page: z.coerce
    .number({
      invalid_type_error: 'Page must be a number',
    })
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .nullish(),
  limit: z.coerce
    .number({
      invalid_type_error: 'Limit must be a number',
    })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit must be at most 100')
    .nullish(),
  order: z
    .string({
      invalid_type_error: 'Order must be a string',
    })
    .nullish(),
});

export const deleteFavoriteChapterSchema = z.object({
  userId: favoriteChapterSchema.shape.userId,
  chapterId: favoriteChapterSchema.shape.chapterId,
});

export type FavoriteChapterSchema = z.infer<typeof favoriteChapterSchema>;
export type CreateFavoriteChapterSchema = z.infer<typeof createFavoriteChapterSchema>;
export type FindFavoriteChapterSchema = z.infer<typeof findFavoriteChapterSchema>;
export type FindManyFavoriteChaptersSchema = z.infer<typeof findManyFavoriteChaptersSchema>;
export type DeleteFavoriteChapterSchema = z.infer<typeof deleteFavoriteChapterSchema>;
