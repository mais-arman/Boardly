import { useState } from "react";
import { useBoardModalState } from "./useBoardModalState";
import { useListCommands } from "./useListCommands";
import { useCardCommands } from "./useCardCommands";
import { useBoardDeleteCommand } from "./useBoardDeleteCommand";

type UseBoardCommandsParams = {
  boardId: string | undefined;
};

export function useBoardCommands({ boardId }: UseBoardCommandsParams) {
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");

  const modalState = useBoardModalState();

  const listCommands = useListCommands({
    boardId,
    listToDelete: modalState.listToDelete,
    setListToDelete: modalState.setListToDelete,
    setPageError,
  });

  const cardCommands = useCardCommands({
    boardId,
    cardToDelete: modalState.cardToDelete,
    setCardToDelete: modalState.setCardToDelete,
    selectedCard: modalState.selectedCard,
    setSelectedCard: modalState.setSelectedCard,
    setPageError,
    setModalError,
  });

  const boardDeleteCommand = useBoardDeleteCommand({
    boardId,
  });

  return {
    state: {
      newListTitle: listCommands.state.newListTitle,
      cardTitleByList: cardCommands.state.cardTitleByList,
      editingListId: listCommands.state.editingListId,
      editingListTitle: listCommands.state.editingListTitle,

      listToDelete: modalState.listToDelete,
      cardToDelete: modalState.cardToDelete,
      selectedCard: modalState.selectedCard,

      pageError,
      modalError,

      isMembersPanelOpen: modalState.isMembersPanelOpen,
      isDeleteBoardOpen: modalState.isDeleteBoardOpen,
    },

    mutations: {
      createListMutation: listCommands.mutations.createListMutation,
      updateListMutation: listCommands.mutations.updateListMutation,
      deleteListMutation: listCommands.mutations.deleteListMutation,

      createCardMutation: cardCommands.mutations.createCardMutation,
      updateCardMutation: cardCommands.mutations.updateCardMutation,
      deleteCardMutation: cardCommands.mutations.deleteCardMutation,
      createCommentMutation: cardCommands.mutations.createCommentMutation,

      deleteBoardMutation: boardDeleteCommand.mutations.deleteBoardMutation,
    },

    actions: {
      setNewListTitle: listCommands.actions.setNewListTitle,
      setEditingListTitle: listCommands.actions.setEditingListTitle,

      setListToDelete: modalState.setListToDelete,
      setCardToDelete: modalState.setCardToDelete,
      setSelectedCard: modalState.setSelectedCard,

      setPageError,

      setIsMembersPanelOpen: modalState.setIsMembersPanelOpen,
      setIsDeleteBoardOpen: modalState.setIsDeleteBoardOpen,

      handleCreateList: listCommands.actions.handleCreateList,
      handleCreateDefaultWorkflow:
        listCommands.actions.handleCreateDefaultWorkflow,
      startEditingList: listCommands.actions.startEditingList,
      cancelEditingList: listCommands.actions.cancelEditingList,
      handleUpdateList: listCommands.actions.handleUpdateList,
      confirmDeleteList: listCommands.actions.confirmDeleteList,

      handleCreateCard: cardCommands.actions.handleCreateCard,
      handleUpdateCard: cardCommands.actions.handleUpdateCard,
      confirmDeleteCard: cardCommands.actions.confirmDeleteCard,
      handleCreateComment: cardCommands.actions.handleCreateComment,
      handleCardChanged: cardCommands.actions.handleCardChanged,
      handleCardTitleChange: cardCommands.actions.handleCardTitleChange,
    },
  };
}