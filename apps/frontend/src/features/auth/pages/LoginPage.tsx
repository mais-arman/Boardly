import { useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import { useAuth } from "../hooks/useAuth";

type ErrorResponse = {
  message?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate(ROUTES.DASHBOARD);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ErrorResponse | undefined;
        setError(data?.message || "Login failed. Please check your credentials.");
        return;
      }

      setError("Login failed. Please try again.");
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="hero-badge">Kanban Collaboration</div>
        <h1>Manage work clearly with Boardly.</h1>
        <p>
          Organize boards, track cards, invite collaborators, and keep your team
          aligned.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span className="brand-mark">B</span>
          <div>
            <h2>Welcome back</h2>
            <p>Login to your workspace</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button className="primary-button full-width" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to={ROUTES.SIGNUP}>Create account</Link>
        </p>
      </section>
    </main>
  );
}