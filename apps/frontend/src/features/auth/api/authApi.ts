import { apiClient } from "../../../shared/api/client";
import type {
  ApiResponse,
  LoginPayload,
  LoginResponse,
  SignupPayload,
  User,
} from "../types";

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    payload
  );

  return response.data.data;
}

export async function signupRequest(payload: SignupPayload): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>(
    "/auth/signup",
    payload
  );

  return response.data.data;
}

export async function getCurrentUserRequest(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>("/auth/me");

  return response.data.data;
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function verifyEmailRequest(token: string): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>(
    `/auth/verify-email/${token}`
  );

  return response.data.data;
}