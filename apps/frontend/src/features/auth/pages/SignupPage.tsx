import { useState } from "react";
import type { FormEvent } from "react";
import { AxiosError } from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import { t } from "../../../app/constants/translations";
import { UI } from "../../../app/constants/ui";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { useAuth } from "../hooks/useAuth";

type ErrorResponse = {
  message?: string;
};

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
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const data = error.response?.data as ErrorResponse | undefined;
        setError(data?.message || t.auth.signupFailed);
        return;
      }

      setError(t.auth.signupTryAgain);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="hero-badge">{t.auth.signupHeroBadge}</div>
        <h1>{t.auth.signupHeroTitle}</h1>
        <p>{t.auth.signupHeroDescription}</p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span className="brand-mark">B</span>
          <div>
            <h2>{t.auth.signupTitle}</h2>
            <p>{t.auth.signupSubtitle}</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label={t.auth.name}
            type="text"
            placeholder={t.auth.namePlaceholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Input
            label={t.auth.email}
            type="email"
            placeholder={t.auth.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            label={t.auth.password}
            type="password"
            placeholder={t.auth.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={UI.PASSWORD_MIN_LENGTH}
            required
          />

          <Button type="submit" fullWidth isLoading={isSigningUp}>
            {t.auth.signup}
          </Button>
        </form>

        <p className="auth-footer">
          {t.auth.alreadyHaveAccount}{" "}
          <Link to={ROUTES.LOGIN}>{t.auth.login}</Link>
        </p>
      </section>
    </main>
  );
}