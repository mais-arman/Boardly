import type { ButtonHTMLAttributes, ReactNode } from "react";
import { t } from "../../app/constants/translations";

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
    return (
        <button
        className={`button button-${variant} ${
            fullWidth ? "full-width" : ""
        } ${className}`}
        disabled={disabled || isLoading}
        {...props}
        >
        {isLoading && <span className="button-spinner" />}
        <span>{isLoading ? t.common.pleaseWait : children}</span>
        </button>
    );
}