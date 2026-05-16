import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import type { Card } from "../../cards/types";
import {
  createCardRequest,
  createCommentRequest,
  deleteCardRequest,
  updateCardRequest,
} from "../../boards/api/boardPageApi";

export type UpdateCardFormPayload = {
  cardId: string;
  title: string;
  description: string;
  dueDate: string;
};

type UseCardCommandsParams = {
  boardId: string | undefined;
  cardToDelete: Card | null;
  setCardToDelete: (card: Card | null) => void;
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  setPageError: (message: string) => void;
  setModalError: (message: string) => void;
};

export function useCardCommands({
  boardId,
  cardToDelete,
  setCardToDelete,
  setSelectedCard,
  setPageError,
  setModalError,
}: UseCardCommandsParams) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [cardTitleByList, setCardTitleByList] = useState<Record<string, string>>(
    {}
  );

  const createCardMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) =>
      createCardRequest(listId, {
        title,
        description: null,
        due_date: null,
      }),

    onSuccess: (_, variables) => {
      setCardTitleByList((current) => ({
        ...current,
        [variables.listId]: "",
      }));

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(variables.listId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({
      cardId,
      title,
      description,
      dueDate,
    }: UpdateCardFormPayload) =>
      updateCardRequest(cardId, {
        title,
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      }),

    onSuccess: (updatedCard) => {
      setSelectedCard(updatedCard);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(updatedCard.list_id),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => deleteCardRequest(cardId),

    onSuccess: (_, deletedCardId) => {
      setSelectedCard(null);
      setCardToDelete(null);
      setModalError("");

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: ["list-cards"],
        exact: false,
      });

      queryClient.removeQueries({
        queryKey: QUERY_KEYS.BOARDS.CARD_COMMENTS(deletedCardId),
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ cardId, content }: { cardId: string; content: string }) =>
      createCommentRequest(cardId, {
        content,
      }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.CARD_COMMENTS(variables.cardId),
      });
    },
  });

  async function handleCreateCard(
    event: FormEvent<HTMLFormElement>,
    listId: string
  ) {
    event.preventDefault();
    setPageError("");

    const title = cardTitleByList[listId]?.trim();

    if (!title || title.length < 2) {
      setPageError(t("errors.cardTitleTooShort"));
      return;
    }

    try {
      await createCardMutation.mutateAsync({
        listId,
        title,
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, t("errors.failedCreateCard")));
    }
  }

  async function handleUpdateCard(payload: UpdateCardFormPayload) {
    setModalError("");

    if (payload.title.trim().length < 2) {
      setModalError(t("errors.cardTitleTooShort"));
      return;
    }

    try {
      await updateCardMutation.mutateAsync(payload);
    } catch (error) {
      setModalError(getApiErrorMessage(error, t("errors.failedUpdateCard")));
    }
  }

  async function confirmDeleteCard() {
    if (!cardToDelete) return;

    setModalError("");

    try {
      await deleteCardMutation.mutateAsync(cardToDelete.id);
    } catch (error) {
      setModalError(getApiErrorMessage(error, t("errors.failedDeleteCard")));
      setCardToDelete(null);
    }
  }

  async function handleCreateComment(cardId: string, content: string) {
    setModalError("");

    try {
      await createCommentMutation.mutateAsync({
        cardId,
        content,
      });
    } catch (error) {
      setModalError(getApiErrorMessage(error, t("errors.failedAddComment")));
    }
  }

  function handleCardChanged(updatedCard: Card) {
    setSelectedCard(updatedCard);

    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(updatedCard.list_id),
    });

    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
    });
  }

  function handleCardTitleChange(listId: string, value: string) {
    setCardTitleByList((current) => ({
      ...current,
      [listId]: value,
    }));
  }

  return {
    state: {
      cardTitleByList,
    },

    mutations: {
      createCardMutation,
      updateCardMutation,
      deleteCardMutation,
      createCommentMutation,
    },

    actions: {
      handleCreateCard,
      handleUpdateCard,
      confirmDeleteCard,
      handleCreateComment,
      handleCardChanged,
      handleCardTitleChange,
    },
  };
}