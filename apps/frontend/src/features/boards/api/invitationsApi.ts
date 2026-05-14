import { API_ROUTES } from "../../../app/constants/apiRoutes";
import { apiClient } from "../../../shared/api/client";
import type { ApiResponse, BoardInvitation, BoardMember } from "../types";

export async function getMyInvitationsRequest(): Promise<BoardInvitation[]> {
  const response = await apiClient.get<ApiResponse<BoardInvitation[]>>(
    API_ROUTES.INVITATIONS.MY
  );

  return response.data.data;
}

export async function acceptMyInvitationRequest(
  invitationId: string
): Promise<BoardMember> {
  const response = await apiClient.post<ApiResponse<BoardMember>>(
    API_ROUTES.INVITATIONS.ACCEPT_MY(invitationId)
  );

  return response.data.data;
}

export async function declineMyInvitationRequest(
  invitationId: string
): Promise<BoardInvitation> {
  const response = await apiClient.post<ApiResponse<BoardInvitation>>(
    API_ROUTES.INVITATIONS.DECLINE_MY(invitationId)
  );

  return response.data.data;
}