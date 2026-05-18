import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";
import type { BoardInvitation } from "../../types";
import MemberRowSkeleton from "./MemberRowSkeleton";

type PendingInvitationsListProps = {
  invitations: BoardInvitation[];
  isLoading: boolean;
  isCancelling: boolean;
  cancellingInvitationId: string | null;
  onCancelInvitation: (invitation: BoardInvitation) => void;
};

export default function PendingInvitationsList({
  invitations,
  isLoading,
  isCancelling,
  cancellingInvitationId,
  onCancelInvitation,
}: PendingInvitationsListProps) {
  const { t } = useTranslation();

  return (
    <section className="members-section">
      <h3>{t("members.pendingInvitations")}</h3>

      {isLoading ? (
        <div className="members-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <MemberRowSkeleton key={index} />
          ))}
        </div>
      ) : invitations.length === 0 ? (
        <p className="muted-text">{t("members.noPendingInvitations")}</p>
      ) : (
        <div className="members-list">
          {invitations.map((invitation) => {
            const isCurrentCancelling =
              isCancelling && cancellingInvitationId === invitation.id;

            return (
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
                    isLoading={isCurrentCancelling}
                    onClick={() => onCancelInvitation(invitation)}
                  >
                    {t("common.cancel")}
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}