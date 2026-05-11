import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="screen-center">
        <div className="loader-card">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}