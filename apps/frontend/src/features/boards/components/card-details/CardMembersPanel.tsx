import { useTranslation } from "react-i18next";
import type { BoardMember } from "../../types";

type CardMembersPanelProps = {
  members: BoardMember[];
  selectedAssigneeIds: string[];
  selectedAssignees: BoardMember[];
  canEdit: boolean;
  onToggleAssignee: (member: BoardMember) => void;
};

export default function CardMembersPanel({
  members,
  selectedAssigneeIds,
  selectedAssignees,
  canEdit,
  onToggleAssignee,
}: CardMembersPanelProps) {
  const { t } = useTranslation();

  return (
    <section className="trello-section">
      <h3>{t("boards.members")}</h3>

      {selectedAssignees.length > 0 ? (
        <div className="selected-meta-list">
          {selectedAssignees.map((member) => (
            <span key={member.id} className="assignee-chip">
              {member.user?.name || member.user?.email}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted-text">{t("card.noAssignees")}</p>
      )}

      {canEdit && (
        <div className="assignee-picker">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              className={
                selectedAssigneeIds.includes(member.user_id) ? "selected" : ""
              }
              onClick={() => onToggleAssignee(member)}
            >
              {member.user?.name || member.user?.email}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}