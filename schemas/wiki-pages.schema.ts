import { z } from 'zod';
import { userSchema } from './users.schema';

export const wikiPageSchema = z.object({
  id: z
    .string({
      required_error: 'Wiki page ID is required',
      invalid_type_error: 'Wiki page ID must be a string',
    })
    .uuid('Wiki page ID is invalid'),
  slug: z
    .string({
      required_error: 'Wiki page slug is required',
      invalid_type_error: 'Wiki page slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zıəöğçşü0-9]+)*$/i, 'Invalid slug'),
  title: z.string({
    required_error: 'Wiki page title is required',
    invalid_type_error: 'Wiki page title must be a string',
  }),
  content: z.string({
    required_error: 'Wiki page content is required',
    invalid_type_error: 'Wiki page content must be a string',
  }),
  createdAt: z.coerce.date({
    required_error: 'Wiki page created at is required',
    invalid_type_error: 'Wiki page created at must be a date',
  }),
  updatedAt: z.coerce.date({
    required_error: 'Wiki page updated at is required',
    invalid_type_error: 'Wiki page updated at must be a date',
  }),
  publishedAt: z.coerce
    .date({
      required_error: 'Wiki page published at is required',
      invalid_type_error: 'Wiki page published at must be a date',
    })
    .nullish(),
  authorId: userSchema.shape.id,
});

export const createWikiPageSchema = wikiPageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  authorId: true,
});

export const updateWikiPageSchema = createWikiPageSchema.partial();

export const findWikiPageByIdSchema = z.object({
  id: wikiPageSchema.shape.id,
});

export const findWikiPageBySlugSchema = z.object({
  slug: wikiPageSchema.shape.slug,
});

export const findManyWikiPagesSchema = z.object({
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

export const deleteWikiPageSchema = z.object({
  id: wikiPageSchema.shape.id,
});

export type WikiPageSchema = z.infer<typeof wikiPageSchema>;
export type CreateWikiPageSchema = z.infer<typeof createWikiPageSchema>;
export type UpdateWikiPageSchema = z.infer<typeof updateWikiPageSchema>;
export type FindWikiPageByIdSchema = z.infer<typeof findWikiPageByIdSchema>;
export type FindWikiPageBySlugSchema = z.infer<typeof findWikiPageBySlugSchema>;
export type FindManyWikiPagesSchema = z.infer<typeof findManyWikiPagesSchema>;
export type DeleteWikiPageSchema = z.infer<typeof deleteWikiPageSchema>;
