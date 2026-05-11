import { useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { useAuth } from "../hooks/useAuth";

type ErrorResponse = {
  message?: string;
};

export default function SignupPage() {
  const { signup, isSigningUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      await signup({ name, email, password });

      setSuccessMessage(
        "Account created successfully. Please check your email to verify your account."
      );

      setName("");
      setEmail("");
      setPassword("");
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ErrorResponse | undefined;
        setError(data?.message || "Signup failed. Please check your information.");
        return;
      }

      setError("Signup failed. Please try again.");
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
            <p>Verify your email before logging in</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {successMessage && <div className="alert success">{successMessage}</div>}

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