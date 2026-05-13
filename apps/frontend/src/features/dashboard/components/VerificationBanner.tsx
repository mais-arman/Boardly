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
  return (
    <div className="alert warning verification-banner">
      <div>
        <strong>Email verification required</strong>
        <p>We sent a verification email. Please verify your account.</p>

        {bannerMessage && <p>{bannerMessage}</p>}
        {bannerError && <p>{bannerError}</p>}
      </div>

      <Button
        type="button"
        variant="secondary"
        isLoading={isLoading}
        onClick={onResend}
      >
        Resend email
      </Button>
    </div>
  );
}