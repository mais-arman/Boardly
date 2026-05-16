import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { Card, Comment } from "../types";
import { useCardMeta } from "../hooks/useCardMeta";
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

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.due_date ? card.due_date.slice(0, 10) : ""
  );
  const [comment, setComment] = useState("");

  const { labels, assignees, meta } = useCardMeta({
    boardId,
    card,
    canEdit,
  });

  async function handleSaveChanges() {
    if (!canEdit) return;

    meta.setLocalError("");

    if (title.trim().length < 2) {
      meta.setLocalError(t("errors.cardTitleTooShort"));
      return;
    }

    try {
      await onUpdate({
        cardId: card.id,
        title: title.trim(),
        description,
        dueDate,
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

    const content = comment.trim();

    if (!content) return;

    try {
      await onCreateComment(card.id, content);
      setComment("");
    } catch {
      meta.setLocalError(t("errors.failedAddComment"));
    }
  }

  return (
    <div className="modal-backdrop trello-modal-backdrop">
      <section className="trello-card-modal">
        <CardDetailsHeader
          title={card.title}
          roleLabel={roleLabel}
          onClose={onClose}
        />

        {error && <div className="alert error">{error}</div>}
        {meta.localError && <div className="alert error">{meta.localError}</div>}

        {!canEdit && (
          <div className="alert warning">
            {t("card.viewerEditDisabled")}
          </div>
        )}

        <div className="trello-modal-grid">
          <section className="trello-main-column">
            <CardDetailsForm
              card={card}
              title={title}
              description={description}
              dueDate={dueDate}
              canEdit={canEdit}
              isDeleting={isDeleting}
              isSaving={isUpdating || meta.isSavingMeta}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onDueDateChange={setDueDate}
              onSave={handleSaveChanges}
              onDelete={onDelete}
            />

            <CardActivity
              comments={comments}
              comment={comment}
              canComment={canComment}
              isAddingComment={isAddingComment}
              onCommentChange={setComment}
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