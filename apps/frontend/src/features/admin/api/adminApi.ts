import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse } from "../../../shared/api/types";
import type {
  AdminBoard,
  AdminUser,
  UpdateAdminUserRolePayload,
} from "../types";

export async function getAdminUsersRequest(): Promise<AdminUser[]> {
  const response = await apiClient.get<ApiResponse<AdminUser[]>>(
    API_ROUTES.ADMIN.USERS
  );

  return response.data.data;
}

export async function updateAdminUserRoleRequest(
  userId: string,
  payload: UpdateAdminUserRolePayload
): Promise<AdminUser> {
  const response = await apiClient.patch<ApiResponse<AdminUser>>(
    API_ROUTES.ADMIN.USER_BY_ID(userId),
    payload
  );

  return response.data.data;
}

export async function deleteAdminUserRequest(userId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.ADMIN.USER_BY_ID(userId));
}

export async function getAdminBoardsRequest(): Promise<AdminBoard[]> {
  const response = await apiClient.get<ApiResponse<AdminBoard[]>>(
    API_ROUTES.ADMIN.BOARDS
  );

  return response.data.data;
}

export async function deleteAdminBoardRequest(boardId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.ADMIN.BOARD_BY_ID(boardId));
}