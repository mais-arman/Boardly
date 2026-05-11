import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "../../../app/constants/routes";
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
        <div className="auth-card-header">
          <span className="brand-mark">B</span>
          <div>
            <h2>Email verification</h2>
            <p>Secure your Boardly account</p>
          </div>
        </div>

        <div className={`alert ${status}`}>{message}</div>

        {status !== "loading" && (
          <Link className="primary-button full-width link-button" to={ROUTES.LOGIN}>
            Go to login
          </Link>
        )}
      </section>
    </main>
  );
}