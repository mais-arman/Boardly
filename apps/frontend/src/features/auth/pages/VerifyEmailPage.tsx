import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import { t } from "../../../app/constants/translations";
import Button from "../../../shared/components/Button";
import { verifyEmailRequest } from "../api/authApi";

type VerificationStatus = "loading" | "success" | "error";

type ErrorResponse = {
  message?: string;
};

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const hasVerifiedRef = useRef(false);

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState<string>(t.verification.loading);

  useEffect(() => {
    async function verifyEmail() {
      if (hasVerifiedRef.current) {
        return;
      }

      hasVerifiedRef.current = true;

      if (!token) {
        setStatus("error");
        setMessage(t.verification.missingToken);
        return;
      }

      try {
        await verifyEmailRequest(token);
        setStatus("success");
        setMessage(t.verification.success);
      } catch (error: unknown) {
        setStatus("error");

        if (error instanceof AxiosError) {
          const data = error.response?.data as ErrorResponse | undefined;
          setMessage(data?.message || t.verification.failed);
          return;
        }

        setMessage(t.verification.tryAgain);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="auth-layout single">
      <section className="auth-card verification-card">
        <div className={`verification-icon ${status}`}>
          {status === "success" ? "✓" : status === "error" ? "!" : "…"}
        </div>

        <div className="verification-content">
          <h2>{t.verification.title}</h2>
          <p>{message}</p>
        </div>

        {status !== "loading" && (
          <Link to={ROUTES.DASHBOARD} className="button-link">
            <Button type="button" fullWidth>
              {t.common.goToDashboard}
            </Button>
          </Link>
        )}
      </section>
    </main>
  );
}