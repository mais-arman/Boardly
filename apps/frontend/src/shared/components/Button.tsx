import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useTranslation } from "react-i18next";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
  variant?: ButtonVariant;
};

export default function Button({
  children,
  fullWidth = false,
  isLoading = false,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      className={`button button-${variant} ${
        fullWidth ? "full-width" : ""
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="button-spinner" />}
      <span>{isLoading ? t("common.pleaseWait") : children}</span>
    </button>
  );
}