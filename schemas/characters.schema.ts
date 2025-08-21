import { z } from 'zod';
import { userSchema } from './users.schema';

export const characterSchema = z.object({
  id: z
    .string({
      required_error: 'Character ID is required',
      invalid_type_error: 'Character ID must be a string',
    })
    .uuid('Character ID is invalid'),
  slug: z
    .string({
      required_error: 'Character slug is required',
      invalid_type_error: 'Character slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zəöğçşü0-9]+)*$/i, 'Invalid slug'),
  fullName: z
    .string({
      required_error: 'Character full name is required',
      invalid_type_error: 'Character full name must be a string',
    })
    .nullish(),
  description: z
    .string({
      required_error: 'Character description is required',
      invalid_type_error: 'Character description must be a string',
    })
    .nullish(),
  aliases: z.array(z.string(), {
    required_error: 'Character aliases are required',
    invalid_type_error: 'Character aliases must be an array',
  }),
  bio: z
    .string({
      required_error: 'Character bio is required',
      invalid_type_error: 'Character bio must be a string',
    })
    .nullish(),
  createdAt: z.coerce.date({
    required_error: 'Character created at is required',
    invalid_type_error: 'Character created at must be a date',
  }),
  updatedAt: z.coerce.date({
    required_error: 'Character updated at is required',
    invalid_type_error: 'Character updated at must be a date',
  }),
  creatorId: userSchema.shape.id,
});

export const createCharacterSchema = characterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  creatorId: true,
});

export const updateCharacterSchema = createCharacterSchema.partial();

export const findCharacterByIdSchema = z.object({
  id: characterSchema.shape.id,
});

export const findCharacterBySlugSchema = z.object({
  slug: characterSchema.shape.slug,
});

export const findManyCharactersSchema = z.object({
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

export const deleteCharacterSchema = z.object({
  id: characterSchema.shape.id,
});

export type CharacterSchema = z.infer<typeof characterSchema>;
export type CreateCharacterSchema = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterSchema = z.infer<typeof updateCharacterSchema>;
export type FindCharacterByIdSchema = z.infer<typeof findCharacterByIdSchema>;
export type FindCharacterBySlugSchema = z.infer<typeof findCharacterBySlugSchema>;
export type FindManyCharactersSchema = z.infer<typeof findManyCharactersSchema>;
export type DeleteCharacterSchema = z.infer<typeof deleteCharacterSchema>;
