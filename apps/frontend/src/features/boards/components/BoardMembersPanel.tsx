import { useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import type { BoardInvitation, BoardMember, ManageableBoardRole } from "../types";
import {
  cancelBoardInvitationRequest,
  getBoardInvitationsRequest,
  getBoardMembersRequest,
  inviteBoardMemberRequest,
  removeBoardMemberRequest,
  updateBoardMemberRoleRequest,
} from "../api/boardMembersApi";

type ErrorResponse = {
  message?: string;
};

type BoardMembersPanelProps = {
  boardId: string;
  canManageMembers: boolean;
  onClose: () => void;
};

const MEMBERS_QUERY_KEY = "board-members";
const INVITATIONS_QUERY_KEY = "board-invitations";

const ROLE_OPTIONS: ManageableBoardRole[] = ["admin", "editor", "viewer"];

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    return data?.message || fallback;
  }

  return fallback;
}

export default function BoardMembersPanel({
  boardId,
  canManageMembers,
  onClose,
}: BoardMembersPanelProps) {
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManageableBoardRole>("viewer");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const membersQuery = useQuery({
    queryKey: [MEMBERS_QUERY_KEY, boardId],
    queryFn: () => getBoardMembersRequest(boardId),
  });

  const invitationsQuery = useQuery({
    queryKey: [INVITATIONS_QUERY_KEY, boardId],
    queryFn: () => getBoardInvitationsRequest(boardId),
    enabled: canManageMembers,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteBoardMemberRequest(boardId, {
        email,
        role,
      }),
    onSuccess: () => {
      setEmail("");
      setRole("viewer");
      setSuccessMessage("Invitation sent successfully.");
      queryClient.invalidateQueries({
        queryKey: [INVITATIONS_QUERY_KEY, boardId],
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
        queryKey: [MEMBERS_QUERY_KEY, boardId],
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      removeBoardMemberRequest(boardId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEMBERS_QUERY_KEY, boardId],
      });
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: (invitationId: string) =>
      cancelBoardInvitationRequest(boardId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [INVITATIONS_QUERY_KEY, boardId],
      });
    },
  });

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await inviteMutation.mutateAsync();
    } catch (error) {
      setError(getErrorMessage(error, "Failed to send invitation."));
    }
  }

  async function handleRoleChange(member: BoardMember, nextRole: string) {
    if (member.role === "owner") {
      return;
    }

    setError("");

    try {
      await updateRoleMutation.mutateAsync({
        memberId: member.id,
        nextRole: nextRole as ManageableBoardRole,
      });
    } catch (error) {
      setError(getErrorMessage(error, "Failed to update member role."));
    }
  }

  async function handleRemoveMember(member: BoardMember) {
    if (member.role === "owner") {
      return;
    }

    setError("");

    try {
      await removeMemberMutation.mutateAsync(member.id);
    } catch (error) {
      setError(getErrorMessage(error, "Failed to remove member."));
    }
  }

  async function handleCancelInvitation(invitation: BoardInvitation) {
    setError("");

    try {
      await cancelInvitationMutation.mutateAsync(invitation.id);
    } catch (error) {
      setError(getErrorMessage(error, "Failed to cancel invitation."));
    }
  }

  return (
    <div className="side-panel-backdrop">
      <aside className="members-panel">
        <header className="members-panel-header">
          <div>
            <p className="eyebrow">Collaboration</p>
            <h2>Members & invitations</h2>
          </div>

          <button type="button" className="icon-button" onClick={onClose}>
            ×
          </button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {successMessage && <div className="alert success">{successMessage}</div>}

        {canManageMembers && (
          <form className="invite-form" onSubmit={handleInvite}>
            <Input
              label="Invite by email"
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="field-group">
              <label htmlFor="invite-role">Role</label>
              <select
                id="invite-role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as ManageableBoardRole)
                }
              >
                {ROLE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" fullWidth isLoading={inviteMutation.isPending}>
              Send invitation
            </Button>
          </form>
        )}

        <section className="members-section">
          <h3>Board members</h3>

          {membersQuery.isLoading ? (
            <p className="muted-text">Loading members...</p>
          ) : (
            <div className="members-list">
              {(membersQuery.data || []).map((member) => (
                <article className="member-row" key={member.id}>
                  <div>
                    <strong>{member.user_id}</strong>
                    <span>{member.role}</span>
                  </div>

                  {canManageMembers && member.role !== "owner" && (
                    <div className="member-actions">
                      <select
                        value={member.role}
                        onChange={(event) =>
                          handleRoleChange(member, event.target.value)
                        }
                      >
                        {ROLE_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>

                      <Button
                        type="button"
                        variant="danger"
                        isLoading={removeMemberMutation.isPending}
                        onClick={() => handleRemoveMember(member)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {canManageMembers && (
          <section className="members-section">
            <h3>Pending invitations</h3>

            {invitationsQuery.isLoading ? (
              <p className="muted-text">Loading invitations...</p>
            ) : (invitationsQuery.data || []).length === 0 ? (
              <p className="muted-text">No pending invitations.</p>
            ) : (
              <div className="members-list">
                {(invitationsQuery.data || []).map((invitation) => (
                  <article className="member-row" key={invitation.id}>
                    <div>
                      <strong>{invitation.email}</strong>
                      <span>
                        {invitation.role} · {invitation.status}
                      </span>
                    </div>

                    {invitation.status === "pending" && (
                      <Button
                        type="button"
                        variant="danger"
                        isLoading={cancelInvitationMutation.isPending}
                        onClick={() => handleCancelInvitation(invitation)}
                      >
                        Cancel
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}