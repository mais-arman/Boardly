import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import type {
  BoardInvitation,
  BoardMember,
  ManageableBoardRole,
} from "../types";
import {
  cancelBoardInvitationRequest,
  getBoardInvitationsRequest,
  getBoardMembersRequest,
  inviteBoardMemberRequest,
  removeBoardMemberRequest,
  updateBoardMemberRoleRequest,
} from "../api/boardMembersApi";
import InviteMemberForm from "./members/InviteMemberForm";
import BoardMembersList from "./members/BoardMembersList";
import PendingInvitationsList from "./members/PendingInvitationsList";

type BoardMembersPanelProps = {
  boardId: string;
  canManageMembers: boolean;
  onClose: () => void;
};

const ROLE_OPTIONS: ManageableBoardRole[] = ["admin", "editor", "viewer"];

export default function BoardMembersPanel({
  boardId,
  canManageMembers,
  onClose,
}: BoardMembersPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManageableBoardRole>("viewer");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);
  const [cancellingInvitationId, setCancellingInvitationId] = useState<
    string | null
  >(null);

  const membersQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.MEMBERS(boardId),
    queryFn: () => getBoardMembersRequest(boardId),
  });

  const invitationsQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.INVITATIONS(boardId),
    queryFn: () => getBoardInvitationsRequest(boardId),
    enabled: canManageMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteBoardMemberRequest(boardId, {
        email: email.trim(),
        role,
      }),

    onSuccess: () => {
      setEmail("");
      setRole("viewer");
      setSuccessMessage(t("members.invitationSent"));

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.INVITATIONS(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.MEMBERS(boardId),
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      memberId,
      nextRole,
    }: {
      memberId: string;
      nextRole: ManageableBoardRole;
    }) =>
      updateBoardMemberRoleRequest(boardId, memberId, {
        role: nextRole,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.MEMBERS(boardId),
      });
    },

    onSettled: () => {
      setUpdatingMemberId(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      removeBoardMemberRequest(boardId, memberId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.MEMBERS(boardId),
      });
    },

    onSettled: () => {
      setRemovingMemberId(null);
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (invitationId: string) =>
      cancelBoardInvitationRequest(boardId, invitationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.INVITATIONS(boardId),
      });
    },

    onSettled: () => {
      setCancellingInvitationId(null);
    },
  });

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!canManageMembers) return;

    try {
      await inviteMutation.mutateAsync();
    } catch (error) {
      setError(getApiErrorMessage(error, t("members.sendInvitationFailed")));
    }
  }

  async function handleRoleChange(member: BoardMember, nextRole: string) {
    if (!canManageMembers || member.role === "owner") return;

    setError("");
    setUpdatingMemberId(member.id);

    try {
      await updateRoleMutation.mutateAsync({
        memberId: member.id,
        nextRole: nextRole as ManageableBoardRole,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, t("members.updateRoleFailed")));
    }
  }

  async function handleRemoveMember(member: BoardMember) {
    if (!canManageMembers || member.role === "owner") return;

    setError("");
    setRemovingMemberId(member.id);

    try {
      await removeMemberMutation.mutateAsync(member.id);
    } catch (error) {
      setError(getApiErrorMessage(error, t("members.removeMemberFailed")));
    }
  }

  async function handleCancelInvitation(invitation: BoardInvitation) {
    if (!canManageMembers) return;

    setError("");
    setCancellingInvitationId(invitation.id);

    try {
      await cancelInvitationMutation.mutateAsync(invitation.id);
    } catch (error) {
      setError(getApiErrorMessage(error, t("members.cancelInvitationFailed")));
    }
  }

  return (
    <div className="side-panel-backdrop">
      <aside className="members-panel">
        <header className="members-panel-header">
          <div>
            <p className="eyebrow">{t("members.collaboration")}</p>
            <h2>{t("members.title")}</h2>
          </div>

          <button type="button" className="icon-button" onClick={onClose}>
            ×
          </button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {successMessage && <div className="alert success">{successMessage}</div>}

        {canManageMembers && (
          <InviteMemberForm
            email={email}
            role={role}
            roleOptions={ROLE_OPTIONS}
            isLoading={inviteMutation.isPending}
            onEmailChange={setEmail}
            onRoleChange={setRole}
            onSubmit={handleInvite}
          />
        )}

        <BoardMembersList
          members={membersQuery.data || []}
          roleOptions={ROLE_OPTIONS}
          canManageMembers={canManageMembers}
          isLoading={membersQuery.isLoading}
          removingMemberId={removingMemberId}
          updatingMemberId={updatingMemberId}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
        />

        {canManageMembers && (
          <PendingInvitationsList
            invitations={invitationsQuery.data || []}
            isLoading={invitationsQuery.isLoading}
            isCancelling={cancelInvitationMutation.isPending}
            cancellingInvitationId={cancellingInvitationId}
            onCancelInvitation={handleCancelInvitation}
          />
        )}
      </aside>
    </div>
  );
}