import { z } from 'zod';
import { chapterSchema } from './chapters.schema';
import { userSchema } from './users.schema';

export const chapterReadSchema = z.object({
  chapterId: chapterSchema.shape.id,
  userId: userSchema.shape.id,
  readAt: z.coerce.date({
    required_error: 'Chapter read at is required',
    invalid_type_error: 'Chapter read at must be a date',
  }),
});

export const createChapterReadSchema = chapterReadSchema.omit({
  readAt: true,
  userId: true,
});

export const findChapterReadSchema = z.object({
  chapterId: chapterReadSchema.shape.chapterId,
  userId: chapterReadSchema.shape.userId,
});

export const findManyChapterReadsSchema = z.object({
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

export const deleteChapterReadSchema = z.object({
  chapterId: chapterReadSchema.shape.chapterId,
  userId: chapterReadSchema.shape.userId,
});

export type ChapterReadSchema = z.infer<typeof chapterReadSchema>;
export type CreateChapterReadSchema = z.infer<typeof createChapterReadSchema>;
export type FindChapterReadSchema = z.infer<typeof findChapterReadSchema>;
export type FindManyChapterReadsSchema = z.infer<typeof findManyChapterReadsSchema>;
export type DeleteChapterReadSchema = z.infer<typeof deleteChapterReadSchema>;
