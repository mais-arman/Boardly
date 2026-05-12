import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse, Board, CreateBoardPayload } from "../types";

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