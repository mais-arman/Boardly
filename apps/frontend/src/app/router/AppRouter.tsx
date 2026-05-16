import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import Loader from "../../shared/components/Loader";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("../../features/auth/pages/SignupPage"));
const VerifyEmailPage = lazy(
  () => import("../../features/auth/pages/VerifyEmailPage")
);
const ProfilePage = lazy(() => import("../../features/auth/pages/ProfilePage"));
const DashboardPage = lazy(
  () => import("../../features/dashboard/pages/DashboardPage")
);
const BoardPage = lazy(() => import("../../features/boards/pages/BoardPage"));
const AdminDashboardPage = lazy(
  () => import("../../features/admin/pages/AdminDashboardPage")
);

export default function AppRouter() {
  return (
    <Suspense fallback={<Loader />}>
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
    </Suspense>
  );
}