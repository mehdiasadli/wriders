import { z } from 'zod';
import { BookVisibilitySchema, ContentStatusSchema } from './enums.schema';
import { userSchema } from './users.schema';

export const bookSchema = z.object({
  id: z
    .string({
      required_error: 'Book ID is required',
      invalid_type_error: 'Book ID must be a string',
    })
    .uuid('Book ID is invalid'),
  createdAt: z.coerce.date({
    required_error: 'Book created at is required',
    invalid_type_error: 'Book created at must be a date',
  }),
  updatedAt: z.coerce.date({
    required_error: 'Book updated at is required',
    invalid_type_error: 'Book updated at must be a date',
  }),
  slug: z
    .string({
      required_error: 'Book slug is required',
      invalid_type_error: 'Book slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zəöğçşü0-9]+)*$/i, 'Invalid slug'),
  title: z.string({
    required_error: 'Book title is required',
    invalid_type_error: 'Book title must be a string',
  }),
  synopsis: z
    .string({
      required_error: 'Book synopsis is required',
      invalid_type_error: 'Book synopsis must be a string',
    })
    .nullish(),
  publishedAt: z.coerce
    .date({
      required_error: 'Book published at is required',
      invalid_type_error: 'Book published at must be a date',
    })
    .nullish(),
  visibility: BookVisibilitySchema,
  status: ContentStatusSchema,
  authorId: userSchema.shape.id,
});

export const createBookSchema = bookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  authorId: true,
  publishedAt: true,
  status: true,
});

export const updateBookSchema = createBookSchema
  .omit({
    title: true,
  })
  .extend({
    status: bookSchema.shape.status,
  })
  .partial();

export const findBookBySlugSchema = z.object({
  slug: bookSchema.shape.slug,
});

export const findBookByIdSchema = z.object({
  id: bookSchema.shape.id,
});

export const findManyBooksSchema = z.object({
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

export const deleteBookSchema = z.object({
  id: bookSchema.shape.id,
});

export type BookSchema = z.infer<typeof bookSchema>;
export type CreateBookSchema = z.infer<typeof createBookSchema>;
export type UpdateBookSchema = z.infer<typeof updateBookSchema>;
export type FindBookBySlugSchema = z.infer<typeof findBookBySlugSchema>;
export type FindBookByIdSchema = z.infer<typeof findBookByIdSchema>;
export type FindManyBooksSchema = z.infer<typeof findManyBooksSchema>;
export type DeleteBookSchema = z.infer<typeof deleteBookSchema>;
