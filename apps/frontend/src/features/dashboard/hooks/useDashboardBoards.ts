import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import {
  createBoardRequest,
  deleteBoardRequest,
  getBoardsRequest,
  updateBoardRequest,
} from "../../boards/api/boardsApi";
import type { Board } from "../../boards/types";

export const BOARD_COLORS = [
  "#0f4c81",
  "#1d4ed8",
  "#7c3aed",
  "#be185d",
  "#047857",
  "#b45309",
  "#334155",
];

export function useDashboardBoards() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0]);
  const [formError, setFormError] = useState("");

  const boardsQuery = useQuery({
    queryKey: QUERY_KEYS.BOARDS.ALL,
    queryFn: getBoardsRequest,
  });

  const createBoardMutation = useMutation({
    mutationFn: createBoardRequest,
    onSuccess: () => {
      resetBoardForm();
      setIsCreateOpen(false);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.ALL,
      });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: ({
      boardId,
      title,
      description,
      backgroundColor,
    }: {
      boardId: string;
      title: string;
      description: string;
      backgroundColor: string;
    }) =>
      updateBoardRequest(boardId, {
        title,
        description: description || null,
        background_color: backgroundColor,
      }),

    onSuccess: () => {
      resetBoardForm();
      setEditingBoard(null);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.ALL,
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => deleteBoardRequest(boardId),

    onSuccess: () => {
      setDeletingBoard(null);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.ALL,
      });
    },
  });

  function resetBoardForm() {
    setBoardTitle("");
    setBoardDescription("");
    setBoardColor(BOARD_COLORS[0]);
    setFormError("");
  }

  function openCreateBoard() {
    resetBoardForm();
    setEditingBoard(null);
    setIsCreateOpen(true);
  }

  function openEditBoard(board: Board) {
    setIsCreateOpen(false);
    setEditingBoard(board);
    setBoardTitle(board.title);
    setBoardDescription(board.description || "");
    setBoardColor(board.background_color || BOARD_COLORS[0]);
    setFormError("");
  }

  function closeBoardForm() {
    resetBoardForm();
    setIsCreateOpen(false);
    setEditingBoard(null);
  }

  async function handleBoardSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const title = boardTitle.trim();

    if (title.length < 2) {
      setFormError(t("errors.boardTitleTooShort", "Board title must be at least 2 characters."));
      return;
    }

    try {
      if (editingBoard) {
        await updateBoardMutation.mutateAsync({
          boardId: editingBoard.id,
          title,
          description: boardDescription,
          backgroundColor: boardColor,
        });

        return;
      }

      await createBoardMutation.mutateAsync({
        title,
        description: boardDescription || null,
        background_color: boardColor,
      });
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("errors.failedSaveBoard", "Failed to save board.")));
    }
  }

  async function handleDeleteBoard() {
    if (!deletingBoard) return;

    try {
      await deleteBoardMutation.mutateAsync(deletingBoard.id);
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("errors.failedDeleteBoard", "Failed to delete board.")));
      setDeletingBoard(null);
    }
  }

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    isError: boardsQuery.isError,

    state: {
      isCreateOpen,
      editingBoard,
      deletingBoard,
      boardTitle,
      boardDescription,
      boardColor,
      formError,
      isBoardFormOpen: isCreateOpen || Boolean(editingBoard),
    },

    mutations: {
      createBoardMutation,
      updateBoardMutation,
      deleteBoardMutation,
      isSavingBoard:
        createBoardMutation.isPending || updateBoardMutation.isPending,
    },

    actions: {
      setBoardTitle,
      setBoardDescription,
      setBoardColor,
      setDeletingBoard,
      setFormError,
      openCreateBoard,
      openEditBoard,
      closeBoardForm,
      handleBoardSubmit,
      handleDeleteBoard,
    },
  };
}