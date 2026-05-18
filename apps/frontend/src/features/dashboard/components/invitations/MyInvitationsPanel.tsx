import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../../app/constants/queryKeys";
import Button from "../../../../shared/components/Button";
import { getApiErrorMessage } from "../../../../shared/api/getApiErrorMessage";
import {
  acceptMyInvitationRequest,
  declineMyInvitationRequest,
  getMyInvitationsRequest,
} from "../../../boards/api/invitationsApi";
import InvitationCardSkeleton from "./InvitationCardSkeleton";

type MyInvitationsPanelProps = {
  onError: (message: string) => void;
};

export default function MyInvitationsPanel({
  onError,
}: MyInvitationsPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.MY_INVITATIONS,
    queryFn: getMyInvitationsRequest,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptMyInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD.MY_INVITATIONS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.ALL,
      });
    },
    onError: (error) => {
      onError(getApiErrorMessage(error, t("invitations.acceptFailed")));
    },
  });

  const declineMutation = useMutation({
    mutationFn: declineMyInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DASHBOARD.MY_INVITATIONS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.ALL,
      });
    },
    onError: (error) => {
      onError(getApiErrorMessage(error, t("invitations.declineFailed")));
    },
  });

  const invitations = invitationsQuery.data || [];

  if (invitationsQuery.isLoading) {
    return (
      <section className="section-block invitations-panel">
        <div className="section-header">
          <div>
            <h2>{t("invitations.pendingTitle")}</h2>
            <p>{t("invitations.pendingSubtitle")}</p>
          </div>
        </div>

        <div className="invitation-list">
          {Array.from({ length: 2 }).map((_, index) => (
            <InvitationCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <section className="section-block invitations-panel">
      <div className="section-header">
        <div>
          <h2>{t("invitations.pendingTitle")}</h2>
          <p>{t("invitations.pendingSubtitle")}</p>
        </div>
      </div>

      <div className="invitation-list">
        {invitations.map((invitation) => (
          <article className="invitation-card" key={invitation.id}>
            <div>
              <h3>
                {invitation.board_title || t("invitations.boardInvitation")}
              </h3>

              <p>
                {t("invitations.invitedBy")}:{" "}
                <strong>
                  {invitation.invited_by_name ||
                    invitation.invited_by_email ||
                    t("invitations.boardOwner")}
                </strong>
              </p>

              <p>
                {t("profile.role")}:{" "}
                <strong>{t(`roles.${invitation.role}`)}</strong>
              </p>

              <small>
                {t("invitations.expires")}:{" "}
                {new Date(invitation.expires_at).toLocaleDateString()}
              </small>
            </div>

            <div className="invitation-actions">
              <Button
                type="button"
                variant="secondary"
                isLoading={declineMutation.isPending}
                onClick={() => declineMutation.mutate(invitation.id)}
              >
                {t("invitations.decline")}
              </Button>

              <Button
                type="button"
                isLoading={acceptMutation.isPending}
                onClick={() => acceptMutation.mutate(invitation.id)}
              >
                {t("invitations.accept")}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}