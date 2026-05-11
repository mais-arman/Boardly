import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import Loader from "../../shared/components/Loader";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}