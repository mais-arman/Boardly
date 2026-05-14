type CardDetailsHeaderProps = {
  title: string;
  roleLabel: string;
  onClose: () => void;
};

export default function CardDetailsHeader({
  title,
  roleLabel,
  onClose,
}: CardDetailsHeaderProps) {
  return (
    <header className="trello-modal-header">
      <div>
        <p className="trello-modal-eyebrow">Card details</p>
        <h2>{title}</h2>

        <span className="viewer-role-note">
          Current access: {roleLabel}
        </span>
      </div>

      <button type="button" className="icon-button" onClick={onClose}>
        ×
      </button>
    </header>
  );
}