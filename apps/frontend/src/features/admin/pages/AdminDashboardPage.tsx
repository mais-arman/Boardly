import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "../../../app/constants/routes";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import Button from "../../../shared/components/Button";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useDebounce } from "../../../shared/hooks/useDebounce";
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
import type { SortOrder } from "../../../shared/pagination";

function getTotalPages(totalPages: number | undefined) {
  return Math.max(1, totalPages || 1);
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [error, setError] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [boardSearch, setBoardSearch] = useState("");

  const debouncedUserSearch = useDebounce(userSearch);
  const debouncedBoardSearch = useDebounce(boardSearch);

  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(5);
  const [usersSortBy, setUsersSortBy] = useState("created_at");
  const [usersSortOrder, setUsersSortOrder] = useState<SortOrder>("desc");

  const [boardsPage, setBoardsPage] = useState(1);
  const [boardsLimit, setBoardsLimit] = useState(5);
  const [boardsSortBy, setBoardsSortBy] = useState("created_at");
  const [boardsSortOrder, setBoardsSortOrder] = useState<SortOrder>("desc");

  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [boardToDelete, setBoardToDelete] = useState<AdminBoard | null>(null);

  const usersParams = useMemo(
    () => ({
      page: usersPage,
      limit: usersLimit,
      search: debouncedUserSearch,
      sortBy: usersSortBy,
      order: usersSortOrder,
    }),
    [usersPage, usersLimit, debouncedUserSearch, usersSortBy, usersSortOrder]
  );

  const boardsParams = useMemo(
    () => ({
      page: boardsPage,
      limit: boardsLimit,
      search: debouncedBoardSearch,
      sortBy: boardsSortBy,
      order: boardsSortOrder,
    }),
    [boardsPage, boardsLimit, debouncedBoardSearch, boardsSortBy, boardsSortOrder]
  );

  const usersQuery = useQuery({
    queryKey: [...QUERY_KEYS.ADMIN.USERS, usersParams],
    queryFn: () => getAdminUsersRequest(usersParams),
    placeholderData: (previousData) => previousData,
  });

  const boardsQuery = useQuery({
    queryKey: [...QUERY_KEYS.ADMIN.BOARDS, boardsParams],
    queryFn: () => getAdminBoardsRequest(boardsParams),
    placeholderData: (previousData) => previousData,
  });

  const usersData = usersQuery.data;
  const boardsData = boardsQuery.data;

  const users = usersData?.items || [];
  const boards = boardsData?.items || [];

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

  function handleUsersSort(key: string) {
    if (key === usersSortBy) {
      setUsersSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setUsersSortBy(key);
    setUsersSortOrder("asc");
    setUsersPage(1);
  }

  function handleBoardsSort(key: string) {
    if (key === boardsSortBy) {
      setBoardsSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setBoardsSortBy(key);
    setBoardsSortOrder("asc");
    setBoardsPage(1);
  }

  function handleUsersLimitChange(limit: number) {
    setUsersLimit(limit);
    setUsersPage(1);
  }

  function handleBoardsLimitChange(limit: number) {
    setBoardsLimit(limit);
    setBoardsPage(1);
  }

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

        {error && <div className="alert error admin-alert">{error}</div>}

        <AdminStats
          usersTotal={usersData?.total || 0}
          boardsTotal={boardsData?.total || 0}
          superAdminsCount={
            users.filter((adminUser) => adminUser.role === "super_admin").length
          }
        />

        <AdminUsersTable
          users={users}
          currentUser={user}
          isLoading={usersQuery.isLoading}
          searchValue={userSearch}
          onSearchChange={(value) => {
            setUserSearch(value);
            setUsersPage(1);
          }}
          page={usersData?.page || usersPage}
          limit={usersData?.limit || usersLimit}
          total={usersData?.total || 0}
          totalPages={getTotalPages(usersData?.total_pages)}
          onPageChange={setUsersPage}
          onLimitChange={handleUsersLimitChange}
          sortBy={usersSortBy}
          sortOrder={usersSortOrder}
          onSort={handleUsersSort}
          onRoleChange={handleRoleChange}
          onDeleteUser={setUserToDelete}
        />

        <AdminBoardsTable
          boards={boards}
          isLoading={boardsQuery.isLoading}
          searchValue={boardSearch}
          onSearchChange={(value) => {
            setBoardSearch(value);
            setBoardsPage(1);
          }}
          page={boardsData?.page || boardsPage}
          limit={boardsData?.limit || boardsLimit}
          total={boardsData?.total || 0}
          totalPages={getTotalPages(boardsData?.total_pages)}
          onPageChange={setBoardsPage}
          onLimitChange={handleBoardsLimitChange}
          sortBy={boardsSortBy}
          sortOrder={boardsSortOrder}
          onSort={handleBoardsSort}
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