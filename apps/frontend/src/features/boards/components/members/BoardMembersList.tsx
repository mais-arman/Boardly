import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";
import type { BoardMember, ManageableBoardRole } from "../../types";

type BoardMembersListProps = {
  members: BoardMember[];
  roleOptions: ManageableBoardRole[];
  canManageMembers: boolean;
  isLoading: boolean;
  removingMemberId: string | null;
  updatingMemberId: string | null;
  onRoleChange: (member: BoardMember, nextRole: string) => void;
  onRemoveMember: (member: BoardMember) => void;
};

function getMemberDisplayName(member: BoardMember) {
  return member.user?.name || member.user?.email || member.user_id;
}

export default function BoardMembersList({
  members,
  roleOptions,
  canManageMembers,
  isLoading,
  removingMemberId,
  updatingMemberId,
  onRoleChange,
  onRemoveMember,
}: BoardMembersListProps) {
  const { t } = useTranslation();

  return (
    <section className="members-section">
      <h3>{t("members.boardMembers")}</h3>

      {isLoading ? (
        <p className="muted-text">{t("members.loadingMembers")}</p>
      ) : members.length === 0 ? (
        <p className="muted-text">{t("members.noMembers")}</p>
      ) : (
        <div className="members-list">
          {members.map((member) => {
            const isOwner = member.role === "owner";
            const isRemoving = removingMemberId === member.id;
            const isUpdating = updatingMemberId === member.id;

            return (
              <article className="member-row" key={member.id}>
                <div>
                  <strong>{getMemberDisplayName(member)}</strong>
                  <span>
                    {member.user?.email || member.user_id} ·{" "}
                    {t(`roles.${member.role}`)}
                  </span>
                </div>

                {canManageMembers && !isOwner && (
                  <div className="member-actions">
                    <select
                      value={member.role}
                      disabled={isUpdating || isRemoving}
                      onChange={(event) =>
                        onRoleChange(member, event.target.value)
                      }
                    >
                      {roleOptions.map((item) => (
                        <option key={item} value={item}>
                          {t(`roles.${item}`)}
                        </option>
                      ))}
                    </select>

                    <Button
                      type="button"
                      variant="danger"
                      isLoading={isRemoving}
                      disabled={isUpdating}
                      onClick={() => onRemoveMember(member)}
                    >
                      {t("members.remove")}
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}