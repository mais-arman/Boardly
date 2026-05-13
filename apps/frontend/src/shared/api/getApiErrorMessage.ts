import { AxiosError } from "axios";

type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again later."
) {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const status = error.response?.status;
  const data = error.response?.data as ApiErrorResponse | undefined;

  if (status && status >= 500) {
    return "Something went wrong on our side. Please try again later.";
  }

  if (data?.errors) {
    const firstError = Object.values(data.errors)[0]?.[0];

    if (firstError) {
      return firstError;
    }
  }

  return data?.message || fallback;
}