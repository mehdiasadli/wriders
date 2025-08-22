import { z } from 'zod';
import { ContentStatusSchema } from './enums.schema';
import { bookSchema } from './books.schema';

export const chapterSchema = z.object({
  id: z
    .string({
      required_error: 'Chapter ID is required',
      invalid_type_error: 'Chapter ID must be a string',
    })
    .uuid('Chapter ID is invalid'),
  slug: z
    .string({
      required_error: 'Chapter slug is required',
      invalid_type_error: 'Chapter slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zəöğçşü0-9]+)*$/i, 'Invalid slug'),
  title: z.string({
    required_error: 'Chapter title is required',
    invalid_type_error: 'Chapter title must be a string',
  }),
  order: z
    .number({
      required_error: 'Chapter order is required',
      invalid_type_error: 'Chapter order must be a number',
    })
    .int('Chapter order must be an integer')
    .positive('Chapter order must be a positive number'),
  synopsis: z
    .string({
      required_error: 'Chapter synopsis is required',
      invalid_type_error: 'Chapter synopsis must be a string',
    })
    .nullish(),
  status: ContentStatusSchema,
  publishedAt: z.coerce
    .date({
      required_error: 'Chapter published at is required',
      invalid_type_error: 'Chapter published at must be a date',
    })
    .nullish(),
  content: z.string({
    required_error: 'Chapter content is required',
    invalid_type_error: 'Chapter content must be a string',
  }),
  createdAt: z.coerce.date({
    required_error: 'Chapter created at is required',
    invalid_type_error: 'Chapter created at must be a date',
  }),
  updatedAt: z.coerce.date({
    required_error: 'Chapter updated at is required',
    invalid_type_error: 'Chapter updated at must be a date',
  }),
  bookId: bookSchema.shape.id,
});

// Simplified schema for chapter creation (meta only)
export const createChapterSchema = z.object({
  title: chapterSchema.shape.title,
  synopsis: chapterSchema.shape.synopsis,
  order: chapterSchema.shape.order,
  bookId: chapterSchema.shape.bookId,
});

export const updateChapterSchema = createChapterSchema
  .omit({
    bookId: true,
  })
  .extend({
    content: chapterSchema.shape.content,
    status: chapterSchema.shape.status,
  })
  .partial();

export const findChapterByIdSchema = z.object({
  id: chapterSchema.shape.id,
});

export const findChapterBySlugSchema = z.object({
  slug: chapterSchema.shape.slug,
});

export const findManyChaptersSchema = z.object({
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

export const deleteChapterSchema = z.object({
  id: chapterSchema.shape.id,
});

export const reorderChaptersSchema = z.object({
  bookSlug: z.string({
    required_error: 'Book slug is required',
    invalid_type_error: 'Book slug must be a string',
  }),
  chapters: z.array(
    z.object({
      id: chapterSchema.shape.id,
      order: chapterSchema.shape.order,
    })
  ),
});

export type ChapterSchema = z.infer<typeof chapterSchema>;
export type CreateChapterSchema = z.infer<typeof createChapterSchema>;
export type UpdateChapterSchema = z.infer<typeof updateChapterSchema>;
export type FindChapterByIdSchema = z.infer<typeof findChapterByIdSchema>;
export type FindChapterBySlugSchema = z.infer<typeof findChapterBySlugSchema>;
export type FindManyChaptersSchema = z.infer<typeof findManyChaptersSchema>;
export type DeleteChapterSchema = z.infer<typeof deleteChapterSchema>;
export type ReorderChaptersSchema = z.infer<typeof reorderChaptersSchema>;
