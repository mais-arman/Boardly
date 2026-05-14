import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Input from "../../../shared/components/Input";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { deleteAccountRequest, updateProfileRequest } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

const AUTH_QUERY_KEY = ["auth", "me"];

export default function ProfilePage() {
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
      setSuccessMessage("Profile updated successfully.");
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
      setError("Name must be at least 2 characters.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        name: name.trim(),
      });
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to update profile."));
    }
  }

  async function handleDeleteAccount() {
    setError("");

    try {
      await deleteMutation.mutateAsync();
    } catch (error) {
      setError(getApiErrorMessage(error, "Failed to delete account."));
      setIsDeleteOpen(false);
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <Link to={ROUTES.DASHBOARD} className="back-link">
          ← Back to dashboard
        </Link>

        <div className="profile-header">
          <span className="avatar large">
            {user?.name?.charAt(0).toUpperCase()}
          </span>

          <div>
            <p className="eyebrow">Profile</p>
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}
        {successMessage && <div className="alert success">{successMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Input label="Email" value={user?.email || ""} disabled />

          <Input
            label="Role"
            value={user?.role || ""}
            disabled
          />

          <Input
            label="Email verified"
            value={user?.is_email_verified ? "Verified" : "Not verified"}
            disabled
          />

          <Button type="submit" isLoading={updateMutation.isPending}>
            Save profile
          </Button>
        </form>

        <div className="danger-zone">
          <h2>Danger zone</h2>
          <p>
            Deleting your account will permanently remove your account and owned
            boards.
          </p>

          <Button
            type="button"
            variant="danger"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete account
          </Button>
        </div>
      </section>

      {isDeleteOpen && (
        <ConfirmModal
          title="Delete account?"
          description="This action cannot be undone. Your account and owned boards will be permanently removed."
          confirmLabel="Delete account"
          isLoading={deleteMutation.isPending}
          onCancel={() => setIsDeleteOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}
    </main>
  );
}