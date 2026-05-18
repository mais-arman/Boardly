import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { ROUTES } from "../../../app/constants/routes";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Button from "../../../shared/components/Button";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { resendVerificationEmailRequest } from "../../auth/api/authApi";
import { useAuth } from "../../auth/hooks/useAuth";
import MyInvitationsPanel from "../components/invitations/MyInvitationsPanel";
import { useDashboardRealtime } from "../hooks/useDashboardRealtime";
import { BOARD_COLORS, useDashboardBoards } from "../hooks/useDashboardBoards";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import VerificationBanner from "../components/VerificationBanner";
import BoardsSection from "../components/boards/BoardsSection";
import BoardFormPanel from "../components/boards/BoardFormPanel";

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

  useDashboardRealtime();

  const dashboardBoards = useDashboardBoards();
  const { boards, isLoading, isError, state, actions, mutations } =
    dashboardBoards;

  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerError, setBannerError] = useState("");

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

  async function handleLogout() {
    await logout();

    navigate(ROUTES.LOGIN, {
      replace: true,
    });
  }

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

          <Button type="button" onClick={actions.openCreateBoard}>
            {t("dashboard.createBoard")}
          </Button>
        </header>

        {isError && (
          <div className="alert error">
            {t("errors.failedLoadBoards", "Failed to load boards.")}
          </div>
        )}

        {state.formError && <div className="alert error">{state.formError}</div>}

        <MyInvitationsPanel onError={actions.setFormError} />

        {state.isBoardFormOpen && (
          <BoardFormPanel
            editingBoard={state.editingBoard}
            boardTitle={state.boardTitle}
            boardDescription={state.boardDescription}
            boardColor={state.boardColor}
            boardColors={BOARD_COLORS}
            isSaving={mutations.isSavingBoard}
            onTitleChange={actions.setBoardTitle}
            onDescriptionChange={actions.setBoardDescription}
            onColorChange={actions.setBoardColor}
            onSubmit={actions.handleBoardSubmit}
            onCancel={actions.closeBoardForm}
          />
        )}

        <BoardsSection
          boards={boards}
          fallbackColor={BOARD_COLORS[0]}
          isLoading={isLoading}
          onCreateBoard={actions.openCreateBoard}
          onEditBoard={actions.openEditBoard}
          onDeleteBoard={actions.setDeletingBoard}
        />
      </section>

      {state.deletingBoard && (
        <ConfirmModal
          title={t("boards.deleteBoardQuestion")}
          description={t("admin.deleteBoardDescription", {
            title: state.deletingBoard.title,
          })}
          confirmLabel={t("boards.deleteBoard")}
          isLoading={mutations.deleteBoardMutation.isPending}
          onCancel={() => actions.setDeletingBoard(null)}
          onConfirm={actions.handleDeleteBoard}
        />
      )}
    </main>
  );
}