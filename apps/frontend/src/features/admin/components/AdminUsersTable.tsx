import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../shared/components/Button";
import type { User } from "../../auth/types";
import type { AdminUser, AdminUserRole } from "../types";
import type { SortOrder } from "../../../shared/pagination";
import DataTable, { type DataTableColumn } from "./DataTable";

type AdminUsersTableProps = {
  users: AdminUser[];
  currentUser: User | null;
  isLoading: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (key: string) => void;
  onRoleChange: (user: AdminUser, role: AdminUserRole) => void;
  onDeleteUser: (user: AdminUser) => void;
};

export default function AdminUsersTable({
  users,
  currentUser,
  isLoading,
  searchValue,
  onSearchChange,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder,
  onSort,
  onRoleChange,
  onDeleteUser,
}: AdminUsersTableProps) {
  const { t } = useTranslation();

  const columns = useMemo<DataTableColumn<AdminUser>[]>(
    () => [
      {
        key: "name",
        header: t("admin.user"),
        sortable: true,
        render: (user) => user.name,
      },
      {
        key: "email",
        header: t("auth.email"),
        sortable: true,
        render: (user) => user.email,
      },
      {
        key: "is_email_verified",
        header: t("admin.verified"),
        sortable: true,
        render: (user) =>
          user.is_email_verified ? t("common.yes") : t("common.no"),
      },
      {
        key: "role",
        header: t("profile.role"),
        sortable: true,
        render: (user) => {
          const isCurrentUser = user.id === currentUser?.id;

          return (
            <select
              value={user.role}
              disabled={isCurrentUser}
              onChange={(event) =>
                onRoleChange(user, event.target.value as AdminUserRole)
              }
            >
              <option value="user">{t("admin.userRole")}</option>
              <option value="super_admin">{t("admin.superAdminRole")}</option>
            </select>
          );
        },
      },
      {
        key: "created_at",
        header: t("common.created"),
        sortable: true,
        render: (user) => new Date(user.created_at).toLocaleDateString(),
      },
      {
        key: "actions",
        header: "",
        render: (user) => {
          const isCurrentUser = user.id === currentUser?.id;

          return (
            <Button
              type="button"
              variant="danger"
              disabled={isCurrentUser}
              onClick={() => onDeleteUser(user)}
            >
              {t("common.delete")}
            </Button>
          );
        },
      },
    ],
    [currentUser?.id, onDeleteUser, onRoleChange, t]
  );

  return (
    <section className="admin-section">
      <div className="section-header">
        <div>
          <h2>{t("admin.users")}</h2>
          <p>{t("admin.changeRoles")}</p>
        </div>
      </div>

      <DataTable
        data={users}
        columns={columns}
        getRowKey={(user) => user.id}
        isLoading={isLoading}
        emptyMessage={t("admin.noUsers")}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        pagination={{
          page,
          limit,
          total,
          totalPages,
        }}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        labels={{
          search: t("admin.searchUsers"),
          rowsPerPage: t("common.rowsPerPage"),
          pageOf: (currentPage, pages) =>
            t("common.pageOf", {
              page: currentPage,
              totalPages: pages,
            }),
          previous: t("common.previous"),
          next: t("common.next"),
        }}
      />
    </section>
  );
}