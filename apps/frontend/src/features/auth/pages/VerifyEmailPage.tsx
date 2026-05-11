import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import { verifyEmailRequest } from "../api/authApi";

type VerificationStatus = "loading" | "success" | "error";

type ErrorResponse = {
  message?: string;
};

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        await verifyEmailRequest(token);
        setStatus("success");
        setMessage("Your email has been verified successfully.");
      } catch (error: unknown) {
        setStatus("error");

        if (error instanceof AxiosError) {
          const data = error.response?.data as ErrorResponse | undefined;

          setMessage(
            data?.message ||
              "Verification failed. The link may be invalid or expired."
          );
          return;
        }

        setMessage("Verification failed. Please try again.");
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
          <h2>Email verification</h2>
          <p>{message}</p>
        </div>

        {status !== "loading" && (
          <Link to={ROUTES.LOGIN} className="button-link">
            <Button type="button" fullWidth>
              Go to login
            </Button>
          </Link>
        )}
      </section>
    </main>
  );
}