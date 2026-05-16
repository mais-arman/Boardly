import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

function createInputId(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export default function Input({ label, id, error, ...props }: InputProps) {
  const inputId = id || createInputId(label);

  return (
    <div className="field-group">
      <label htmlFor={inputId}>{label}</label>

      <input id={inputId} aria-invalid={Boolean(error)} {...props} />

      {error && <small className="field-error">{error}</small>}
    </div>
  );
}