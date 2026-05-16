import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import type { BoardMember, Card, CardLabel } from "../types";
import { getBoardMembersRequest } from "../api/boardMembersApi";
import {
  addAssigneeToCardRequest,
  applyLabelToCardRequest,
  createBoardLabelRequest,
  getBoardLabelsRequest,
  removeAssigneeFromCardRequest,
  removeLabelFromCardRequest,
} from "../api/cardMetaApi";

type UseCardMetaParams = {
  boardId: string;
  card: Card;
  canEdit: boolean;
};

export function useCardMeta({ boardId, card, canEdit }: UseCardMetaParams) {
  const queryClient = useQueryClient();

  const [labelName, setLabelName] = useState("");
  const [labelColor, setLabelColor] = useState("#22c55e");
  const [localError, setLocalError] = useState("");

  const [draftLabelIds, setDraftLabelIds] = useState<string[]>(
    card.labels.map((label) => label.id)
  );

  const [draftAssigneeIds, setDraftAssigneeIds] = useState<string[]>(
    card.assignees.map((assignee) => assignee.id)
  );

  const labelsQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.LABELS(boardId),
    queryFn: () => getBoardLabelsRequest(boardId),
  });

  const membersQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.MEMBERS(boardId),
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
        queryKey: QUERY_KEYS.BOARDS.LABELS(boardId),
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

  async function createLabel(fallbackMessage: string) {
    setLocalError("");

    if (!labelName.trim() || !canEdit) return;

    try {
      await createLabelMutation.mutateAsync();
    } catch (error) {
      setLocalError(getApiErrorMessage(error, fallbackMessage));
    }
  }

  const isSavingMeta =
    applyLabelMutation.isPending ||
    removeLabelMutation.isPending ||
    addAssigneeMutation.isPending ||
    removeAssigneeMutation.isPending;

  return {
    labels: {
      boardLabels,
      selectedLabels,
      selectedLabelIds: draftLabelIds,
      labelName,
      labelColor,
      setLabelName,
      setLabelColor,
      toggleDraftLabel,
      createLabel,
      isCreatingLabel: createLabelMutation.isPending,
    },

    assignees: {
      boardMembers,
      selectedAssignees,
      selectedAssigneeIds: draftAssigneeIds,
      toggleDraftAssignee,
    },

    meta: {
      localError,
      setLocalError,
      isSavingMeta,
      syncLabels,
      syncAssignees,
    },
  };
}