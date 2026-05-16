import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { deleteAccountRequest, updateProfileRequest } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const AUTH_QUERY_KEY = ["auth", "me"];

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: updateProfileRequest,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, updatedUser);
      setSuccessMessage(t("profile.updateSuccess"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccountRequest,
    onSuccess: async () => {
      await logout();
      navigate(ROUTES.SIGNUP, { replace: true });
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (name.trim().length < 2) {
      setError(t("profile.nameTooShort"));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
      });
    } catch (error) {
      setError(getApiErrorMessage(error, t("profile.updateFailed")));
    }
  }

  async function handleDeleteAccount() {
    setError("");

    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      setError(getApiErrorMessage(error, t("profile.deleteFailed")));
      setIsDeleteOpen(false);
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <Link to={ROUTES.DASHBOARD} className="back-link">
          ← {t("profile.backToDashboard")}
        </Link>

        <div className="profile-header">
          <span className="avatar large">
            {user?.name?.charAt(0).toUpperCase()}
          </span>

          <div>
            <p className="eyebrow">{t("profile.title")}</p>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {successMessage && <div className="alert success">{successMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label={t("auth.name")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Input label={t("auth.email")} value={user?.email || ""} disabled />

          <Input label={t("profile.role")} value={user?.role || ""} disabled />

          <Input
            label={t("profile.emailVerified")}
            value={
              user?.is_email_verified
                ? t("profile.verified")
                : t("profile.notVerified")
            }
            disabled
          />

          <Button type="submit" isLoading={updateMutation.isPending}>
            {t("profile.saveProfile")}
          </Button>
        </form>

        <div className="danger-zone">
          <h2>{t("profile.dangerZone")}</h2>
          <p>{t("profile.deleteAccountDescription")}</p>

          <Button
            type="button"
            variant="danger"
            onClick={() => setIsDeleteOpen(true)}
          >
            {t("profile.deleteAccount")}
          </Button>
        </div>
      </section>

      {isDeleteOpen && (
        <ConfirmModal
          title={t("profile.deleteAccountQuestion")}
          description={t("profile.deleteAccountConfirmDescription")}
          confirmLabel={t("profile.deleteAccount")}
          isLoading={deleteMutation.isPending}
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </main>
  );
}