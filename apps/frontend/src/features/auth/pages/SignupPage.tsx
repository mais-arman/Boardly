import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../hooks/useAuth";

export default function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuth();

  const hasSubmittedRef = useRef(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasSubmittedRef.current || isSigningUp) {
      return;
    }

    hasSubmittedRef.current = true;
    setError("");

    try {
      await signup({ name, email, password });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      setError(getApiErrorMessage(error, t("auth.signupFailed")));
      hasSubmittedRef.current = false;
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="hero-badge">{t("auth.signupHeroBadge")}</div>
        <h1>{t("auth.signupHeroTitle")}</h1>
        <p>{t("auth.signupHeroDescription")}</p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span className="brand-mark">B</span>
          <div>
            <h2>{t("auth.signup")}</h2>
            <p>{t("auth.signupSubtitle")}</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label={t("auth.name")}
            type="text"
            placeholder={t("auth.namePlaceholder")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Input
            label={t("auth.email")}
            type="email"
            placeholder={t("auth.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <Input
            label={t("auth.password")}
            type="password"
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          <Button type="submit" fullWidth isLoading={isSigningUp}>
            {t("auth.createAccount")}
          </Button>
        </form>

        <p className="auth-footer">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to={ROUTES.LOGIN}>{t("auth.login")}</Link>
        </p>
      </section>
    </main>
  );
}