import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BoardMember, Card, CardLabel, Comment } from "../types";
import {
  addAssigneeToCardRequest,
  applyLabelToCardRequest,
  createBoardLabelRequest,
  getBoardLabelsRequest,
  removeAssigneeFromCardRequest,
  removeLabelFromCardRequest,
} from "../api/cardMetaApi";
import { getBoardMembersRequest } from "../api/boardMembersApi";
import CardDetailsHeader from "./card-details/CardDetailsHeader";
import CardDetailsForm from "./card-details/CardDetailsForm";
import CardLabelsPanel from "./card-details/CardLabelsPanel";
import CardMembersPanel from "./card-details/CardMembersPanel";
import CardActivity from "./card-details/CardActivity";

type ErrorResponse = {
  message?: string;
};

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

const LABELS_QUERY_KEY = "board-labels";
const MEMBERS_QUERY_KEY = "board-members";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    return data?.message || fallback;
  }

  return fallback;
}

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
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [dueDate, setDueDate] = useState(
    card.due_date ? card.due_date.slice(0, 10) : ""
  );

  const [comment, setComment] = useState("");
  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#22c55e");

  const [draftLabelIds, setDraftLabelIds] = useState<string[]>(
    card.labels.map((label) => label.id)
  );

  const [draftAssigneeIds, setDraftAssigneeIds] = useState<string[]>(
    card.assignees.map((assignee) => assignee.id)
  );

  const [localError, setLocalError] = useState("");

  const labelsQuery = useQuery({
    queryKey: [LABELS_QUERY_KEY, boardId],
    queryFn: () => getBoardLabelsRequest(boardId),
  });

  const membersQuery = useQuery({
    queryKey: [MEMBERS_QUERY_KEY, boardId],
    queryFn: () => getBoardMembersRequest(boardId),
  });

  const createLabelMutation = useMutation({
    mutationFn: () =>
      createBoardLabelRequest(boardId, {
        name: labelName.trim(),
        color: labelColor,
      }),
    onSuccess: (createdLabel) => {
      setLabelName("");
      setLabelColor("#22c55e");
      setDraftLabelIds((current) => [...current, createdLabel.id]);

      queryClient.invalidateQueries({
        queryKey: [LABELS_QUERY_KEY, boardId],
      });
    },
  });

  const applyLabelMutation = useMutation({
    mutationFn: (labelId: string) =>
      applyLabelToCardRequest(card.id, {
        label_id: labelId,
      }),
  });

  const removeLabelMutation = useMutation({
    mutationFn: (labelId: string) =>
      removeLabelFromCardRequest(card.id, labelId),
  });

  const addAssigneeMutation = useMutation({
    mutationFn: (userId: string) =>
      addAssigneeToCardRequest(card.id, {
        user_id: userId,
      }),
  });

  const removeAssigneeMutation = useMutation({
    mutationFn: (userId: string) =>
      removeAssigneeFromCardRequest(card.id, userId),
  });

  const boardLabels = useMemo(
    () => labelsQuery.data ?? [],
    [labelsQuery.data]
  );

  const boardMembers = useMemo(
    () => membersQuery.data ?? [],
    [membersQuery.data]
  );

  const selectedLabels = boardLabels.filter((label) =>
    draftLabelIds.includes(label.id)
  );

  const selectedAssignees = boardMembers.filter((member) =>
    draftAssigneeIds.includes(member.user_id)
  );

  function toggleDraftLabel(label: CardLabel) {
    if (!canEdit) return;

    setDraftLabelIds((current) =>
      current.includes(label.id)
        ? current.filter((id) => id !== label.id)
        : [...current, label.id]
    );
  }

  function toggleDraftAssignee(member: BoardMember) {
    if (!canEdit) return;

    setDraftAssigneeIds((current) =>
      current.includes(member.user_id)
        ? current.filter((id) => id !== member.user_id)
        : [...current, member.user_id]
    );
  }

  async function syncLabels() {
    const originalLabelIds = card.labels.map((label) => label.id);

    const labelsToAdd = draftLabelIds.filter(
      (labelId) => !originalLabelIds.includes(labelId)
    );

    const labelsToRemove = originalLabelIds.filter(
      (labelId) => !draftLabelIds.includes(labelId)
    );

    let updatedCard: Card | null = null;

    for (const labelId of labelsToAdd) {
      updatedCard = await applyLabelMutation.mutateAsync(labelId);
    }

    for (const labelId of labelsToRemove) {
      updatedCard = await removeLabelMutation.mutateAsync(labelId);
    }

    return updatedCard;
  }

  async function syncAssignees() {
    const originalAssigneeIds = card.assignees.map(
      (assignee) => assignee.id
    );

    const assigneesToAdd = draftAssigneeIds.filter(
      (userId) => !originalAssigneeIds.includes(userId)
    );

    const assigneesToRemove = originalAssigneeIds.filter(
      (userId) => !draftAssigneeIds.includes(userId)
    );

    let updatedCard: Card | null = null;

    for (const userId of assigneesToAdd) {
      updatedCard = await addAssigneeMutation.mutateAsync(userId);
    }

    for (const userId of assigneesToRemove) {
      updatedCard = await removeAssigneeMutation.mutateAsync(userId);
    }

    return updatedCard;
  }

  async function handleSaveChanges() {
    if (!canEdit) return;

    setLocalError("");

    if (title.trim().length < 2) {
      setLocalError("Card title must be at least 2 characters.");
      return;
    }

    try {
      await onUpdate({
        cardId: card.id,
        title: title.trim(),
        description,
        dueDate,
      });

      const labelsUpdatedCard = await syncLabels();
      const assigneesUpdatedCard = await syncAssignees();
      const latestCard = assigneesUpdatedCard || labelsUpdatedCard;

      if (latestCard) {
        onCardChanged(latestCard);
      }
    } catch (error) {
      setLocalError(getErrorMessage(error, "Failed to save card changes."));
    }
  }

  async function handleCreateLabel() {
    setLocalError("");

    if (!labelName.trim() || !canEdit) return;

    try {
      await createLabelMutation.mutateAsync();
    } catch (error) {
      setLocalError(getErrorMessage(error, "Failed to create label."));
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
    } catch (error) {
      setLocalError(getErrorMessage(error, "Failed to add comment."));
    }
  }

  const isSavingMeta =
    applyLabelMutation.isPending ||
    removeLabelMutation.isPending ||
    addAssigneeMutation.isPending ||
    removeAssigneeMutation.isPending;

  return (
    <div className="modal-backdrop trello-modal-backdrop">
      <section className="trello-card-modal">
        <CardDetailsHeader
          title={card.title}
          roleLabel={roleLabel}
          onClose={onClose}
        />

        {error && <div className="alert error">{error}</div>}
        {localError && <div className="alert error">{localError}</div>}

        {!canEdit && (
          <div className="alert warning">
            Viewer mode: you can read card details, labels, members, and
            activity. Editing is disabled.
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
              isSaving={isUpdating || isSavingMeta}
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
              labels={boardLabels}
              selectedLabelIds={draftLabelIds}
              selectedLabels={selectedLabels}
              labelName={labelName}
              labelColor={labelColor}
              canEdit={canEdit}
              isCreatingLabel={createLabelMutation.isPending}
              onToggleLabel={toggleDraftLabel}
              onLabelNameChange={setLabelName}
              onLabelColorChange={setLabelColor}
              onCreateLabel={handleCreateLabel}
            />

            <CardMembersPanel
              members={boardMembers}
              selectedAssigneeIds={draftAssigneeIds}
              selectedAssignees={selectedAssignees}
              canEdit={canEdit}
              onToggleAssignee={toggleDraftAssignee}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}