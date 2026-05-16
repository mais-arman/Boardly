import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import Loader from "../../shared/components/Loader";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { isSuperAdmin } from "../../features/auth/utils/roles";

type ProtectedRouteProps = {
  requireAdmin?: boolean;
};

export default function ProtectedRoute({
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireAdmin && !isSuperAdmin(user)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}