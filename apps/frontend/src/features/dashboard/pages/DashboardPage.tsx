import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "../../../app/constants/routes";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Button from "../../../shared/components/Button";
import Loader from "../../../shared/components/Loader";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { resendVerificationEmailRequest } from "../../auth/api/authApi";
import { useAuth } from "../../auth/hooks/useAuth";
import MyInvitationsPanel from "../components/MyInvitationsPanel";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import {
  createBoardRequest,
  deleteBoardRequest,
  getBoardsRequest,
  updateBoardRequest,
} from "../../boards/api/boardsApi";
import type { Board } from "../../boards/types";
import DashboardSidebar from "../components/DashboardSidebar";
import VerificationBanner from "../components/VerificationBanner";
import BoardFormPanel from "../components/BoardFormPanel";
import BoardsSection from "../components/BoardsSection";

const BOARDS_QUERY_KEY = ["boards"];

const BOARD_COLORS = [
  "#0f4c81",
  "#1d4ed8",
  "#7c3aed",
  "#be185d",
  "#047857",
  "#b45309",
  "#334155",
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, isLoggingOut } = useAuth();

  useDashboardRealtime();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");
  const [boardColor, setBoardColor] = useState(BOARD_COLORS[0]);

  const [formError, setFormError] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerError, setBannerError] = useState("");

  const {
    data: boards = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: BOARDS_QUERY_KEY,
    queryFn: getBoardsRequest,
  });

  const createBoardMutation = useMutation({
    mutationFn: createBoardRequest,
    onSuccess: () => {
      resetBoardForm();
      setIsCreateOpen(false);

      queryClient.invalidateQueries({
        queryKey: BOARDS_QUERY_KEY,
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
        queryKey: BOARDS_QUERY_KEY,
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => deleteBoardRequest(boardId),
    onSuccess: () => {
      setDeletingBoard(null);

      queryClient.invalidateQueries({
        queryKey: BOARDS_QUERY_KEY,
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: resendVerificationEmailRequest,
    onSuccess: () => {
      setBannerMessage(t("verification.success"));
      setBannerError("");
    },
    onError: (error) => {
      setBannerError(getApiErrorMessage(error, t("verification.tryAgain")));
      setBannerMessage("");
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
      setFormError(t("errors.listTitleTooShort"));
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
      setFormError(getApiErrorMessage(error, t("admin.deleteBoardFailed")));
    }
  }

  async function handleDeleteBoard() {
    if (!deletingBoard) return;

    try {
      await deleteBoardMutation.mutateAsync(deletingBoard.id);
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("admin.deleteBoardFailed")));
      setDeletingBoard(null);
    }
  }

  async function handleLogout() {
    await logout();

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  }

  if (isLoading) {
    return <Loader />;
  }

  const isBoardFormOpen = isCreateOpen || Boolean(editingBoard);
  const isSavingBoard =
    createBoardMutation.isPending || updateBoardMutation.isPending;

  return (
    <main className="dashboard-shell">
      <DashboardSidebar
        user={user}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />

      <section className="dashboard-content">
        {!user?.is_email_verified && (
          <VerificationBanner
            bannerMessage={bannerMessage}
            bannerError={bannerError}
            isLoading={resendVerificationMutation.isPending}
            onResend={() => resendVerificationMutation.mutate()}
          />
        )}

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{t("dashboard.workspace")}</p>
            <h1>{t("dashboard.welcome", { name: user?.name || "User" })}</h1>
            <p className="dashboard-subtitle">{t("dashboard.subtitle")}</p>
          </div>

          <Button type="button" onClick={openCreateBoard}>
            {t("dashboard.createBoard")}
          </Button>
        </header>

        {isError && <div className="alert error">{t("admin.deleteBoardFailed")}</div>}
        {formError && <div className="alert error">{formError}</div>}

        <MyInvitationsPanel onError={setFormError} />

        {isBoardFormOpen && (
          <BoardFormPanel
            editingBoard={editingBoard}
            boardTitle={boardTitle}
            boardDescription={boardDescription}
            boardColor={boardColor}
            boardColors={BOARD_COLORS}
            isSaving={isSavingBoard}
            onTitleChange={setBoardTitle}
            onDescriptionChange={setBoardDescription}
            onColorChange={setBoardColor}
            onSubmit={handleBoardSubmit}
            onCancel={closeBoardForm}
          />
        )}

        <BoardsSection
          boards={boards}
          fallbackColor={BOARD_COLORS[0]}
          onCreateBoard={openCreateBoard}
          onEditBoard={openEditBoard}
          onDeleteBoard={setDeletingBoard}
        />
      </section>

      {deletingBoard && (
        <ConfirmModal
          title={t("boards.deleteBoardQuestion")}
          description={t("admin.deleteBoardDescription", {
            title: deletingBoard.title,
          })}
          confirmLabel={t("boards.deleteBoard")}
          isLoading={deleteBoardMutation.isPending}
          onCancel={() => setDeletingBoard(null)}
          onConfirm={handleDeleteBoard}
        />
      )}
    </main>
  );
}