import { z } from 'zod';
import { userSchema } from './users.schema';
import { bookSchema } from './books.schema';

export const bookFollowSchema = z.object({
  userId: userSchema.shape.id,
  bookId: bookSchema.shape.id,
  createdAt: z.coerce.date({
    required_error: 'Book follow created at is required',
    invalid_type_error: 'Book follow created at must be a date',
  }),
});

export const createBookFollowSchema = bookFollowSchema.omit({
  createdAt: true,
  userId: true,
});

export const findBookFollowSchema = z.object({
  userId: bookFollowSchema.shape.userId,
  bookId: bookFollowSchema.shape.bookId,
});

export const findManyBookFollowsSchema = z.object({
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

export const deleteBookFollowSchema = z.object({
  userId: bookFollowSchema.shape.userId,
  bookId: bookFollowSchema.shape.bookId,
});

export type BookFollowSchema = z.infer<typeof bookFollowSchema>;
export type CreateBookFollowSchema = z.infer<typeof createBookFollowSchema>;
export type FindBookFollowSchema = z.infer<typeof findBookFollowSchema>;
export type FindManyBookFollowsSchema = z.infer<typeof findManyBookFollowsSchema>;
export type DeleteBookFollowSchema = z.infer<typeof deleteBookFollowSchema>;
