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
  cancelLabel = "Cancel",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="confirm-backdrop">
      <section className="confirm-modal">
        <div className="confirm-icon danger">!</div>

        <h2>{title}</h2>
        <p>{description}</p>

        <div className="confirm-actions">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
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