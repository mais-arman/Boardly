import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type {
  AddAssigneePayload,
  ApiResponse,
  ApplyLabelPayload,
  Card,
  CardLabel,
  CreateLabelPayload,
} from "../types";

export async function getBoardLabelsRequest(
  boardId: string
): Promise<CardLabel[]> {
  const response = await apiClient.get<ApiResponse<CardLabel[]>>(
    API_ROUTES.BOARDS.LABELS(boardId)
  );

  return response.data.data;
}

export async function createBoardLabelRequest(
  boardId: string,
  payload: CreateLabelPayload
): Promise<CardLabel> {
  const response = await apiClient.post<ApiResponse<CardLabel>>(
    API_ROUTES.BOARDS.LABELS(boardId),
    payload
  );

  return response.data.data;
}

export async function applyLabelToCardRequest(
  cardId: string,
  payload: ApplyLabelPayload
): Promise<Card> {
  const response = await apiClient.post<ApiResponse<Card>>(
    API_ROUTES.CARDS.LABELS(cardId),
    payload
  );

  return response.data.data;
}

export async function removeLabelFromCardRequest(
  cardId: string,
  labelId: string
): Promise<Card> {
  const response = await apiClient.delete<ApiResponse<Card>>(
    API_ROUTES.CARDS.LABEL_BY_ID(cardId, labelId)
  );

  return response.data.data;
}

export async function addAssigneeToCardRequest(
  cardId: string,
  payload: AddAssigneePayload
): Promise<Card> {
  const response = await apiClient.post<ApiResponse<Card>>(
    API_ROUTES.CARDS.ASSIGNEES(cardId),
    payload
  );

  return response.data.data;
}

export async function removeAssigneeFromCardRequest(
  cardId: string,
  userId: string
): Promise<Card> {
  const response = await apiClient.delete<ApiResponse<Card>>(
    API_ROUTES.CARDS.ASSIGNEE_BY_ID(cardId, userId)
  );

  return response.data.data;
}