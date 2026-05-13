import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { ROUTES } from "../../../app/constants/routes";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Loader from "../../../shared/components/Loader";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";

import BoardMembersPanel from "../components/BoardMembersPanel";
import CardDetailsModal from "../components/CardDetailsModal";
import CardPreview from "../components/CardPreview";

import BoardPageHeader from "../components/board-page/BoardPageHeader";
import EmptyBoardState from "../components/board-page/EmptyBoardState";
import BoardLanes from "../components/board-page/BoardLanes";

import {
  BOARD_QUERY_KEY,
  CARDS_QUERY_KEY,
  COMMENTS_QUERY_KEY,
  LISTS_QUERY_KEY,
  useBoardData,
} from "../hooks/useBoardData";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import { useBoardPermissions } from "../hooks/useBoardPermissions";
import { useBoardRealtime } from "../hooks/useBoardRealtime";

import type { BoardList, Card } from "../types";

import {
  createCardRequest,
  createCommentRequest,
  createListRequest,
  deleteCardRequest,
  deleteListRequest,
  updateCardRequest,
  updateListRequest,
} from "../api/boardPageApi";
import { deleteBoardRequest } from "../api/boardsApi";

const DEFAULT_LISTS = ["To Do", "In Progress", "Doing", "Done"];

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [newListTitle, setNewListTitle] = useState("");

  const [cardTitleByList, setCardTitleByList] = useState<
    Record<string, string>
  >({});

  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListTitle, setEditingListTitle] = useState("");

  const [listToDelete, setListToDelete] = useState<BoardList | null>(null);
  const [cardToDelete, setCardToDelete] = useState<Card | null>(null);

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");

  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

  const boardData = useBoardData(boardId, selectedCard?.id);
  const permissions = useBoardPermissions(boardData.board);

  useBoardRealtime({
    boardId,
    listIds: boardData.listIds,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const drag = useBoardDragAndDrop({
    boardId: boardId || "",
    lists: boardData.lists,
    cardsByList: boardData.cardsByList,
    canEdit: permissions.canManageCards,
    onError: setPageError,
  });

  const createListMutation = useMutation({
    mutationFn: (title: string) =>
      createListRequest(boardId as string, {
        title,
      }),

    onSuccess: () => {
      setNewListTitle("");

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({
      listId,
      title,
    }: {
      listId: string;
      title: string;
    }) =>
      updateListRequest(listId, {
        title,
      }),

    onSuccess: () => {
      setEditingListId(null);
      setEditingListTitle("");

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });
    },
  });

  const deleteListMutation = useMutation({
    mutationFn: (listId: string) => deleteListRequest(listId),

    onSuccess: () => {
      setListToDelete(null);

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const createCardMutation = useMutation({
    mutationFn: ({
      listId,
      title,
    }: {
      listId: string;
      title: string;
    }) =>
      createCardRequest(listId, {
        title,
        description: null,
        due_date: null,
      }),

    onSuccess: (_, variables) => {
      setCardTitleByList((current) => ({
        ...current,
        [variables.listId]: "",
      }));

      queryClient.invalidateQueries({
        queryKey: [CARDS_QUERY_KEY, variables.listId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({
      cardId,
      title,
      description,
      dueDate,
    }: {
      cardId: string;
      title: string;
      description: string;
      dueDate: string;
    }) =>
      updateCardRequest(cardId, {
        title,
        description: description || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      }),

    onSuccess: (updatedCard) => {
      setSelectedCard(updatedCard);

      queryClient.invalidateQueries({
        queryKey: [CARDS_QUERY_KEY, updatedCard.list_id],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => deleteCardRequest(cardId),

    onSuccess: (_, cardId) => {
      setSelectedCard(null);
      setCardToDelete(null);
      setModalError("");

      boardData.lists.forEach((list) => {
        queryClient.invalidateQueries({
          queryKey: [CARDS_QUERY_KEY, list.id],
        });
      });

      queryClient.removeQueries({
        queryKey: [COMMENTS_QUERY_KEY, cardId],
      });

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({
      cardId,
      content,
    }: {
      cardId: string;
      content: string;
    }) =>
      createCommentRequest(cardId, {
        content,
      }),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY, variables.cardId],
      });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: () => deleteBoardRequest(boardId as string),

    onSuccess: () => {
      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    },
  });

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");

    const title = newListTitle.trim();

    if (title.length < 2) {
      setPageError("List title must be at least 2 characters.");
      return;
    }

    try {
      await createListMutation.mutateAsync(title);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to create list."));
    }
  }

  async function handleCreateDefaultWorkflow() {
    setPageError("");

    try {
      for (const title of DEFAULT_LISTS) {
        await createListMutation.mutateAsync(title);
      }
    } catch (error) {
      setPageError(
        getApiErrorMessage(error, "Failed to create workflow lists.")
      );
    }
  }

  function startEditingList(list: BoardList) {
    setEditingListId(list.id);
    setEditingListTitle(list.title);
  }

  async function handleUpdateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingListId) return;

    setPageError("");

    const title = editingListTitle.trim();

    if (title.length < 2) {
      setPageError("List title must be at least 2 characters.");
      return;
    }

    try {
      await updateListMutation.mutateAsync({
        listId: editingListId,
        title,
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to update list."));
    }
  }

  async function confirmDeleteList() {
    if (!listToDelete) return;

    setPageError("");

    try {
      await deleteListMutation.mutateAsync(listToDelete.id);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to delete list."));
      setListToDelete(null);
    }
  }

  async function handleCreateCard(
    event: FormEvent<HTMLFormElement>,
    listId: string
  ) {
    event.preventDefault();
    setPageError("");

    const title = cardTitleByList[listId]?.trim();

    if (!title || title.length < 2) {
      setPageError("Card title must be at least 2 characters.");
      return;
    }

    try {
      await createCardMutation.mutateAsync({
        listId,
        title,
      });
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to create card."));
    }
  }

  async function handleUpdateCard(payload: {
    cardId: string;
    title: string;
    description: string;
    dueDate: string;
  }) {
    setModalError("");

    if (payload.title.trim().length < 2) {
      setModalError("Card title must be at least 2 characters.");
      return;
    }

    try {
      await updateCardMutation.mutateAsync(payload);
    } catch (error) {
      setModalError(getApiErrorMessage(error, "Failed to update card."));
    }
  }

  async function confirmDeleteCard() {
    if (!cardToDelete) return;

    setModalError("");

    try {
      await deleteCardMutation.mutateAsync(cardToDelete.id);
    } catch (error) {
      setModalError(getApiErrorMessage(error, "Failed to delete card."));
      setCardToDelete(null);
    }
  }

  async function handleCreateComment(cardId: string, content: string) {
    setModalError("");

    try {
      await createCommentMutation.mutateAsync({
        cardId,
        content,
      });
    } catch (error) {
      setModalError(getApiErrorMessage(error, "Failed to add comment."));
    }
  }

  function handleCardChanged(updatedCard: Card) {
    setSelectedCard(updatedCard);

    queryClient.invalidateQueries({
      queryKey: [CARDS_QUERY_KEY, updatedCard.list_id],
    });

    queryClient.invalidateQueries({
      queryKey: [BOARD_QUERY_KEY, boardId],
    });
  }

  if (boardData.isLoading) {
    return <Loader />;
  }

  if (!boardId || boardData.isError || !boardData.board) {
    return (
      <main className="trello-board-page">
        <div className="alert error">Board not found.</div>
        <Link to={ROUTES.DASHBOARD}>Back to boards</Link>
      </main>
    );
  }

  return (
    <main
      className="trello-board-page"
      style={{
        background: boardData.board.background_color,
      }}
    >
      <BoardPageHeader
        board={boardData.board}
        role={permissions.role}
        isOwner={permissions.isOwner}
        isAdmin={permissions.isAdmin}
        isEditor={permissions.isEditor}
        isViewer={permissions.isViewer}
        canManageMembers={permissions.canManageMembers}
        canDeleteBoard={permissions.canDeleteBoard}
        onOpenMembers={() => setIsMembersPanelOpen(true)}
        onOpenDeleteBoard={() => setIsDeleteBoardOpen(true)}
      />

      {pageError && <div className="alert error">{pageError}</div>}

      {boardData.lists.length === 0 && (
        <EmptyBoardState
          canManageLists={permissions.canManageLists}
          isCreating={createListMutation.isPending}
          onCreateDefaultWorkflow={handleCreateDefaultWorkflow}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={drag.handleDragStart}
        onDragOver={drag.handleDragOver}
        onDragEnd={drag.handleDragEnd}
        onDragCancel={drag.handleDragCancel}
      >
        <BoardLanes
          lists={boardData.lists}
          cardsByList={boardData.cardsByList}
          canManageCards={permissions.canManageCards}
          canManageLists={permissions.canManageLists}
          editingListId={editingListId}
          editingListTitle={editingListTitle}
          cardTitleByList={cardTitleByList}
          newListTitle={newListTitle}
          isCreatingCard={createCardMutation.isPending}
          isCreatingList={createListMutation.isPending}
          onOpenCard={setSelectedCard}
          onStartEditList={startEditingList}
          onCancelEditList={() => {
            setEditingListId(null);
            setEditingListTitle("");
          }}
          onEditingListTitleChange={setEditingListTitle}
          onUpdateList={handleUpdateList}
          onDeleteList={setListToDelete}
          onCardTitleChange={(listId, value) =>
            setCardTitleByList((current) => ({
              ...current,
              [listId]: value,
            }))
          }
          onCreateCard={handleCreateCard}
          onNewListTitleChange={setNewListTitle}
          onCreateList={handleCreateList}
        />

        <DragOverlay>
          {drag.activeCard ? (
            <CardPreview card={drag.activeCard} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardDetailsModal
          boardId={boardId}
          card={selectedCard}
          comments={boardData.comments}
          isUpdating={updateCardMutation.isPending}
          isAddingComment={createCommentMutation.isPending}
          isDeleting={deleteCardMutation.isPending}
          error={modalError}
          canEdit={permissions.canManageCards}
          canComment={permissions.canComment}
          roleLabel={permissions.role}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleUpdateCard}
          onDelete={async (card) => setCardToDelete(card)}
          onCreateComment={handleCreateComment}
          onCardChanged={handleCardChanged}
        />
      )}

      {isMembersPanelOpen && (
        <BoardMembersPanel
          boardId={boardId}
          canManageMembers={permissions.canManageMembers}
          onClose={() => setIsMembersPanelOpen(false)}
        />
      )}

      {listToDelete && (
        <ConfirmModal
          title="Delete list?"
          description={`Delete ${listToDelete.title} and all its cards?`}
          confirmLabel="Delete list"
          isLoading={deleteListMutation.isPending}
          onCancel={() => setListToDelete(null)}
          onConfirm={confirmDeleteList}
        />
      )}

      {cardToDelete && (
        <ConfirmModal
          title="Delete card?"
          description={`Delete ${cardToDelete.title}?`}
          confirmLabel="Delete card"
          isLoading={deleteCardMutation.isPending}
          onCancel={() => setCardToDelete(null)}
          onConfirm={confirmDeleteCard}
        />
      )}

      {isDeleteBoardOpen && (
        <ConfirmModal
          title="Delete board?"
          description="This permanently deletes the board, lists, cards, labels, comments, and members."
          confirmLabel="Delete board"
          isLoading={deleteBoardMutation.isPending}
          onCancel={() => setIsDeleteBoardOpen(false)}
          onConfirm={() => deleteBoardMutation.mutate()}
        />
      )}
    </main>
  );
}