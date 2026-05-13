import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../../shared/components/Button";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import {
  acceptMyInvitationRequest,
  declineMyInvitationRequest,
  getMyInvitationsRequest,
} from "../../boards/api/invitationsApi";

type MyInvitationsPanelProps = {
  onError: (message: string) => void;
};

export default function MyInvitationsPanel({ onError }: MyInvitationsPanelProps) {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ["my-invitations"],
    queryFn: getMyInvitationsRequest,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptMyInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: (error) => {
      onError(getApiErrorMessage(error, "Failed to accept invitation."));
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineMyInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: (error) => {
      onError(getApiErrorMessage(error, "Failed to decline invitation."));
    },
  });

  const invitations = invitationsQuery.data || [];

  if (invitations.length === 0) {
    return null;
  }

  return (
    <section className="section-block invitations-panel">
      <div className="section-header">
        <div>
          <h2>Pending invitations</h2>
          <p>Boards you have been invited to join.</p>
        </div>
      </div>

      <div className="invitation-list">
        {invitations.map((invitation) => (
          <article className="invitation-card" key={invitation.id}>
            <div>
              <h3>{invitation.board_title || "Board invitation"}</h3>

              <p>
                Invited by:{" "}
                <strong>
                  {invitation.invited_by_name ||
                    invitation.invited_by_email ||
                    "Board owner"}
                </strong>
              </p>

              <p>
                Role: <strong>{invitation.role}</strong>
              </p>

              <small>
                Expires: {new Date(invitation.expires_at).toLocaleDateString()}
              </small>
            </div>

            <div className="invitation-actions">
              <Button
                type="button"
                variant="secondary"
                isLoading={declineMutation.isPending}
                onClick={() => declineMutation.mutate(invitation.id)}
              >
                Decline
              </Button>

              <Button
                type="button"
                isLoading={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate(invitation.id)}
              >
                Accept
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}