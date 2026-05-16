import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse } from "../../../shared/api/types";
import type {
  BoardInvitation,
  BoardMember,
  InviteMemberPayload,
  UpdateMemberRolePayload,
} from "../types";

export async function getBoardMembersRequest(
  boardId: string
): Promise<BoardMember[]> {
  const response = await apiClient.get<ApiResponse<BoardMember[]>>(
    API_ROUTES.BOARDS.MEMBERS(boardId)
  );

  return response.data.data;
}

export async function inviteBoardMemberRequest(
  boardId: string,
  payload: InviteMemberPayload
): Promise<BoardInvitation> {
  const response = await apiClient.post<ApiResponse<BoardInvitation>>(
    API_ROUTES.BOARDS.INVITATIONS(boardId),
    payload
  );

  return response.data.data;
}

export async function getBoardInvitationsRequest(
  boardId: string
): Promise<BoardInvitation[]> {
  const response = await apiClient.get<ApiResponse<BoardInvitation[]>>(
    API_ROUTES.BOARDS.INVITATIONS(boardId)
  );

  return response.data.data;
}

export async function updateBoardMemberRoleRequest(
  boardId: string,
  memberId: string,
  payload: UpdateMemberRolePayload
): Promise<BoardMember> {
  const response = await apiClient.patch<ApiResponse<BoardMember>>(
    API_ROUTES.BOARDS.MEMBER_BY_ID(boardId, memberId),
    payload
  );

  return response.data.data;
}

export async function removeBoardMemberRequest(
  boardId: string,
  memberId: string
): Promise<void> {
  await apiClient.delete(API_ROUTES.BOARDS.MEMBER_BY_ID(boardId, memberId));
}

export async function cancelBoardInvitationRequest(
  boardId: string,
  invitationId: string
): Promise<BoardInvitation> {
  const response = await apiClient.delete<ApiResponse<BoardInvitation>>(
    API_ROUTES.BOARDS.CANCEL_INVITATION(boardId, invitationId)
  );

  return response.data.data;
}