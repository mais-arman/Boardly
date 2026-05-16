import { useState } from "react";
import type { BoardList, Card } from "../types";

export function useBoardModalState() {
  const [listToDelete, setListToDelete] = useState<BoardList | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

  return {
    listToDelete,
    setListToDelete,

    cardToDelete,
    setCardToDelete,

    selectedCard,
    setSelectedCard,

    isMembersPanelOpen,
    setIsMembersPanelOpen,

    isDeleteBoardOpen,
    setIsDeleteBoardOpen,
  };
}