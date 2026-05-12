import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "../../../app/constants/translations";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
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

type ErrorResponse = {
  message?: string;
};

type CardDetailsModalProps = {
  boardId: string;
  card: Card;
  comments: Comment[];
  isUpdating: boolean;
  isAddingComment: boolean;
  error: string;
  canEdit: boolean;
  onClose: () => void;
  onUpdate: (payload: {
    cardId: string;
    title: string;
    description: string;
    dueDate: string;
  }) => Promise<void>;
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
  error,
  canEdit,
  onClose,
  onUpdate,
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
  const [labelColor, setLabelColor] = useState("#4f46e5");

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
      setLabelColor("#4f46e5");
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
    mutationFn: (labelId: string) => removeLabelFromCardRequest(card.id, labelId),
  });

  const addAssigneeMutation = useMutation({
    mutationFn: (userId: string) =>
      addAssigneeToCardRequest(card.id, {
        user_id: userId,
      }),
  });

  const removeAssigneeMutation = useMutation({
    mutationFn: (userId: string) => removeAssigneeFromCardRequest(card.id, userId),
  });

  const boardLabels = useMemo(() => labelsQuery.data ?? [], [labelsQuery.data]);
  const boardMembers = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);

  const selectedLabels = useMemo(() => {
    return boardLabels.filter((label) => draftLabelIds.includes(label.id));
  }, [boardLabels, draftLabelIds]);

  const selectedAssignees = useMemo(() => {
    return boardMembers.filter((member) =>
      draftAssigneeIds.includes(member.user_id)
    );
  }, [boardMembers, draftAssigneeIds]);

  function toggleDraftLabel(label: CardLabel) {
    if (!canEdit) {
      return;
    }

    setDraftLabelIds((current) =>
      current.includes(label.id)
        ? current.filter((id) => id !== label.id)
        : [...current, label.id]
    );
  }

  function toggleDraftAssignee(member: BoardMember) {
    if (!canEdit) {
      return;
    }

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
    const originalAssigneeIds = card.assignees.map((assignee) => assignee.id);

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

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canEdit) {
      return;
    }

    setLocalError("");

    try {
      await onUpdate({
        cardId: card.id,
        title,
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

  async function handleAddComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = comment.trim();

    if (!content) {
      return;
    }

    await onCreateComment(card.id, content);
    setComment("");
  }

  async function handleCreateLabel() {
    setLocalError("");

    if (!labelName.trim()) {
      return;
    }

    try {
      await createLabelMutation.mutateAsync();
    } catch (error) {
      setLocalError(getErrorMessage(error, "Failed to create label."));
    }
  }

  const isSavingMeta =
    applyLabelMutation.isPending ||
    removeLabelMutation.isPending ||
    addAssigneeMutation.isPending ||
    removeAssigneeMutation.isPending;

  return (
    <div className="modal-backdrop">
      <section className="card-modal trello-modal">
        <header className="card-modal-header">
          <div>
            <p className="eyebrow">{t.boards.cardDetails}</p>
            <h2>{card.title}</h2>
          </div>

          <button type="button" className="icon-button" onClick={onClose}>
            ×
          </button>
        </header>

        {error && <div className="alert error">{error}</div>}
        {localError && <div className="alert error">{localError}</div>}

        {!canEdit && (
          <div className="alert warning">
            You have viewer access. Editing is disabled.
          </div>
        )}

        <form className="card-modal-form" onSubmit={handleSave}>
          <Input
            label={t.boards.title}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!canEdit}
            required
          />

          <div className="field-group">
            <label htmlFor="card-description">{t.boards.description}</label>
            <textarea
              id="card-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={!canEdit}
            />
          </div>

          <Input
            label={t.boards.dueDate}
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={!canEdit}
          />

          <section className="modal-section">
            <h3>Labels</h3>

            {selectedLabels.length > 0 && (
              <div className="selected-labels-preview">
                {selectedLabels.map((label) => (
                  <span
                    key={label.id}
                    className="selected-label-chip"
                    style={{ background: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}

            {labelsQuery.isLoading ? (
              <p className="muted-text">Loading labels...</p>
            ) : (
              <div className="labels-picker">
                {boardLabels.map((label) => (
                  <button
                    type="button"
                    key={label.id}
                    className={`label-option ${
                      draftLabelIds.includes(label.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleDraftLabel(label)}
                    disabled={!canEdit}
                  >
                    <span style={{ background: label.color }} />
                    {label.name}
                  </button>
                ))}
              </div>
            )}

            {canEdit && (
              <div className="create-label-form">
                <Input
                  label="New label"
                  value={labelName}
                  onChange={(event) => setLabelName(event.target.value)}
                  placeholder="Frontend"
                />

                <input
                  className="color-input"
                  type="color"
                  value={labelColor}
                  onChange={(event) => setLabelColor(event.target.value)}
                  aria-label="Label color"
                />

                <Button
                  type="button"
                  isLoading={createLabelMutation.isPending}
                  onClick={handleCreateLabel}
                >
                  Create label
                </Button>
              </div>
            )}
          </section>

          <section className="modal-section">
            <h3>Assignees</h3>

            {selectedAssignees.length === 0 ? (
              <p className="muted-text">No assignees selected.</p>
            ) : (
              <div className="assignee-list">
                {selectedAssignees.map((member) => (
                  <span key={member.id} className="assignee-chip removable">
                    {member.user?.name || member.user?.email || member.user_id}

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => toggleDraftAssignee(member)}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {canEdit && (
              <div className="assignee-picker">
                {boardMembers.map((member) => (
                  <button
                    type="button"
                    key={member.id}
                    className={`assignee-option ${
                      draftAssigneeIds.includes(member.user_id) ? "selected" : ""
                    }`}
                    onClick={() => toggleDraftAssignee(member)}
                  >
                    <span className="avatar mini">
                      {(member.user?.name || member.user?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>

                    <span>
                      {member.user?.name || member.user_id}
                      <small>{member.user?.email}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {canEdit && (
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={onClose}>
                {t.boards.cancel}
              </Button>

              <Button type="submit" isLoading={isUpdating || isSavingMeta}>
                {t.boards.saveChanges}
              </Button>
            </div>
          )}
        </form>

        <section className="comments-section">
          <h3>{t.boards.comments}</h3>

          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={t.boards.writeComment}
            />

            <Button type="submit" isLoading={isAddingComment}>
              {t.boards.addComment}
            </Button>
          </form>

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="muted-text">{t.boards.noComments}</p>
            ) : (
              comments.map((item) => (
                <article className="comment-item" key={item.id}>
                  <p>{item.content}</p>
                  <small>{new Date(item.created_at).toLocaleString()}</small>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </div>
  );
}