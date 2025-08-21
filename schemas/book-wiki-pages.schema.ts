import { z } from 'zod';
import { bookSchema } from './books.schema';
import { wikiPageSchema } from './wiki-pages.schema';

export const bookWikiPageSchema = z.object({
  bookId: bookSchema.shape.id,
  wikiPageId: wikiPageSchema.shape.id,
});

export const createBookWikiPageSchema = bookWikiPageSchema;

export const findBookWikiPageSchema = z.object({
  bookId: bookWikiPageSchema.shape.bookId,
  wikiPageId: bookWikiPageSchema.shape.wikiPageId,
});

export const findManyBookWikiPagesSchema = z.object({
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

export const deleteBookWikiPageSchema = z.object({
  bookId: bookWikiPageSchema.shape.bookId,
  wikiPageId: bookWikiPageSchema.shape.wikiPageId,
});

export type BookWikiPageSchema = z.infer<typeof bookWikiPageSchema>;
export type CreateBookWikiPageSchema = z.infer<typeof createBookWikiPageSchema>;
export type FindBookWikiPageSchema = z.infer<typeof findBookWikiPageSchema>;
export type FindManyBookWikiPagesSchema = z.infer<typeof findManyBookWikiPagesSchema>;
export type DeleteBookWikiPageSchema = z.infer<typeof deleteBookWikiPageSchema>;
