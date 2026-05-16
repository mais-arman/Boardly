import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BoardList } from "../../types";
import type { Card } from "../../../cards/types";
import Button from "../../../../shared/components/Button";
import SortableCard from "../../../cards/components/SortableCard";

type SortableListProps = {
  list: BoardList;
  cards: Card[];
  canEdit: boolean;

  editingListId: string | null;
  editingListTitle: string;
  cardTitle: string;
  isCreatingCard: boolean;

  onOpenCard: (card: Card) => void;
  onStartEditList: (list: BoardList) => void;
  onCancelEditList: () => void;
  onEditingListTitleChange: (title: string) => void;
  onUpdateList: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteList: (list: BoardList) => void;

  onCardTitleChange: (listId: string, title: string) => void;
  onCreateCard: (
    event: FormEvent<HTMLFormElement>,
    listId: string
  ) => void;
};

export default function SortableList({
  list,
  cards,
  canEdit,
  editingListId,
  editingListTitle,
  cardTitle,
  isCreatingCard,
  onOpenCard,
  onStartEditList,
  onCancelEditList,
  onEditingListTitleChange,
  onUpdateList,
  onDeleteList,
  onCardTitleChange,
  onCreateCard,
}: SortableListProps) {
  const { t } = useTranslation();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    disabled: !canEdit || editingListId === list.id,
    data: {
      type: "list",
      list,
    },
  });

  const isEditing = editingListId === list.id;

  return (
    <article
      ref={setNodeRef}
      className={`trello-list ${isDragging ? "dragging" : ""}`.trim()}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <header className="trello-list-header" {...attributes} {...listeners}>
        {isEditing ? (
          <form className="list-title-edit-form" onSubmit={onUpdateList}>
            <input
              value={editingListTitle}
              onChange={(event) =>
                onEditingListTitleChange(event.target.value)
              }
              autoFocus
            />

            <div className="list-edit-actions">
              <button type="submit">{t("common.save")}</button>

              <button type="button" onClick={onCancelEditList}>
                {t("common.cancel")}
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2>{list.title}</h2>

            <div className="list-header-actions">
              <span>{cards.length}</span>

              {canEdit && (
                <>
                  <button type="button" onClick={() => onStartEditList(list)}>
                    {t("common.edit")}
                  </button>

                  <button type="button" onClick={() => onDeleteList(list)}>
                    {t("common.delete")}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </header>

      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="trello-cards" data-list-id={list.id}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              disabled={!canEdit}
              onOpen={onOpenCard}
            />
          ))}
        </div>
      </SortableContext>

      {canEdit ? (
        <form
          className="add-card-form"
          onSubmit={(event) => onCreateCard(event, list.id)}
        >
          <input
            value={cardTitle}
            onChange={(event) =>
              onCardTitleChange(list.id, event.target.value)
            }
            placeholder={t("boards.addCard")}
          />

          <Button type="submit" variant="secondary" isLoading={isCreatingCard}>
            {t("boards.addCard")}
          </Button>
        </form>
      ) : (
        <p className="viewer-note">{t("boards.viewerCardAccess")}</p>
      )}
    </article>
  );
}