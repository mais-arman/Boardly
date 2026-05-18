import { useTranslation } from "react-i18next";

type AdminStatsProps = {
  usersTotal: number;
  boardsTotal: number;
  superAdminsCount: number;
};

export default function AdminStats({
  usersTotal,
  boardsTotal,
  superAdminsCount,
}: AdminStatsProps) {
  const { t } = useTranslation();

  return (
    <section className="admin-stats-grid">
      <article>
        <strong>{usersTotal}</strong>
        <span>{t("admin.users")}</span>
      </article>

      <article>
        <strong>{boardsTotal}</strong>
        <span>{t("admin.boards")}</span>
      </article>

      <article>
        <strong>{superAdminsCount}</strong>
        <span>{t("admin.superAdmins")}</span>
      </article>
    </section>
  );
}