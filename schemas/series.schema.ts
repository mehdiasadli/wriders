import { z } from 'zod';

export const seriesSchema = z.object({
  id: z
    .string({
      required_error: 'Series ID is required',
      invalid_type_error: 'Series ID must be a string',
    })
    .uuid('Series ID is invalid'),
  slug: z
    .string({
      required_error: 'Series slug is required',
      invalid_type_error: 'Series slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zəöğçşü0-9]+)*$/i, 'Invalid slug'),
  title: z.string({
    required_error: 'Series title is required',
    invalid_type_error: 'Series title must be a string',
  }),
  synopsis: z
    .string({
      required_error: 'Series synopsis is required',
      invalid_type_error: 'Series synopsis must be a string',
    })
    .nullish(),
  createdAt: z.coerce.date({
    required_error: 'Series created at is required',
    invalid_type_error: 'Series created at must be a date',
  }),
});

export const createSeriesSchema = seriesSchema.omit({
  id: true,
  createdAt: true,
  slug: true,
});

export const updateSeriesSchema = createSeriesSchema.partial();

export const findSeriesByIdSchema = z.object({
  id: seriesSchema.shape.id,
});

export const findSeriesBySlugSchema = z.object({
  slug: seriesSchema.shape.slug,
});

export const findManySeriesSchema = z.object({
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

export const deleteSeriesSchema = z.object({
  id: seriesSchema.shape.id,
});

export type SeriesSchema = z.infer<typeof seriesSchema>;
export type CreateSeriesSchema = z.infer<typeof createSeriesSchema>;
export type UpdateSeriesSchema = z.infer<typeof updateSeriesSchema>;
export type FindSeriesByIdSchema = z.infer<typeof findSeriesByIdSchema>;
export type FindSeriesBySlugSchema = z.infer<typeof findSeriesBySlugSchema>;
export type FindManySeriesSchema = z.infer<typeof findManySeriesSchema>;
export type DeleteSeriesSchema = z.infer<typeof deleteSeriesSchema>;
