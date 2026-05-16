import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

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
      await login({
        email: email.trim(),
        password,
      });

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, t("auth.loginFailed")));
    }
  }

  return (
    <AuthLayout
      badge={t("auth.loginHeroBadge")}
      title={t("auth.loginHeroTitle")}
      description={t("auth.loginHeroDescription")}
      cardTitle={t("auth.welcomeBack")}
      cardSubtitle={t("auth.loginSubtitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link to={ROUTES.SIGNUP}>{t("auth.createAccount")}</Link>
        </>
      }
    >
      {error && <div className="alert error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          id="login-email"
          label={t("auth.email")}
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Input
          id="login-password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.loginPasswordPlaceholder")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <Button type="submit" fullWidth isLoading={isLoggingIn}>
          {t("auth.login")}
        </Button>
      </form>
    </AuthLayout>
  );
}