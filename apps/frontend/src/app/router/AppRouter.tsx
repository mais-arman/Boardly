import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import SignupPage from "../../features/auth/pages/SignupPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";
import ProfilePage from "../../features/auth/pages/ProfilePage";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import BoardPage from "../../features/boards/pages/BoardPage";
import AdminDashboardPage from "../../features/admin/pages/AdminDashboardPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
      />

      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.BOARD} element={<BoardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute requireAdmin />}>
        <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}