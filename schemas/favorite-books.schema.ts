import { z } from 'zod';
import { userSchema } from './users.schema';
import { bookSchema } from './books.schema';

export const favoriteBookSchema = z.object({
  userId: userSchema.shape.id,
  bookId: bookSchema.shape.id,
  createdAt: z.coerce.date({
    required_error: 'Favorite book created at is required',
    invalid_type_error: 'Favorite book created at must be a date',
  }),
});

export const createFavoriteBookSchema = favoriteBookSchema.omit({
  createdAt: true,
  userId: true,
});

export const findFavoriteBookSchema = z.object({
  userId: favoriteBookSchema.shape.userId,
  bookId: favoriteBookSchema.shape.bookId,
});

export const findManyFavoriteBooksSchema = z.object({
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

export const deleteFavoriteBookSchema = z.object({
  userId: favoriteBookSchema.shape.userId,
  bookId: favoriteBookSchema.shape.bookId,
});

export type FavoriteBookSchema = z.infer<typeof favoriteBookSchema>;
export type CreateFavoriteBookSchema = z.infer<typeof createFavoriteBookSchema>;
export type FindFavoriteBookSchema = z.infer<typeof findFavoriteBookSchema>;
export type FindManyFavoriteBooksSchema = z.infer<typeof findManyFavoriteBooksSchema>;
export type DeleteFavoriteBookSchema = z.infer<typeof deleteFavoriteBookSchema>;
