import { z } from 'zod';
import { UserRoleSchema } from './enums.schema';

export const userSchema = z.object({
  id: z
    .string({
      required_error: 'User ID is required',
      invalid_type_error: 'User ID must be a string',
    })
    .uuid('User ID is invalid'),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format'),
  slug: z
    .string({
      required_error: 'User slug is required',
      invalid_type_error: 'User slug must be a string',
    })
    .regex(/^[a-zıəöğçşü0-9]+(?:-[a-zəöğçşü0-9]+)*$/i, 'Invalid slug'),
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string',
  }),
  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string',
  }),
  roles: z.array(UserRoleSchema, {
    required_error: 'Roles are required',
    invalid_type_error: 'Roles must be an array',
  }),
  createdAt: z.coerce.date({
    required_error: 'User created at is required',
    invalid_type_error: 'User created at must be a date',
  }),
  updatedAt: z.coerce.date({
    required_error: 'User updated at is required',
    invalid_type_error: 'User updated at must be a date',
  }),
  wpm: z.coerce
    .number({
      required_error: 'User WPM is required',
      invalid_type_error: 'User WPM must be a number',
    })
    .int('User WPM must be an integer')
    .min(20, 'User WPM must be at least 20')
    .max(1000, 'User WPM must be at most 1000'),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  slug: true,
  roles: true,
  wpm: true,
});

export const updateUserSchema = createUserSchema
  .omit({
    password: true,
  })
  .extend({
    wpm: userSchema.shape.wpm.optional(),
  })
  .partial();

export const findUserByIdSchema = z.object({
  id: userSchema.shape.id,
});

export const findUserBySlugSchema = z.object({
  slug: userSchema.shape.slug,
});

export const findUserByEmailSchema = z.object({
  email: userSchema.shape.email,
});

export const findManyUsersSchema = z.object({
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

export const deleteUserSchema = z.object({
  id: userSchema.shape.id,
});

export type UserSchema = z.infer<typeof userSchema>;
export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type FindUserByIdSchema = z.infer<typeof findUserByIdSchema>;
export type FindUserBySlugSchema = z.infer<typeof findUserBySlugSchema>;
export type FindUserByEmailSchema = z.infer<typeof findUserByEmailSchema>;
export type FindManyUsersSchema = z.infer<typeof findManyUsersSchema>;
export type DeleteUserSchema = z.infer<typeof deleteUserSchema>;
