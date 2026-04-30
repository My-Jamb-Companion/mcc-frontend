export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown[];
  };
}

export interface ApiSuccessBody<T> {
  success: true;
  message: string;
  data: T;
}

export const extractApiError = (
  error: unknown,
  fallback = "Something went wrong",
): string => {
  if (
    error !== null &&
    typeof error === "object" &&
    "response" in error &&
    error.response !== null &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = error.response.data as ApiErrorBody;
    if (data?.message) return data.message;
  }
  return fallback;
};
