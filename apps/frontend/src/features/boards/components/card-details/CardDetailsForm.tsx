import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";
import Input from "../../../../shared/components/Input";
import type { Card } from "../../types";

type CardDetailsFormProps = {
  card: Card;
  title: string;
  description: string;
  dueDate: string;
  canEdit: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onSave: () => void;
  onDelete: (card: Card) => void;
};

export default function CardDetailsForm({
  card,
  title,
  description,
  dueDate,
  canEdit,
  isDeleting,
  isSaving,
  onTitleChange,
  onDescriptionChange,
  onDueDateChange,
  onSave,
  onDelete,
}: CardDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <section className="trello-section">
      <Input
        label={t("boards.title")}
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        disabled={!canEdit}
        required
      />

      <div className="field-group">
        <label htmlFor="card-description">{t("boards.description")}</label>

        <textarea
          id="card-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          disabled={!canEdit}
          placeholder={t("card.descriptionPlaceholder")}
        />
      </div>

      <Input
        label={t("boards.dueDate")}
        type="date"
        value={dueDate}
        onChange={(event) => onDueDateChange(event.target.value)}
        disabled={!canEdit}
      />

      {canEdit && (
        <div className="card-save-actions">
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={() => onDelete(card)}
          >
            {t("boards.deleteCard")}
          </Button>

          <Button type="button" isLoading={isSaving} onClick={onSave}>
            {t("boards.saveChanges")}
          </Button>
        </div>
      )}
    </section>
  );
}