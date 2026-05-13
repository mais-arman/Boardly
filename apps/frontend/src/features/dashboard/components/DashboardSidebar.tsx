import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import { isSuperAdmin } from "../../auth/utils/roles";
import type { User } from "../../auth/types";

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
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">B</span>

        <div>
          <span>Boardly</span>
          <small>Kanban Workspace</small>
        </div>
      </div>

      <Link to={ROUTES.PROFILE} className="sidebar-user clickable">
        <span className="avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </span>

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
            Admin panel
          </Button>
        )}

        <Button
          type="button"
          variant="danger"
          fullWidth
          isLoading={isLoggingOut}
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}