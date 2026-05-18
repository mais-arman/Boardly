import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type {
  ApiResponse,
  PaginatedResponse,
} from "../../../shared/api/types";
import type { PaginationParams } from "../../../shared/pagination";
import type {
  AdminBoard,
  AdminUser,
  UpdateAdminUserRolePayload,
} from "../types";

export async function getAdminUsersRequest(
  params: PaginationParams
): Promise<PaginatedResponse<AdminUser>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>(
    API_ROUTES.ADMIN.USERS,
    {
      params,
    }
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

export async function getAdminBoardsRequest(
  params: PaginationParams
): Promise<PaginatedResponse<AdminBoard>> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminBoard>>>(
    API_ROUTES.ADMIN.BOARDS,
    {
      params,
    }
  );

  return response.data.data;
}

export async function deleteAdminBoardRequest(boardId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.ADMIN.BOARD_BY_ID(boardId));
}