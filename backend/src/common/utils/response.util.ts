export function formatResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function formatErrorResponse(message: string, errors?: any) {
  return {
    success: false,
    message,
    ...(errors && { errors }),
  };
}

