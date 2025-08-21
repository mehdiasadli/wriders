import { z } from 'zod';
import { AppearanceTypeSchema } from './enums.schema';
import { chapterSchema } from './chapters.schema';
import { characterSchema } from './characters.schema';

export const chapterCharacterSchema = z.object({
  chapterId: chapterSchema.shape.id,
  characterId: characterSchema.shape.id,
  appearanceType: AppearanceTypeSchema,
});

export const createChapterCharacterSchema = chapterCharacterSchema;

export const findChapterCharacterSchema = z.object({
  chapterId: chapterCharacterSchema.shape.chapterId,
  characterId: chapterCharacterSchema.shape.characterId,
});

export const findManyChapterCharactersSchema = z.object({
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

export const deleteChapterCharacterSchema = z.object({
  chapterId: chapterCharacterSchema.shape.chapterId,
  characterId: chapterCharacterSchema.shape.characterId,
});

export type ChapterCharacterSchema = z.infer<typeof chapterCharacterSchema>;
export type CreateChapterCharacterSchema = z.infer<typeof createChapterCharacterSchema>;
export type FindChapterCharacterSchema = z.infer<typeof findChapterCharacterSchema>;
export type FindManyChapterCharactersSchema = z.infer<typeof findManyChapterCharactersSchema>;
export type DeleteChapterCharacterSchema = z.infer<typeof deleteChapterCharacterSchema>;
