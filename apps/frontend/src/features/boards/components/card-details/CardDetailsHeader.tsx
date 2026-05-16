import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <header className="trello-modal-header">
      <div>
        <p className="trello-modal-eyebrow">{t("boards.cardDetails")}</p>
        <h2>{title}</h2>

        <span className="viewer-role-note">
          {t("boards.currentAccess", {
            role: t(`roles.${roleLabel}`),
          })}
        </span>
      </div>

      <button type="button" className="icon-button" onClick={onClose}>
        ×
      </button>
    </header>
  );
}