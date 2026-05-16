import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Card, Comment } from "../types";
import { useCardMeta } from "../hooks/useCardMeta";
import { useCardDetailsState } from "../hooks/useCardDetailsState";
import CardDetailsHeader from "./card-details/CardDetailsHeader";
import CardDetailsForm from "./card-details/CardDetailsForm";
import CardLabelsPanel from "./card-details/CardLabelsPanel";
import CardMembersPanel from "./card-details/CardMembersPanel";
import CardActivity from "./card-details/CardActivity";

type CardDetailsModalProps = {
  boardId: string;
  card: Card;
  comments: Comment[];
  isUpdating: boolean;
  isAddingComment: boolean;
  isDeleting: boolean;
  error: string;
  canEdit: boolean;
  canComment: boolean;
  roleLabel: string;
  onClose: () => void;
  onUpdate: (payload: {
    cardId: string;
    title: string;
    description: string;
    dueDate: string;
  }) => Promise<void>;
  onDelete: (card: Card) => Promise<void>;
  onCreateComment: (cardId: string, content: string) => Promise<void>;
  onCardChanged: (card: Card) => void;
};

export default function CardDetailsModal({
  boardId,
  card,
  comments,
  isUpdating,
  isAddingComment,
  isDeleting,
  error,
  canEdit,
  canComment,
  roleLabel,
  onClose,
  onUpdate,
  onDelete,
  onCreateComment,
  onCardChanged,
}: CardDetailsModalProps) {
  const { t } = useTranslation();

  const details = useCardDetailsState(card);
  const { state, actions } = details;

  const { labels, assignees, meta } = useCardMeta({
    boardId,
    card,
    canEdit,
  });

  async function handleSaveChanges() {
    if (!canEdit) return;

    meta.setLocalError("");

    const trimmedTitle = state.title.trim();

    if (trimmedTitle.length < 2) {
      meta.setLocalError(t("errors.cardTitleTooShort"));
      return;
    }

    try {
      await onUpdate({
        cardId: card.id,
        title: trimmedTitle,
        description: state.description,
        dueDate: state.dueDate,
      });

      const labelsUpdatedCard = await meta.syncLabels();
      const assigneesUpdatedCard = await meta.syncAssignees();
      const latestCard = assigneesUpdatedCard || labelsUpdatedCard;

      if (latestCard) {
        onCardChanged(latestCard);
      }
    } catch {
      meta.setLocalError(t("errors.failedSaveCard"));
    }
  }

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canComment) return;

    const content = state.comment.trim();

    if (!content) return;

    try {
      await onCreateComment(card.id, content);
      actions.setComment("");
    } catch {
      meta.setLocalError(t("errors.failedAddComment"));
    }
  }

  return (
    <div className="modal-backdrop trello-modal-backdrop">
      <section className="trello-card-modal">
        <CardDetailsHeader
          title={state.title || card.title}
          roleLabel={roleLabel}
          onClose={onClose}
        />

        {error && <div className="alert error">{error}</div>}
        {meta.localError && <div className="alert error">{meta.localError}</div>}

        {!canEdit && (
          <div className="alert warning">{t("card.viewerEditDisabled")}</div>
        )}

        <div className="trello-modal-grid">
          <section className="trello-main-column">
            <CardDetailsForm
              card={card}
              title={state.title}
              description={state.description}
              dueDate={state.dueDate}
              canEdit={canEdit}
              isDeleting={isDeleting}
              isSaving={isUpdating || meta.isSavingMeta}
              onTitleChange={actions.setTitle}
              onDescriptionChange={actions.setDescription}
              onDueDateChange={actions.setDueDate}
              onSave={handleSaveChanges}
              onDelete={onDelete}
            />

            <CardActivity
              comments={comments}
              comment={state.comment}
              canComment={canComment}
              isAddingComment={isAddingComment}
              onCommentChange={actions.setComment}
              onSubmitComment={handleAddComment}
            />
          </section>

          <aside className="trello-side-column">
            <CardLabelsPanel
              labels={labels.boardLabels}
              selectedLabelIds={labels.selectedLabelIds}
              selectedLabels={labels.selectedLabels}
              labelName={labels.labelName}
              labelColor={labels.labelColor}
              canEdit={canEdit}
              isCreatingLabel={labels.isCreatingLabel}
              onToggleLabel={labels.toggleDraftLabel}
              onLabelNameChange={labels.setLabelName}
              onLabelColorChange={labels.setLabelColor}
              onCreateLabel={() =>
                labels.createLabel(t("errors.failedCreateLabel"))
              }
            />

            <CardMembersPanel
              members={assignees.boardMembers}
              selectedAssigneeIds={assignees.selectedAssigneeIds}
              selectedAssignees={assignees.selectedAssignees}
              canEdit={canEdit}
              onToggleAssignee={assignees.toggleDraftAssignee}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}