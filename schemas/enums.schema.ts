import { z } from 'zod';

export const UserRoleSchema = z.enum(['USER', 'AUTHOR', 'EDITOR', 'ADMIN'], {
  required_error: 'User role is required',
  invalid_type_error: 'User role must be a valid role',
});

export const ContentStatusSchema = z.enum(['DRAFT', 'SOON', 'ARCHIVED', 'PUBLISHED'], {
  required_error: 'Content status is required',
  invalid_type_error: 'Content status must be a valid status',
});

export const AppearanceTypeSchema = z.enum(['MENTION', 'APPEARANCE', 'POV'], {
  required_error: 'Appearance type is required',
  invalid_type_error: 'Appearance type must be a valid type',
});

export const NotificationTypeSchema = z.enum(['NEW_CHAPTER', 'WIKI_UPDATE', 'NEW_COMMENT'], {
  required_error: 'Notification type is required',
  invalid_type_error: 'Notification type must be a valid type',
});

export const BookVisibilitySchema = z.enum(['PRIVATE', 'PUBLIC'], {
  required_error: 'Book visibility is required',
  invalid_type_error: 'Book visibility must be a valid visibility',
});

export type UserRoleSchema = z.infer<typeof UserRoleSchema>;
export type ContentStatusSchema = z.infer<typeof ContentStatusSchema>;
export type AppearanceTypeSchema = z.infer<typeof AppearanceTypeSchema>;
export type NotificationTypeSchema = z.infer<typeof NotificationTypeSchema>;
export type BookVisibilitySchema = z.infer<typeof BookVisibilitySchema>;
