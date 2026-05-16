import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse } from "../../../shared/api/types";
import type {
  Board,
  CreateBoardPayload,
  UpdateBoardPayload,
} from "../types";

export async function getBoardsRequest(): Promise<Board[]> {
  const response = await apiClient.get<ApiResponse<Board[]>>(
    API_ROUTES.BOARDS.ROOT
  );

  return response.data.data;
}

export async function createBoardRequest(
  payload: CreateBoardPayload
): Promise<Board> {
  const response = await apiClient.post<ApiResponse<Board>>(
    API_ROUTES.BOARDS.ROOT,
    payload
  );

  return response.data.data;
}

export async function updateBoardRequest(
  boardId: string,
  payload: UpdateBoardPayload
): Promise<Board> {
  const response = await apiClient.patch<ApiResponse<Board>>(
    API_ROUTES.BOARDS.BY_ID(boardId),
    payload
  );

  return response.data.data;
}

export async function deleteBoardRequest(boardId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.BOARDS.BY_ID(boardId));
}