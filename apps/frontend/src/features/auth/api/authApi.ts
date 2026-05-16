import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse } from "../../../shared/api/types";
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
  User,
} from "../types";

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ROUTES.AUTH.LOGIN,
    payload
  );

  return response.data.data;
}

export async function signupRequest(
  payload: SignupPayload
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    API_ROUTES.AUTH.SIGNUP,
    payload
  );

  return response.data.data;
}

export async function getCurrentUserRequest(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>(API_ROUTES.AUTH.ME);

  return response.data.data;
}

export async function updateProfileRequest(
  payload: UpdateProfilePayload
): Promise<User> {
  const response = await apiClient.patch<ApiResponse<User>>(
    API_ROUTES.AUTH.ME,
    payload
  );

  return response.data.data;
}

export async function deleteAccountRequest(): Promise<void> {
  await apiClient.delete(API_ROUTES.AUTH.ME);
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post(API_ROUTES.AUTH.LOGOUT);
}

export async function verifyEmailRequest(token: string): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>(
    API_ROUTES.AUTH.VERIFY_EMAIL,
    null,
    {
      params: {
        token,
      },
    }
  );

  return response.data.data;
}

export async function resendVerificationEmailRequest(): Promise<User> {
  const response = await apiClient.post<ApiResponse<User>>(
    API_ROUTES.AUTH.RESEND_VERIFICATION
  );

  return response.data.data;
}