import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoardPath, ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Input from "../../../shared/components/Input";
import Loader from "../../../shared/components/Loader";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { resendVerificationEmailRequest } from "../../auth/api/authApi";
import { useAuth } from "../../auth/hooks/useAuth";
import { isSuperAdmin } from "../../auth/utils/roles";
import MyInvitationsPanel from "../components/MyInvitationsPanel";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import {
  createBoardRequest,
  deleteBoardRequest,
  getBoardsRequest,
  updateBoardRequest,
} from "../../boards/api/boardsApi";
import type { Board, BoardRole } from "../../boards/types";

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

function getRoleLabel(role: BoardRole | null) {
  if (!role) {
    return "";
  }

  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function DashboardPage() {
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
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => deleteBoardRequest(boardId),
    onSuccess: () => {
      setDeletingBoard(null);
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: resendVerificationEmailRequest,
    onSuccess: () => {
      setBannerMessage("Verification email sent successfully.");
      setBannerError("");
    },
    onError: (error) => {
      setBannerError(
        getApiErrorMessage(error, "Failed to resend verification email.")
      );
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

  async function handleBoardSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const title = boardTitle.trim();

    if (title.length < 2) {
      setFormError("Board title must be at least 2 characters.");
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
      } else {
        await createBoardMutation.mutateAsync({
          title,
          description: boardDescription || null,
          background_color: boardColor,
        });
      }
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Failed to save board."));
    }
  }

  async function handleDeleteBoard() {
    if (!deletingBoard) {
      return;
    }

    try {
      await deleteBoardMutation.mutateAsync(deletingBoard.id);
    } catch (error) {
      setFormError(getApiErrorMessage(error, "Failed to delete board."));
      setDeletingBoard(null);
    }
  }

  async function handleLogout() {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  if (isLoading) {
    return <Loader />;
  }

  const isBoardFormOpen = isCreateOpen || Boolean(editingBoard);

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <div>
            <span>Boardly</span>
            <small>Kanban Workspace</small>
          </div>
        </div>

        <Link to={ROUTES.PROFILE} className="sidebar-user clickable">
          <span className="avatar">{user?.name?.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </Link>

        <div className="sidebar-actions">
          {isSuperAdmin(user) && (
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate(ROUTES.ADMIN)}
            >
              Admin panel
            </Button>
          )}

          <Button
            type="button"
            variant="danger"
            fullWidth
            isLoading={isLoggingOut}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      <section className="dashboard-content">
        {!user?.is_email_verified && (
          <div className="alert warning verification-banner">
            <div>
              <strong>Email verification required</strong>
              <p>We sent a verification email. Please verify your account.</p>

              {bannerMessage && <p>{bannerMessage}</p>}
              {bannerError && <p>{bannerError}</p>}
            </div>

            <Button
              type="button"
              variant="secondary"
              isLoading={resendVerificationMutation.isPending}
              onClick={() => resendVerificationMutation.mutate()}
            >
              Resend email
            </Button>
          </div>
        )}

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Welcome, {user?.name || "User"}</h1>
            <p className="dashboard-subtitle">
              Manage your boards, members, lists, and cards.
            </p>
          </div>

          <Button type="button" onClick={openCreateBoard}>
            Create board
          </Button>
        </header>

        {isError && <div className="alert error">Failed to load boards.</div>}
        {formError && <div className="alert error">{formError}</div>}

        <MyInvitationsPanel onError={setFormError} />

        {isBoardFormOpen && (
          <section className="section-block create-board-panel">
            <div className="section-header">
              <div>
                <h2>{editingBoard ? "Edit board" : "Create board"}</h2>
                <p>Choose title, description, and board background.</p>
              </div>
            </div>

            <form className="auth-form" onSubmit={handleBoardSubmit}>
              <Input
                label="Board title"
                value={boardTitle}
                onChange={(event) => setBoardTitle(event.target.value)}
                required
              />

              <div className="field-group">
                <label htmlFor="board-description">Description</label>
                <textarea
                  id="board-description"
                  value={boardDescription}
                  onChange={(event) => setBoardDescription(event.target.value)}
                  placeholder="Optional board description"
                />
              </div>

              <div className="field-group">
                <label>Background color</label>

                <div className="color-palette">
                  {BOARD_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`color-dot ${
                        boardColor === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setBoardColor(color)}
                      aria-label={`Choose ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    resetBoardForm();
                    setIsCreateOpen(false);
                    setEditingBoard(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  isLoading={
                    createBoardMutation.isPending ||
                    updateBoardMutation.isPending
                  }
                >
                  {editingBoard ? "Save changes" : "Create board"}
                </Button>
              </div>
            </form>
          </section>
        )}

        <section className="section-block">
          <div className="section-header">
            <div>
              <h2>Your boards</h2>
              <p>Boards you own or collaborate on.</p>
            </div>
          </div>

          {boards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No boards yet</h3>
              <p>Create your first Kanban board and start organizing work.</p>
              <Button type="button" onClick={openCreateBoard}>
                Create board
              </Button>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map((board) => (
                <article className="board-card" key={board.id}>
                  <Link to={getBoardPath(board.id)} className="board-card-link">
                    <div
                      className="board-cover"
                      style={{
                        background: board.background_color || BOARD_COLORS[0],
                      }}
                    />

                    <div className="board-card-body">
                      <div className="board-card-top">
                        <span className="board-icon">▦</span>

                        {board.role && (
                          <span className={`role-pill ${board.role}`}>
                            {getRoleLabel(board.role)}
                          </span>
                        )}
                      </div>

                      <h3>{board.title}</h3>
                      <p>{board.description || "No description provided."}</p>

                      <div className="board-meta">
                        <span>{board.members_count} members</span>
                        <span>{board.lists_count} lists</span>
                        <span>{board.cards_count} cards</span>
                      </div>

                      <div className="board-date">
                        Created:{" "}
                        {new Date(board.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>

                  {board.role === "owner" && (
                    <div className="board-actions">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openEditBoard(board)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => setDeletingBoard(board)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {deletingBoard && (
        <ConfirmModal
          title="Delete board?"
          description={`This will permanently delete "${deletingBoard.title}" with its lists and cards.`}
          confirmLabel="Delete board"
          isLoading={deleteBoardMutation.isPending}
          onCancel={() => setDeletingBoard(null)}
          onConfirm={handleDeleteBoard}
        />
      )}
    </main>
  );
}