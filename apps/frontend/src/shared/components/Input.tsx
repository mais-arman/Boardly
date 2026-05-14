import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

export default function Input({ label, id, error, ...props }: InputProps) {
    const inputId = id || label.toLowerCase().replaceAll(" ", "-");

    return (
        <div className="field-group">
        <label htmlFor={inputId}>{label}</label>
        <input id={inputId} aria-invalid={Boolean(error)} {...props} />
        {error && <small className="field-error">{error}</small>}
        </div>
    );
}