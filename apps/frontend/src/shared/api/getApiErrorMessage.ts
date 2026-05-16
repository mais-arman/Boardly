import { AxiosError } from "axios";
import i18n from "../../app/i18n";
import type { ApiErrorResponse } from "./types";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again later."
) {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const status = error.response?.status;
  const data = error.response?.data as ApiErrorResponse | undefined;

  if (data?.code) {
    return i18n.t(`errors.${data.code}`, {
      defaultValue: fallback,
    });
  }

  if (status && status >= 500) {
    return fallback;
  }

  if (data?.errors) {
    const firstError = Object.values(data.errors)[0]?.[0];

    if (firstError) {
      return firstError;
    }
  }

  return data?.message || fallback;
}