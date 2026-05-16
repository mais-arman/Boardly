import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { QUERY_KEYS } from "../../../app/constants/queryKeys";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";
import type { BoardList, Card } from "../types";
import { moveCardRequest, reorderListsRequest } from "../api/boardPageApi";

type UseBoardDragAndDropParams = {
  boardId: string;
  lists: BoardList[];
  cardsByList: Record<string, Card[]>;
  canEdit: boolean;
  onError: (message: string) => void;
};

function findCardContainer(
  cardsByList: Record<string, Card[]>,
  cardId: string
) {
  return Object.keys(cardsByList).find((listId) =>
    cardsByList[listId].some((card) => card.id === cardId)
  );
}

function isListId(lists: BoardList[], id: string) {
  return lists.some((list) => list.id === id);
}

export function useBoardDragAndDrop({
  boardId,
  lists,
  cardsByList,
  canEdit,
  onError,
}: UseBoardDragAndDropParams) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  function updateCardsCache(nextCardsByList: Record<string, Card[]>) {
    Object.entries(nextCardsByList).forEach(([listId, cards]) => {
      queryClient.setQueryData(QUERY_KEYS.BOARDS.LIST_CARDS(listId), cards);
    });
  }

  function handleDragStart(event: DragStartEvent) {
    const card = event.active.data.current?.card as Card | undefined;
    setActiveCard(card || null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (!canEdit) return;

    const { active, over } = event;

    if (!over) return;

    const activeType = active.data.current?.type;

    if (activeType !== "card") return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceListId = findCardContainer(cardsByList, activeId);

    const targetListId = isListId(lists, overId)
      ? overId
      : findCardContainer(cardsByList, overId);

    if (!sourceListId || !targetListId || sourceListId === targetListId) {
      return;
    }

    const sourceCards = [...(cardsByList[sourceListId] || [])];
    const targetCards = [...(cardsByList[targetListId] || [])];

    const sourceIndex = sourceCards.findIndex((card) => card.id === activeId);

    if (sourceIndex === -1) return;

    const [movingCard] = sourceCards.splice(sourceIndex, 1);

    const overIndex = targetCards.findIndex((card) => card.id === overId);
    const insertIndex = overIndex >= 0 ? overIndex : targetCards.length;

    targetCards.splice(insertIndex, 0, {
      ...movingCard,
      list_id: targetListId,
    });

    updateCardsCache({
      ...cardsByList,

      [sourceListId]: sourceCards.map((card, index) => ({
        ...card,
        position: index,
      })),

      [targetListId]: targetCards.map((card, index) => ({
        ...card,
        position: index,
      })),
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveCard(null);

    if (!canEdit || !over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "list" && overType === "list") {
      const oldIndex = lists.findIndex((list) => list.id === active.id);
      const newIndex = lists.findIndex((list) => list.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const reorderedLists = arrayMove(lists, oldIndex, newIndex);

      queryClient.setQueryData(
        QUERY_KEYS.BOARDS.LISTS(boardId),
        reorderedLists
      );

      try {
        await reorderListsRequest(boardId, {
          lists: reorderedLists.map((list, index) => ({
            id: list.id,
            position: index,
          })),
        });

        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
        });
      } catch (error) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BOARDS.LISTS(boardId),
        });

        onError(getApiErrorMessage(error, t("errors.failedReorderLists")));
      }

      return;
    }

    if (activeType !== "card") return;

    const activeCardFromEvent = active.data.current?.card as Card | undefined;
    const activeId = String(active.id);
    const overId = String(over.id);

    const targetListId = isListId(lists, overId)
      ? overId
      : findCardContainer(cardsByList, overId);

    if (!activeCardFromEvent || !targetListId) return;

    const targetCards = cardsByList[targetListId] || [];

    const currentIndex = targetCards.findIndex((card) => card.id === activeId);
    const targetPosition =
      currentIndex >= 0 ? currentIndex : targetCards.length;

    try {
      await moveCardRequest(activeCardFromEvent.id, {
        target_list_id: targetListId,
        position: targetPosition,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });

      lists.forEach((list) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(list.id),
        });
      });
    } catch (error) {
      lists.forEach((list) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(list.id),
        });
      });

      onError(getApiErrorMessage(error, t("errors.failedMoveCard")));
    }
  }

  function handleDragCancel() {
    setActiveCard(null);
  }

  return {
    activeCard,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}