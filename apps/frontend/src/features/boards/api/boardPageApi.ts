import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse } from "../../../shared/api/types";
import type {
  Board,
  BoardList,
  Card,
  Comment,
  CreateCardPayload,
  CreateCommentPayload,
  CreateListPayload,
  MoveCardPayload,
  ReorderListsPayload,
  UpdateCardPayload,
  UpdateListPayload,
} from "../types";

export async function getBoardRequest(boardId: string): Promise<Board> {
  const response = await apiClient.get<ApiResponse<Board>>(
    API_ROUTES.BOARDS.BY_ID(boardId)
  );

  return response.data.data;
}

export async function getBoardListsRequest(
  boardId: string
): Promise<BoardList[]> {
  const response = await apiClient.get<ApiResponse<BoardList[]>>(
    API_ROUTES.BOARDS.LISTS(boardId)
  );

  return response.data.data;
}

export async function createListRequest(
  boardId: string,
  payload: CreateListPayload
): Promise<BoardList> {
  const response = await apiClient.post<ApiResponse<BoardList>>(
    API_ROUTES.BOARDS.LISTS(boardId),
    payload
  );

  return response.data.data;
}

export async function updateListRequest(
  listId: string,
  payload: UpdateListPayload
): Promise<BoardList> {
  const response = await apiClient.patch<ApiResponse<BoardList>>(
    API_ROUTES.LISTS.BY_ID(listId),
    payload
  );

  return response.data.data;
}

export async function deleteListRequest(listId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.LISTS.BY_ID(listId));
}

export async function reorderListsRequest(
  boardId: string,
  payload: ReorderListsPayload
): Promise<BoardList[]> {
  const response = await apiClient.patch<ApiResponse<BoardList[]>>(
    API_ROUTES.BOARDS.REORDER_LISTS(boardId),
    payload
  );

  return response.data.data;
}

export async function getListCardsRequest(listId: string): Promise<Card[]> {
  const response = await apiClient.get<ApiResponse<Card[]>>(
    API_ROUTES.LISTS.CARDS(listId)
  );

  return response.data.data;
}

export async function createCardRequest(
  listId: string,
  payload: CreateCardPayload
): Promise<Card> {
  const response = await apiClient.post<ApiResponse<Card>>(
    API_ROUTES.LISTS.CARDS(listId),
    payload
  );

  return response.data.data;
}

export async function moveCardRequest(
  cardId: string,
  payload: MoveCardPayload
): Promise<Card> {
  const response = await apiClient.patch<ApiResponse<Card>>(
    API_ROUTES.CARDS.MOVE(cardId),
    payload
  );

  return response.data.data;
}

export async function updateCardRequest(
  cardId: string,
  payload: UpdateCardPayload
): Promise<Card> {
  const response = await apiClient.patch<ApiResponse<Card>>(
    API_ROUTES.CARDS.BY_ID(cardId),
    payload
  );

  return response.data.data;
}

export async function deleteCardRequest(cardId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.CARDS.BY_ID(cardId));
}

export async function getCardCommentsRequest(cardId: string): Promise<Comment[]> {
  const response = await apiClient.get<ApiResponse<Comment[]>>(
    API_ROUTES.CARDS.COMMENTS(cardId)
  );

  return response.data.data;
}

export async function createCommentRequest(
  cardId: string,
  payload: CreateCommentPayload
): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    API_ROUTES.CARDS.COMMENTS(cardId),
    payload
  );

  return response.data.data;
}