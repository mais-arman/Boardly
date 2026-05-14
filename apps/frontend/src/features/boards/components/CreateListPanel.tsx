import type { FormEvent } from "react";
import Button from "../../../shared/components/Button";

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
  return (
    <article className="trello-list add-list-panel">
      <form onSubmit={onSubmit}>
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Add another list"
        />

        <Button type="submit" variant="secondary" isLoading={isCreating}>
          Add list
        </Button>
      </form>
    </article>
  );
}