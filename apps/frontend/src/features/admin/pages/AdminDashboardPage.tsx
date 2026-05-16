import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES, getBoardPath } from "../../../app/constants/routes";
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

const ADMIN_USERS_QUERY_KEY = ["admin", "users"];
const ADMIN_BOARDS_QUERY_KEY = ["admin", "boards"];

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<AdminBoard | null>(null);

  const usersQuery = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: getAdminUsersRequest,
  });

  const boardsQuery = useQuery({
    queryKey: ADMIN_BOARDS_QUERY_KEY,
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
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteAdminUserRequest(userId),

    onSuccess: () => {
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_BOARDS_QUERY_KEY });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: (boardId: string) => deleteAdminBoardRequest(boardId),

    onSuccess: () => {
      setBoardToDelete(null);
      queryClient.invalidateQueries({ queryKey: ADMIN_BOARDS_QUERY_KEY });
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

        <section className="admin-stats-grid">
          <article>
            <strong>{users.length}</strong>
            <span>{t("admin.users")}</span>
          </article>

          <article>
            <strong>{boards.length}</strong>
            <span>{t("admin.boards")}</span>
          </article>

          <article>
            <strong>
              {users.filter((item) => item.role === "super_admin").length}
            </strong>
            <span>{t("admin.superAdmins")}</span>
          </article>
        </section>

        <section className="admin-section">
          <div className="section-header">
            <div>
              <h2>{t("admin.users")}</h2>
              <p>{t("admin.changeRoles")}</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.user")}</th>
                  <th>{t("auth.email")}</th>
                  <th>{t("admin.verified")}</th>
                  <th>{t("profile.role")}</th>
                  <th>{t("common.created")}</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.is_email_verified ? t("common.yes") : t("common.no")}</td>

                    <td>
                      <select
                        value={item.role}
                        disabled={item.id === user?.id}
                        onChange={(event) =>
                          handleRoleChange(
                            item,
                            event.target.value as AdminUserRole
                          )
                        }
                      >
                        <option value="user">
                          {t("admin.userRole")}
                        </option>
                        <option value="super_admin">
                          {t("admin.superAdminRole")}
                        </option>
                      </select>
                    </td>

                    <td>{new Date(item.created_at).toLocaleDateString()}</td>

                    <td>
                      <Button
                        type="button"
                        variant="danger"
                        disabled={item.id === user?.id}
                        onClick={() => setUserToDelete(item)}
                      >
                        {t("common.delete")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section">
          <div className="section-header">
            <div>
              <h2>{t("admin.boards")}</h2>
              <p>{t("admin.viewBoards")}</p>
            </div>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("admin.board")}</th>
                  <th>{t("admin.owner")}</th>
                  <th>{t("common.members")}</th>
                  <th>{t("common.lists")}</th>
                  <th>{t("common.cards")}</th>
                  <th>{t("common.created")}</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {boards.map((board) => (
                  <tr key={board.id}>
                    <td>
                      <span
                        className="admin-board-color"
                        style={{ backgroundColor: board.background_color }}
                      />
                      {board.title}
                    </td>

                    <td>
                      {board.owner_name || t("admin.unknownOwner")}
                      <small>{board.owner_email}</small>
                    </td>

                    <td>{board.members_count}</td>
                    <td>{board.lists_count}</td>
                    <td>{board.cards_count}</td>
                    <td>{new Date(board.created_at).toLocaleDateString()}</td>

                    <td>
                      <div className="admin-actions">
                        <Link
                          to={getBoardPath(board.id)}
                          className="button button-secondary"
                        >
                          {t("common.open")}
                        </Link>

                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => setBoardToDelete(board)}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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