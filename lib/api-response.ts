export type AppResponse<T> = 
  | { success: true; data: T; message: string; status: number }
  | { success: false; message: string; status: number };

export const createSuccessResponse = <T>(
  data: T,
  message: string = "Successful",
  status: number = 200
): AppResponse<T> => ({
  success: true,
  data,
  message,
  status,
});

export const createErrorResponse = (
  message: string = "Unknown error occurred",
  status: number = 500
): AppResponse<never> => ({
  success: false,
  message,
  status,
});
