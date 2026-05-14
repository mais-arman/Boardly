import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "../../../app/constants/routes";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";

import type { BoardList, Card } from "../types";
import {
  createCardRequest,
  createCommentRequest,
  createListRequest,
  deleteCardRequest,
  deleteListRequest,
  updateCardRequest,
  updateListRequest,
} from "../api/boardPageApi";
import { deleteBoardRequest } from "../api/boardsApi";

import {
  BOARD_QUERY_KEY,
  CARDS_QUERY_KEY,
  COMMENTS_QUERY_KEY,
  LISTS_QUERY_KEY,
} from "./useBoardData";

const DEFAULT_LISTS = ["To Do", "In Progress", "Doing", "Done"];

type UseBoardCommandsParams = {
  boardId: string | undefined;
};

export function useBoardCommands({ boardId }: UseBoardCommandsParams) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newListTitle, setNewListTitle] = useState("");

  const [cardTitleByList, setCardTitleByList] = useState<
    Record<string, string>
  >({});

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState("");

  const [listToDelete, setListToDelete] = useState<BoardList | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");

  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

  const createListMutation = useMutation({
    mutationFn: (title: string) =>
      createListRequest(boardId as string, {
        title,
      }),

    onSuccess: () => {
      setNewListTitle("");

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({
      listId,
      title,
    }: {
      listId: string;
      title: string;
    }) =>
      updateListRequest(listId, {
        title,
      }),

    onSuccess: () => {
      setEditingListId(null);
      setEditingListTitle("");

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => deleteListRequest(listId),

    onSuccess: () => {
      setListToDelete(null);

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const createCardMutation = useMutation({
    mutationFn: ({
      listId,
      title,
    }: {
      listId: string;
      title: string;
    }) =>
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
        queryKey: [CARDS_QUERY_KEY, variables.listId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({
      cardId,
      title,
      description,
      dueDate,
    }: {
      cardId: string;
      title: string;
      description: string;
      dueDate: string;
    }) =>
      updateCardRequest(cardId, {
        title,
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      }),

    onSuccess: (updatedCard) => {
      setSelectedCard(updatedCard);

      queryClient.invalidateQueries({
        queryKey: [CARDS_QUERY_KEY, updatedCard.list_id],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
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
        queryKey: [BOARD_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [CARDS_QUERY_KEY],
        exact: false,
      });

      queryClient.removeQueries({
        queryKey: [COMMENTS_QUERY_KEY, deletedCardId],
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({
      cardId,
      content,
    }: {
      cardId: string;
      content: string;
    }) =>
      createCommentRequest(cardId, {
        content,
      }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY, variables.cardId],
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: () => deleteBoardRequest(boardId as string),

    onSuccess: () => {
      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },
  });

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");

    const title = newListTitle.trim();

    if (title.length < 2) {
      setPageError("List title must be at least 2 characters.");
      return;
    }

    try {
      await createListMutation.mutateAsync(title);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to create list."));
    }
  }

  async function handleCreateDefaultWorkflow() {
    setPageError("");

    try {
      for (const title of DEFAULT_LISTS) {
        await createListMutation.mutateAsync(title);
      }
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Failed to create workflow lists.")
      );
    }
  }

  function startEditingList(list: BoardList) {
    setEditingListId(list.id);
    setEditingListTitle(list.title);
  }

  function cancelEditingList() {
    setEditingListId(null);
    setEditingListTitle("");
  }

  async function handleUpdateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingListId) return;

    setPageError("");

    const title = editingListTitle.trim();

    if (title.length < 2) {
      setPageError("List title must be at least 2 characters.");
      return;
    }

    try {
      await updateListMutation.mutateAsync({
        listId: editingListId,
        title,
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update list."));
    }
  }

  async function confirmDeleteList() {
    if (!listToDelete) return;

    setPageError("");

    try {
      await deleteListMutation.mutateAsync(listToDelete.id);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to delete list."));
      setListToDelete(null);
    }
  }

  async function handleCreateCard(
    event: FormEvent<HTMLFormElement>,
    listId: string
  ) {
    event.preventDefault();
    setPageError("");

    const title = cardTitleByList[listId]?.trim();

    if (!title || title.length < 2) {
      setPageError("Card title must be at least 2 characters.");
      return;
    }

    try {
      await createCardMutation.mutateAsync({
        listId,
        title,
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to create card."));
    }
  }

  async function handleUpdateCard(payload: {
    cardId: string;
    title: string;
    description: string;
    dueDate: string;
  }) {
    setModalError("");

    if (payload.title.trim().length < 2) {
      setModalError("Card title must be at least 2 characters.");
      return;
    }

    try {
      await updateCardMutation.mutateAsync(payload);
    } catch (error) {
      setModalError(getApiErrorMessage(error, "Failed to update card."));
    }
  }

  async function confirmDeleteCard() {
    if (!cardToDelete) return;

    setModalError("");

    try {
      await deleteCardMutation.mutateAsync(cardToDelete.id);
    } catch (error) {
      setModalError(getApiErrorMessage(error, "Failed to delete card."));
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
      setModalError(getApiErrorMessage(error, "Failed to add comment."));
    }
  }

  function handleCardChanged(updatedCard: Card) {
    setSelectedCard(updatedCard);

    queryClient.invalidateQueries({
      queryKey: [CARDS_QUERY_KEY, updatedCard.list_id],
    });

    queryClient.invalidateQueries({
      queryKey: [BOARD_QUERY_KEY, boardId],
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
      newListTitle,
      cardTitleByList,
      editingListId,
      editingListTitle,
      listToDelete,
      cardToDelete,
      selectedCard,
      pageError,
      modalError,
      isMembersPanelOpen,
      isDeleteBoardOpen,
    },

    mutations: {
      createListMutation,
      updateListMutation,
      deleteListMutation,
      createCardMutation,
      updateCardMutation,
      deleteCardMutation,
      createCommentMutation,
      deleteBoardMutation,
    },

    actions: {
      setNewListTitle,
      setEditingListTitle,
      setListToDelete,
      setCardToDelete,
      setSelectedCard,
      setPageError,
      setIsMembersPanelOpen,
      setIsDeleteBoardOpen,

      handleCreateList,
      handleCreateDefaultWorkflow,
      startEditingList,
      cancelEditingList,
      handleUpdateList,
      confirmDeleteList,
      handleCreateCard,
      handleUpdateCard,
      confirmDeleteCard,
      handleCreateComment,
      handleCardChanged,
      handleCardTitleChange,
    },
  };
}