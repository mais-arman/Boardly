import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../shared/components/Button";

type CreateListPanelProps = {
  title: string;
  isCreating: boolean;
  onTitleChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function CreateListPanel({
  title,
  isCreating,
  onTitleChange,
  onSubmit,
}: CreateListPanelProps) {
  const { t } = useTranslation();

  return (
    <article className="trello-list add-list-panel">
      <form onSubmit={onSubmit}>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={t("boards.addAnotherList")}
        />

        <Button type="submit" variant="secondary" isLoading={isCreating}>
          {t("boards.addList")}
        </Button>
      </form>
    </article>
  );
}