import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";
import type { BoardInvitation } from "../../types";

type PendingInvitationsListProps = {
  invitations: BoardInvitation[];
  isLoading: boolean;
  isCancelling: boolean;
  onCancelInvitation: (invitation: BoardInvitation) => void;
};

export default function PendingInvitationsList({
  invitations,
  isLoading,
  isCancelling,
  onCancelInvitation,
}: PendingInvitationsListProps) {
  const { t } = useTranslation();

  return (
    <section className="members-section">
      <h3>{t("members.pendingInvitations")}</h3>

      {isLoading ? (
        <p className="muted-text">{t("members.loadingInvitations")}</p>
      ) : invitations.length === 0 ? (
        <p className="muted-text">{t("members.noPendingInvitations")}</p>
      ) : (
        <div className="members-list">
          {invitations.map((invitation) => (
            <article className="member-row" key={invitation.id}>
              <div>
                <strong>{invitation.email}</strong>
                <span>
                  {t(`roles.${invitation.role}`)} ·{" "}
                  {t(`invitationStatus.${invitation.status}`)}
                </span>
              </div>

              {invitation.status === "pending" && (
                <Button
                  type="button"
                  variant="danger"
                  isLoading={isCancelling}
                  onClick={() => onCancelInvitation(invitation)}
                >
                  {t("common.cancel")}
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}