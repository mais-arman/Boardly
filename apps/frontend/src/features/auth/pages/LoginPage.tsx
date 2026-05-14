import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../hooks/useAuth";

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
    } catch (error) {
      setError(getApiErrorMessage(error, "Login failed. Please try again."));
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
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoggingIn}>
            Login
          </Button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <Link to={ROUTES.SIGNUP}>Create account</Link>
        </p>
      </section>
    </main>
  );
}