import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format'),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string({
        required_error: 'Name is required',
        invalid_type_error: 'Name must be a string',
      })
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    email: z
      .string({
        required_error: 'Email is required',
        invalid_type_error: 'Email must be a string',
      })
      .email('Invalid email format'),
    password: z
      .string({
        required_error: 'Password is required',
        invalid_type_error: 'Password must be a string',
      })
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string({
      required_error: 'Please confirm your password',
      invalid_type_error: 'Confirm password must be a string',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const createBookSchema = z.object({
  title: z
    .string({
      required_error: 'Book title is required',
      invalid_type_error: 'Book title must be a string',
    })
    .min(1, 'Book title is required')
    .max(200, 'Book title must be at most 200 characters'),
  synopsis: z
    .string({
      required_error: 'Book synopsis is required',
      invalid_type_error: 'Book synopsis must be a string',
    })
    .max(1000, 'Book synopsis must be at most 1000 characters')
    .nullish(),
  visibility: z.enum(['PRIVATE', 'PUBLIC'], {
    required_error: 'Book visibility is required',
    invalid_type_error: 'Book visibility must be a valid option',
  }),
  status: z.enum(['DRAFT', 'SOON', 'ARCHIVED', 'PUBLISHED'], {
    required_error: 'Book status is required',
    invalid_type_error: 'Book status must be a valid option',
  }),
  seriesId: z
    .string({
      required_error: 'Series ID is required',
      invalid_type_error: 'Series ID must be a string',
    })
    .uuid('Series ID must be a valid UUID')
    .nullish(),
  orderInSeries: z
    .number({
      required_error: 'Order in series is required',
      invalid_type_error: 'Order in series must be a number',
    })
    .int('Order in series must be an integer')
    .positive('Order in series must be a positive number')
    .nullish(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateBookFormData = z.infer<typeof createBookSchema>;
