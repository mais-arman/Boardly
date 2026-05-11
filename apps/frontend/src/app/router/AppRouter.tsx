import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../../features/auth/pages/LoginPage";
import SignupPage from "../../features/auth/pages/SignupPage";
import VerifyEmailPage from "../../features/auth/pages/VerifyEmailPage";

function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">B</span>
          <span>Boardly</span>
        </div>

        <nav className="sidebar-nav">
          <a className="active" href="/dashboard">Dashboard</a>
          <a href="/boards">Boards</a>
        </nav>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Dashboard</h1>
          </div>
        </header>

        <div className="empty-state">
          <h2>Welcome to Boardly</h2>
        </div>
      </section>
    </main>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}