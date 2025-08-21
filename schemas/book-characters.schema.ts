import { z } from 'zod';
import { bookSchema } from './books.schema';
import { characterSchema } from './characters.schema';

export const bookCharacterSchema = z.object({
  bookId: bookSchema.shape.id,
  characterId: characterSchema.shape.id,
});

export const createBookCharacterSchema = bookCharacterSchema;

export const findBookCharacterSchema = z.object({
  bookId: bookCharacterSchema.shape.bookId,
  characterId: bookCharacterSchema.shape.characterId,
});

export const findManyBookCharactersSchema = z.object({
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

export const deleteBookCharacterSchema = z.object({
  bookId: bookCharacterSchema.shape.bookId,
  characterId: bookCharacterSchema.shape.characterId,
});

export type BookCharacterSchema = z.infer<typeof bookCharacterSchema>;
export type CreateBookCharacterSchema = z.infer<typeof createBookCharacterSchema>;
export type FindBookCharacterSchema = z.infer<typeof findBookCharacterSchema>;
export type FindManyBookCharactersSchema = z.infer<typeof findManyBookCharactersSchema>;
export type DeleteBookCharacterSchema = z.infer<typeof deleteBookCharacterSchema>;
