/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utility functions for managing NextAuth sessions
 */

/**
 * Helper function to handle user updates with session refresh
 * This should be called after any user data update to ensure the session stays in sync
 */
export const handleUserUpdateWithSessionRefresh = async (
  updateFunction: () => Promise<any>,
  sessionUpdate: () => Promise<any>,
  onSuccess?: (result: any) => void,
  onError?: (error: any) => void
) => {
  try {
    const result = await updateFunction();

    // Refresh the session after successful update
    await sessionUpdate();

    if (onSuccess) {
      onSuccess(result);
    }

    return result;
  } catch (error) {
    if (onError) {
      onError(error);
    }
    throw error;
  }
};

/**
 * Check if a user update response indicates that the slug changed
 * This can be used to determine if navigation needs to use the new slug
 */
export const hasSlugChanged = (response: any): boolean => {
  return response?.data?.slugChanged === true;
};

/**
 * Extract the updated user slug from an API response
 * Falls back to the provided fallback slug if not found
 */
export const getUpdatedUserSlug = (response: any, fallbackSlug: string): string => {
  return response?.data?.user?.slug || fallbackSlug;
};
