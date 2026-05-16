import { useTranslation } from "react-i18next";
import type { AdminBoard, AdminUser } from "../types";

type AdminStatsProps = {
  users: AdminUser[];
  boards: AdminBoard[];
};

export default function AdminStats({ users, boards }: AdminStatsProps) {
  const { t } = useTranslation();

  const superAdminsCount = users.filter(
    (user) => user.role === "super_admin"
  ).length;

  return (
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
        <strong>{superAdminsCount}</strong>
        <span>{t("admin.superAdmins")}</span>
      </article>
    </section>
  );
}