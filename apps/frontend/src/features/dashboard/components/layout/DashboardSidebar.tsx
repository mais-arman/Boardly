import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../../app/constants/routes";
import type { User } from "../../../auth/types";
import LanguageSwitcher from "../../../../shared/components/LanguageSwitcher";
import { isSuperAdmin } from "../../../auth/utils/roles";
import Button from "../../../../shared/components/Button";


type DashboardSidebarProps = {
  user: User | null;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
};

export default function DashboardSidebar({
  user,
  isLoggingOut,
  onLogout,
}: DashboardSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">B</span>

        <div>
          <span>Boardly</span>
          <small>{t("dashboard.appSubtitle")}</small>
        </div>
      </div>

      <LanguageSwitcher />

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
            {t("dashboard.adminPanel")}
          </Button>
        )}

        <Button
          type="button"
          variant="danger"
          fullWidth
          isLoading={isLoggingOut}
          onClick={onLogout}
        >
          {t("dashboard.logout")}
        </Button>
      </div>
    </aside>
  );
}