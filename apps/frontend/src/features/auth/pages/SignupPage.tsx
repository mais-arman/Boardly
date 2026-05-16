import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AUTH_VALIDATION } from "../../../app/constants/authValidation";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < AUTH_VALIDATION.NAME_MIN_LENGTH) {
      setError(t("profile.nameTooShort"));
      return;
    }

    if (password.length < AUTH_VALIDATION.PASSWORD_MIN_LENGTH) {
      setError(t("errors.VALIDATION_ERROR"));
      return;
    }

    hasSubmittedRef.current = true;
    setError("");

    try {
      await signup({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, t("auth.signupFailed")));
      hasSubmittedRef.current = false;
    }
  }

  return (
    <AuthLayout
      badge={t("auth.signupHeroBadge")}
      title={t("auth.signupHeroTitle")}
      description={t("auth.signupHeroDescription")}
      cardTitle={t("auth.signup")}
      cardSubtitle={t("auth.signupSubtitle")}
      footer={
        <>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link to={ROUTES.LOGIN}>{t("auth.login")}</Link>
        </>
      }
    >
      {error && <div className="alert error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          id="signup-name"
          label={t("auth.name")}
          type="text"
          placeholder={t("auth.namePlaceholder")}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          minLength={AUTH_VALIDATION.NAME_MIN_LENGTH}
          maxLength={AUTH_VALIDATION.NAME_MAX_LENGTH}
          required
        />

        <Input
          id="signup-email"
          label={t("auth.email")}
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <Input
          id="signup-password"
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={AUTH_VALIDATION.PASSWORD_MIN_LENGTH}
          maxLength={AUTH_VALIDATION.PASSWORD_MAX_LENGTH}
          required
        />

        <Button type="submit" fullWidth isLoading={isSigningUp}>
          {t("auth.createAccount")}
        </Button>
      </form>
    </AuthLayout>
  );
}