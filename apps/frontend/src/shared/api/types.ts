export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type ApiErrorResponse = {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
};