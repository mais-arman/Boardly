import { useTranslation } from "react-i18next";
import Button from "./Button";

type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <div className="confirm-backdrop" role="presentation">
      <section className="confirm-modal" role="dialog" aria-modal="true">
        <div className="confirm-icon danger">!</div>

        <h2>{title}</h2>
        <p>{description}</p>

        <div className="confirm-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel || t("common.cancel")}
          </Button>

          <Button
            type="button"
            variant="danger"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}