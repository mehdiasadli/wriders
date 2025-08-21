import { z } from 'zod';
import { NotificationTypeSchema } from './enums.schema';
import { userSchema } from './users.schema';

export const notificationSchema = z.object({
  id: z
    .string({
      required_error: 'Notification ID is required',
      invalid_type_error: 'Notification ID must be a string',
    })
    .uuid('Notification ID is invalid'),
  type: NotificationTypeSchema,
  isRead: z.boolean({
    required_error: 'Notification read status is required',
    invalid_type_error: 'Notification read status must be a boolean',
  }),
  createdAt: z.coerce.date({
    required_error: 'Notification created at is required',
    invalid_type_error: 'Notification created at must be a date',
  }),
  recipientId: userSchema.shape.id,
  bookId: z
    .string({
      required_error: 'Book ID is required',
      invalid_type_error: 'Book ID must be a string',
    })
    .uuid('Book ID is invalid')
    .nullish(),
  chapterId: z
    .string({
      required_error: 'Chapter ID is required',
      invalid_type_error: 'Chapter ID must be a string',
    })
    .uuid('Chapter ID is invalid')
    .nullish(),
});

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  createdAt: true,
  recipientId: true,
});

export const updateNotificationSchema = createNotificationSchema.partial();

export const findNotificationByIdSchema = z.object({
  id: notificationSchema.shape.id,
});

export const findManyNotificationsSchema = z.object({
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

export const deleteNotificationSchema = z.object({
  id: notificationSchema.shape.id,
});

export type NotificationSchema = z.infer<typeof notificationSchema>;
export type CreateNotificationSchema = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationSchema = z.infer<typeof updateNotificationSchema>;
export type FindNotificationByIdSchema = z.infer<typeof findNotificationByIdSchema>;
export type FindManyNotificationsSchema = z.infer<typeof findManyNotificationsSchema>;
export type DeleteNotificationSchema = z.infer<typeof deleteNotificationSchema>;
