import type { Card } from "../../../cards/types";
import type { BoardList } from "../../types";

export function findCardContainer(
  cardsByList: Record<string, Card[]>,
  cardId: string
) {
  return Object.keys(cardsByList).find((listId) =>
    cardsByList[listId].some((card) => card.id === cardId)
  );
}

export function isListId(lists: BoardList[], id: string) {
  return lists.some((list) => list.id === id);
}

export function updateCardPositions(cards: Card[]) {
  return cards.map((card, index) => ({
    ...card,
    position: index,
  }));
}