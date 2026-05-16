import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import { verifyEmailRequest } from "../api/authApi";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const hasVerifiedRef = useRef(false);

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState(() => t("verification.loading"));

  useEffect(() => {
    async function verifyEmail() {
      if (hasVerifiedRef.current) {
        return;
      }

      hasVerifiedRef.current = true;

      if (!token) {
        setStatus("error");
        setMessage(t("verification.missingToken"));
        return;
      }

      try {
        await verifyEmailRequest(token);
        setStatus("success");
        setMessage(t("verification.success"));
      } catch (error) {
        setStatus("error");
        setMessage(getApiErrorMessage(error, t("verification.failed")));
      }
    }

    verifyEmail();
  }, [token, t]);

  return (
    <main className="auth-layout single">
      <section className="auth-card verification-card">
        <div className={`verification-icon ${status}`}>
          {status === "success" ? "✓" : status === "error" ? "!" : "…"}
        </div>

        <div className="verification-content">
          <h2>{t("verification.title")}</h2>
          <p>{message}</p>
        </div>

        {status !== "loading" && (
          <Link to={ROUTES.DASHBOARD} className="button-link">
            <Button type="button" fullWidth>
              {t("common.goToDashboard")}
            </Button>
          </Link>
        )}
      </section>
    </main>
  );
}