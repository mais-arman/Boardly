import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import type { BoardList } from "../types";
import {
  createListRequest,
  deleteListRequest,
  updateListRequest,
} from "../api/boardPageApi";

type UseListCommandsParams = {
  boardId: string | undefined;
  listToDelete: BoardList | null;
  setListToDelete: (list: BoardList | null) => void;
  setPageError: (message: string) => void;
};

export function useListCommands({
  boardId,
  listToDelete,
  setListToDelete,
  setPageError,
}: UseListCommandsParams) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [newListTitle, setNewListTitle] = useState("");
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState("");

  const createListMutation = useMutation({
    mutationFn: (title: string) =>
      createListRequest(boardId as string, {
        title,
      }),

    onSuccess: () => {
      setNewListTitle("");

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LISTS(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) =>
      updateListRequest(listId, {
        title,
      }),

    onSuccess: () => {
      setEditingListId(null);
      setEditingListTitle("");

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LISTS(boardId),
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => deleteListRequest(listId),

    onSuccess: () => {
      setListToDelete(null);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LISTS(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });
    },
  });

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");

    const title = newListTitle.trim();

    if (title.length < 2) {
      setPageError(t("errors.listTitleTooShort"));
      return;
    }

    try {
      await createListMutation.mutateAsync(title);
    } catch (error) {
      setPageError(getApiErrorMessage(error, t("errors.failedCreateList")));
    }
  }

  async function handleCreateDefaultWorkflow() {
    setPageError("");

    const defaultLists = [
      t("boards.todo"),
      t("boards.inProgress"),
      t("boards.doing"),
      t("boards.done"),
    ];

    try {
      for (const title of defaultLists) {
        await createListMutation.mutateAsync(title);
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error, t("errors.failedCreateWorkflow")));
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
      setPageError(t("errors.listTitleTooShort"));
      return;
    }

    try {
      await updateListMutation.mutateAsync({
        listId: editingListId,
        title,
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, t("errors.failedUpdateList")));
    }
  }

  async function confirmDeleteList() {
    if (!listToDelete) return;

    setPageError("");

    try {
      await deleteListMutation.mutateAsync(listToDelete.id);
    } catch (error) {
      setPageError(getApiErrorMessage(error, t("errors.failedDeleteList")));
      setListToDelete(null);
    }
  }

  return {
    state: {
      newListTitle,
      editingListId,
      editingListTitle,
    },

    mutations: {
      createListMutation,
      updateListMutation,
      deleteListMutation,
    },

    actions: {
      setNewListTitle,
      setEditingListTitle,
      handleCreateList,
      handleCreateDefaultWorkflow,
      startEditingList,
      cancelEditingList,
      handleUpdateList,
      confirmDeleteList,
    },
  };
}