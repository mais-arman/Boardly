import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { t } = useTranslation();
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
      setError(getApiErrorMessage(error, t("auth.loginFailed")));
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-hero">
        <div className="hero-badge">{t("auth.loginHeroBadge")}</div>
        <h1>{t("auth.loginHeroTitle")}</h1>
        <p>{t("auth.loginHeroDescription")}</p>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <span className="brand-mark">B</span>
          <div>
            <h2>{t("auth.welcomeBack")}</h2>
            <p>{t("auth.loginSubtitle")}</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
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
            placeholder={t("auth.loginPasswordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button type="submit" fullWidth isLoading={isLoggingIn}>
            {t("auth.login")}
          </Button>
        </form>

        <p className="auth-footer">
          {t("auth.noAccount")}{" "}
          <Link to={ROUTES.SIGNUP}>{t("auth.createAccount")}</Link>
        </p>
      </section>
    </main>
  );
}