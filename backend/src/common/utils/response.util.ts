export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ErrorDetails = Record<string, unknown> | string | string[];

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ErrorDetails;
}

export function formatResponse<T>(
  data: T,
  message?: string,
): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function formatErrorResponse(
  message: string,
  errors?: ErrorDetails,
): ErrorResponse {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}
