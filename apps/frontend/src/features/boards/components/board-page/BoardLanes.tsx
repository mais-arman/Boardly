import type { FormEvent } from "react";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import type { BoardList, Card } from "../../types";
import SortableList from "../SortableList";
import CreateListPanel from "../CreateListPanel";

type BoardLanesProps = {
  lists: BoardList[];
  cardsByList: Record<string, Card[]>;
  canManageCards: boolean;
  canManageLists: boolean;

  editingListId: string | null;
  editingListTitle: string;
  cardTitleByList: Record<string, string>;
  newListTitle: string;

  isCreatingCard: boolean;
  isCreatingList: boolean;

  onOpenCard: (card: Card) => void;
  onStartEditList: (list: BoardList) => void;
  onCancelEditList: () => void;
  onEditingListTitleChange: (value: string) => void;
  onUpdateList: (event: FormEvent<HTMLFormElement>) => void;
  onDeleteList: (list: BoardList) => void;

  onCardTitleChange: (listId: string, value: string) => void;
  onCreateCard: (event: FormEvent<HTMLFormElement>, listId: string) => void;

  onNewListTitleChange: (value: string) => void;
  onCreateList: (event: FormEvent<HTMLFormElement>) => void;
};

export default function BoardLanes({
  lists,
  cardsByList,
  canManageCards,
  canManageLists,
  editingListId,
  editingListTitle,
  cardTitleByList,
  newListTitle,
  isCreatingCard,
  isCreatingList,
  onOpenCard,
  onStartEditList,
  onCancelEditList,
  onEditingListTitleChange,
  onUpdateList,
  onDeleteList,
  onCardTitleChange,
  onCreateCard,
  onNewListTitleChange,
  onCreateList,
}: BoardLanesProps) {
  return (
    <SortableContext
      items={lists.map((list) => list.id)}
      strategy={horizontalListSortingStrategy}
    >
      <section className="trello-lanes">
        {lists.map((list) => (
          <SortableList
            key={list.id}
            list={list}
            cards={cardsByList[list.id] || []}
            canEdit={canManageCards}
            editingListId={editingListId}
            editingListTitle={editingListTitle}
            cardTitle={cardTitleByList[list.id] || ""}
            isCreatingCard={isCreatingCard}
            onOpenCard={onOpenCard}
            onStartEditList={onStartEditList}
            onCancelEditList={onCancelEditList}
            onEditingListTitleChange={onEditingListTitleChange}
            onUpdateList={onUpdateList}
            onDeleteList={onDeleteList}
            onCardTitleChange={onCardTitleChange}
            onCreateCard={onCreateCard}
          />
        ))}

        {canManageLists && (
          <CreateListPanel
            title={newListTitle}
            isCreating={isCreatingList}
            onTitleChange={onNewListTitleChange}
            onSubmit={onCreateList}
          />
        )}
      </section>
    </SortableContext>
  );
}