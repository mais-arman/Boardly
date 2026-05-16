export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
};