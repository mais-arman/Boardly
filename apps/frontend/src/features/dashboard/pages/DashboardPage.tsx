import { useState } from "react";
import { AxiosError } from "axios";
import { t } from "../../../app/constants/translations";
import Button from "../../../shared/components/Button";
import { resendVerificationEmailRequest } from "../../auth/api/authApi";
import { useAuth } from "../../auth/hooks/useAuth";

type ErrorResponse = {
    message?: string;
};

export default function DashboardPage() {
    const { user } = useAuth();

    const [isResending, setIsResending] = useState(false);
    const [bannerMessage, setBannerMessage] = useState("");
    const [bannerError, setBannerError] = useState("");

    async function handleResendVerification() {
        setIsResending(true);
        setBannerMessage("");
        setBannerError("");

        try {
        await resendVerificationEmailRequest();
        setBannerMessage(t.verification.resendSuccess);
        } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const data = error.response?.data as ErrorResponse | undefined;
            setBannerError(data?.message || t.verification.resendFailed);
        } else {
            setBannerError(t.verification.resendFailed);
        }
        } finally {
        setIsResending(false);
        }
    }

    return (
        <main className="dashboard-shell">
        <aside className="sidebar">
            <div className="brand">
            <span className="brand-mark">B</span>
            <div>
                <span>{t.dashboard.appName}</span>
                <small>{t.dashboard.appSubtitle}</small>
            </div>
            </div>
        </aside>

        <section className="dashboard-content">
            {!user?.is_email_verified && (
            <div className="alert warning verification-banner">
                <div>
                <strong>{t.verification.bannerTitle}</strong>
                <p>{t.verification.bannerDescription}</p>
                {bannerMessage && <p>{bannerMessage}</p>}
                {bannerError && <p>{bannerError}</p>}
                </div>

                <Button
                type="button"
                variant="secondary"
                isLoading={isResending}
                onClick={handleResendVerification}
                >
                {t.verification.resendButton}
                </Button>
            </div>
            )}

            <header className="dashboard-header">
            <div>
                <p className="eyebrow">{t.dashboard.eyebrow}</p>
                <h1>
                {t.dashboard.welcome}, {user?.name || t.dashboard.fallbackUser}
                </h1>
            </div>
            </header>
        </section>
        </main>
    );
}