import { z } from 'zod';
import { userSchema } from './users.schema';
import { chapterSchema } from './chapters.schema';

export const commentSchema = z.object({
  id: z
    .string({
      required_error: 'Comment ID is required',
      invalid_type_error: 'Comment ID must be a string',
    })
    .uuid('Comment ID is invalid'),
  slug: z
    .string({
      required_error: 'Comment slug is required',
      invalid_type_error: 'Comment slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zıəöğçşü0-9]+)*$/i, 'Invalid slug'),
  content: z.string({
    required_error: 'Comment content is required',
    invalid_type_error: 'Comment content must be a string',
  }),
  createdAt: z.coerce.date({
    required_error: 'Comment created at is required',
    invalid_type_error: 'Comment created at must be a date',
  }),
  updatedAt: z.coerce.date({
    required_error: 'Comment updated at is required',
    invalid_type_error: 'Comment updated at must be a date',
  }),
  authorId: userSchema.shape.id,
  chapterId: chapterSchema.shape.id,
  parentId: z
    .string({
      required_error: 'Parent comment ID is required',
      invalid_type_error: 'Parent comment ID must be a string',
    })
    .uuid('Parent comment ID is invalid')
    .nullish(),
});

// Create comment schema
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment is too long'),
  parentId: z.string().uuid().optional(), // For replies
});

export type CreateCommentSchema = z.infer<typeof createCommentSchema>;

// Update comment schema
export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment is too long'),
});

export type UpdateCommentSchema = z.infer<typeof updateCommentSchema>;

// Comment response schema
export const commentResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  content: z.string(),
  depth: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
  chapterId: z.string(),
  parentId: z.string().nullable(),
  _count: z.object({
    replies: z.number(),
  }),
});

export type CommentResponse = z.infer<typeof commentResponseSchema>;

export const findCommentByIdSchema = z.object({
  id: commentSchema.shape.id,
});

export const findCommentBySlugSchema = z.object({
  slug: commentSchema.shape.slug,
});

export const findManyCommentsSchema = z.object({
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

export const deleteCommentSchema = z.object({
  id: commentSchema.shape.id,
});

export type CommentSchema = z.infer<typeof commentSchema>;
export type FindCommentByIdSchema = z.infer<typeof findCommentByIdSchema>;
export type FindCommentBySlugSchema = z.infer<typeof findCommentBySlugSchema>;
export type FindManyCommentsSchema = z.infer<typeof findManyCommentsSchema>;
export type DeleteCommentSchema = z.infer<typeof deleteCommentSchema>;
