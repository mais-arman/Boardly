import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await signup({ name, email, password });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      setError(getApiErrorMessage(error, "Signup failed. Please try again."));
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="hero-badge">Start Organized</div>
        <h1>Create your Boardly workspace.</h1>
        <p>
          Build boards, manage roles, assign cards, and collaborate with your
          team.
        </p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span className="brand-mark">B</span>
          <div>
            <h2>Create account</h2>
            <p>You can start now and verify your email later</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          <Button type="submit" fullWidth isLoading={isSigningUp}>
            Create account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to={ROUTES.LOGIN}>Login</Link>
        </p>
      </section>
    </main>
  );
}