import { useTranslation } from "react-i18next";
import Button from "../../../shared/components/Button";

type VerificationBannerProps = {
  bannerMessage: string;
  bannerError: string;
  isLoading: boolean;
  onResend: () => void;
};

export default function VerificationBanner({
  bannerMessage,
  bannerError,
  isLoading,
  onResend,
}: VerificationBannerProps) {
  const { t } = useTranslation();

  return (
    <div className="alert warning verification-banner">
      <div>
        <strong>{t("verification.bannerTitle")}</strong>
        <p>{t("verification.bannerDescription")}</p>

        {bannerMessage && <p>{bannerMessage}</p>}
        {bannerError && <p>{bannerError}</p>}
      </div>

      <Button
        type="button"
        variant="secondary"
        isLoading={isLoading}
        onClick={onResend}
      >
        {t("verification.resendButton")}
      </Button>
    </div>
  );
}