import { useTranslation } from "react-i18next";
import Button from "../../../shared/components/Button";
import type { User } from "../../auth/types";
import type { AdminUser, AdminUserRole } from "../types";

type AdminUsersTableProps = {
  users: AdminUser[];
  currentUser: User | null;
  onRoleChange: (user: AdminUser, role: AdminUserRole) => void;
  onDeleteUser: (user: AdminUser) => void;
};

export default function AdminUsersTable({
  users,
  currentUser,
  onRoleChange,
  onDeleteUser,
}: AdminUsersTableProps) {
  const { t } = useTranslation();

  return (
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
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;

              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.is_email_verified ? t("common.yes") : t("common.no")}
                  </td>

                  <td>
                    <select
                      value={user.role}
                      disabled={isCurrentUser}
                      onChange={(event) =>
                        onRoleChange(user, event.target.value as AdminUserRole)
                      }
                    >
                      <option value="user">{t("admin.userRole")}</option>
                      <option value="super_admin">
                        {t("admin.superAdminRole")}
                      </option>
                    </select>
                  </td>

                  <td>{new Date(user.created_at).toLocaleDateString()}</td>

                  <td>
                    <Button
                      type="button"
                      variant="danger"
                      disabled={isCurrentUser}
                      onClick={() => onDeleteUser(user)}
                    >
                      {t("common.delete")}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}