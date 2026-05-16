import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "../../../app/constants/routes";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import Button from "../../../shared/components/Button";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Loader from "../../../shared/components/Loader";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../../auth/hooks/useAuth";
import type { AdminBoard, AdminUser, AdminUserRole } from "../types";
import {
  deleteAdminBoardRequest,
  deleteAdminUserRequest,
  getAdminBoardsRequest,
  getAdminUsersRequest,
  updateAdminUserRoleRequest,
} from "../api/adminApi";
import AdminStats from "../components/AdminStats";
import AdminUsersTable from "../components/AdminUsersTable";
import AdminBoardsTable from "../components/AdminBoardsTable";

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<AdminBoard | null>(null);

  const usersQuery = useQuery({
    queryKey: QUERY_KEYS.ADMIN.USERS,
    queryFn: getAdminUsersRequest,
  });

  const boardsQuery = useQuery({
    queryKey: QUERY_KEYS.ADMIN.BOARDS,
    queryFn: getAdminBoardsRequest,
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: AdminUserRole;
    }) => updateAdminUserRoleRequest(userId, { role }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN.USERS,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteAdminUserRequest(userId),

    onSuccess: () => {
      setUserToDelete(null);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN.USERS,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN.BOARDS,
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => deleteAdminBoardRequest(boardId),

    onSuccess: () => {
      setBoardToDelete(null);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ADMIN.BOARDS,
      });
    },
  });

  async function handleRoleChange(targetUser: AdminUser, role: AdminUserRole) {
    setError("");

    try {
      await updateRoleMutation.mutateAsync({
        userId: targetUser.id,
        role,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, t("admin.updateRoleFailed")));
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;

    setError("");

    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
    } catch (error) {
      setError(getApiErrorMessage(error, t("admin.deleteUserFailed")));
      setUserToDelete(null);
    }
  }

  async function handleDeleteBoard() {
    if (!boardToDelete) return;

    setError("");

    try {
      await deleteBoardMutation.mutateAsync(boardToDelete.id);
    } catch (error) {
      setError(getApiErrorMessage(error, t("admin.deleteBoardFailed")));
      setBoardToDelete(null);
    }
  }

  if (usersQuery.isLoading || boardsQuery.isLoading) {
    return <Loader />;
  }

  const users = usersQuery.data || [];
  const boards = boardsQuery.data || [];

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="eyebrow">{t("admin.systemAdministration")}</p>
            <h1>{t("admin.title")}</h1>
            <p>{t("admin.subtitle")}</p>
          </div>

          <Link to={ROUTES.DASHBOARD}>
            <Button type="button" variant="secondary">
              {t("admin.backToWorkspace")}
            </Button>
          </Link>
        </header>

        {error && <div className="alert error">{error}</div>}

        <AdminStats users={users} boards={boards} />

        <AdminUsersTable
          users={users}
          currentUser={user}
          onRoleChange={handleRoleChange}
          onDeleteUser={setUserToDelete}
        />

        <AdminBoardsTable
          boards={boards}
          onDeleteBoard={setBoardToDelete}
        />
      </section>

      {userToDelete && (
        <ConfirmModal
          title={t("admin.deleteUserQuestion")}
          description={t("admin.deleteUserDescription", {
            email: userToDelete.email,
          })}
          confirmLabel={t("admin.deleteUser")}
          isLoading={deleteUserMutation.isPending}
          onCancel={() => setUserToDelete(null)}
          onConfirm={handleDeleteUser}
        />
      )}

      {boardToDelete && (
        <ConfirmModal
          title={t("admin.deleteBoardQuestion")}
          description={t("admin.deleteBoardDescription", {
            title: boardToDelete.title,
          })}
          confirmLabel={t("admin.deleteBoard")}
          isLoading={deleteBoardMutation.isPending}
          onCancel={() => setBoardToDelete(null)}
          onConfirm={handleDeleteBoard}
        />
      )}
    </main>
  );
}