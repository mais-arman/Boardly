import { useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getBoardPath } from "../../../app/constants/routes";
import { t } from "../../../app/constants/translations";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Loader from "../../../shared/components/Loader";
import { resendVerificationEmailRequest } from "../../auth/api/authApi";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  createBoardRequest,
  getBoardsRequest,
} from "../../boards/api/boardsApi";
import type { BoardRole } from "../../boards/types";

type ErrorResponse = {
  message?: string;
};

const BOARDS_QUERY_KEY = ["boards"];

function getRoleLabel(role: BoardRole | null) {
  if (!role) {
    return "";
  }

  return t.boards.roles[role];
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDescription, setBoardDescription] = useState("");

  const [isResending, setIsResending] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerError, setBannerError] = useState("");

  const [formError, setFormError] = useState("");

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
      queryClient.invalidateQueries({ queryKey: BOARDS_QUERY_KEY });
      setBoardTitle("");
      setBoardDescription("");
      setFormError("");
      setIsCreateOpen(false);
    },
  });

  async function handleResendVerification() {
    setIsResending(true);
    setBannerMessage("");
    setBannerError("");

    try {
      await resendVerificationEmailRequest();
      setBannerMessage(t.verification.resendSuccess);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ErrorResponse | undefined;
        setBannerError(data?.message || t.verification.resendFailed);
      } else {
        setBannerError(t.verification.resendFailed);
      }
    } finally {
      setIsResending(false);
    }
  }

  async function handleCreateBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    try {
      await createBoardMutation.mutateAsync({
        title: boardTitle,
        description: boardDescription || null,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ErrorResponse | undefined;
        setFormError(data?.message || t.boards.createFailed);
      } else {
        setFormError(t.boards.createFailed);
      }
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <div>
            <span>{t.dashboard.appName}</span>
            <small>{t.dashboard.appSubtitle}</small>
          </div>
        </div>

        <div className="sidebar-user">
          <span className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
      </aside>

      <section className="dashboard-content">
        {!user?.is_email_verified && (
          <div className="alert warning verification-banner">
            <div>
              <strong>{t.verification.bannerTitle}</strong>
              <p>{t.verification.bannerDescription}</p>
              {bannerMessage && <p>{bannerMessage}</p>}
              {bannerError && <p>{bannerError}</p>}
            </div>

            <Button
              type="button"
              variant="secondary"
              isLoading={isResending}
              onClick={handleResendVerification}
            >
              {t.verification.resendButton}
            </Button>
          </div>
        )}

        <header className="dashboard-header">
          <div>
            <p className="eyebrow">{t.dashboard.eyebrow}</p>
            <h1>
              {t.dashboard.welcome}, {user?.name || t.dashboard.fallbackUser}
            </h1>
            <p className="dashboard-subtitle">{t.boards.subtitle}</p>
          </div>

          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            {t.boards.createButton}
          </Button>
        </header>

        {isError && <div className="alert error">{t.boards.fetchFailed}</div>}

        {isCreateOpen && (
          <section className="section-block create-board-panel">
            <div className="section-header">
              <div>
                <h2>{t.boards.createTitle}</h2>
                <p>{t.boards.subtitle}</p>
              </div>
            </div>

            {formError && <div className="alert error">{formError}</div>}

            <form className="auth-form" onSubmit={handleCreateBoard}>
              <Input
                label={t.boards.boardTitlePlaceholder}
                value={boardTitle}
                onChange={(event) => setBoardTitle(event.target.value)}
                required
              />

              <div className="field-group">
                <label htmlFor="board-description">
                  {t.boards.boardDescriptionPlaceholder}
                </label>
                <textarea
                  id="board-description"
                  value={boardDescription}
                  onChange={(event) => setBoardDescription(event.target.value)}
                  placeholder={t.boards.boardDescriptionPlaceholder}
                />
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  {t.boards.cancel}
                </Button>

                <Button type="submit" isLoading={createBoardMutation.isPending}>
                  {t.boards.save}
                </Button>
              </div>
            </form>
          </section>
        )}

        <section className="section-block">
          <div className="section-header">
            <div>
              <h2>{t.boards.title}</h2>
              <p>{t.boards.subtitle}</p>
            </div>
          </div>

          {boards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>{t.boards.emptyTitle}</h3>
              <p>{t.boards.emptyDescription}</p>
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                {t.boards.createButton}
              </Button>
            </div>
          ) : (
            <div className="boards-grid">
              {boards.map((board) => (
                <Link
                  to={getBoardPath(board.id)}
                  className="board-card"
                  key={board.id}
                >
                  <div className="board-card-top">
                    <span className="board-icon">▦</span>

                    {board.role && (
                      <span className={`role-pill ${board.role}`}>
                        {getRoleLabel(board.role)}
                      </span>
                    )}
                  </div>

                  <h3>{board.title}</h3>

                  <p>{board.description || t.boards.noDescription}</p>

                  <div className="board-meta">
                    <span>
                      {board.members_count} {t.boards.members}
                    </span>
                    <span>
                      {board.lists_count} {t.boards.lists}
                    </span>
                    <span>
                      {board.cards_count} {t.boards.cards}
                    </span>
                  </div>

                  <div className="board-date">
                    {t.boards.createdAt}:{" "}
                    {new Date(board.created_at).toLocaleDateString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}