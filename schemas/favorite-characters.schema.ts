import { z } from 'zod';
import { userSchema } from './users.schema';
import { characterSchema } from './characters.schema';

export const favoriteCharacterSchema = z.object({
  userId: userSchema.shape.id,
  characterId: characterSchema.shape.id,
  createdAt: z.coerce.date({
    required_error: 'Favorite character created at is required',
    invalid_type_error: 'Favorite character created at must be a date',
  }),
});

export const createFavoriteCharacterSchema = favoriteCharacterSchema.omit({
  createdAt: true,
  userId: true,
});

export const findFavoriteCharacterSchema = z.object({
  userId: favoriteCharacterSchema.shape.userId,
  characterId: favoriteCharacterSchema.shape.characterId,
});

export const findManyFavoriteCharactersSchema = z.object({
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

export const deleteFavoriteCharacterSchema = z.object({
  userId: favoriteCharacterSchema.shape.userId,
  characterId: favoriteCharacterSchema.shape.characterId,
});

export type FavoriteCharacterSchema = z.infer<typeof favoriteCharacterSchema>;
export type CreateFavoriteCharacterSchema = z.infer<typeof createFavoriteCharacterSchema>;
export type FindFavoriteCharacterSchema = z.infer<typeof findFavoriteCharacterSchema>;
export type FindManyFavoriteCharactersSchema = z.infer<typeof findManyFavoriteCharactersSchema>;
export type DeleteFavoriteCharacterSchema = z.infer<typeof deleteFavoriteCharacterSchema>;
