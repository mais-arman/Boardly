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
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";

import { ROUTES } from "../../../app/constants/routes";
import Button from "../../../shared/components/Button";
import ConfirmModal from "../../../shared/components/ConfirmModal";
import Loader from "../../../shared/components/Loader";
import { getApiErrorMessage } from "../../../shared/api/getApiErrorMessage";

import BoardMembersPanel from "../components/BoardMembersPanel";
import CardDetailsModal from "../components/CardDetailsModal";
import CardPreview from "../components/CardPreview";
import SortableList from "../components/SortableList";

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
      <header className="trello-board-header">
        <div>
          <Link to={ROUTES.DASHBOARD} className="back-link">
            ← Back to boards
          </Link>

          <h1>{boardData.board.title}</h1>

          <div className="role-explainer">
            <span className={`role-pill ${permissions.role}`}>
              {permissions.role}
            </span>

            {permissions.isOwner && (
              <small>
                Owner: full control over the board, members, and deletion.
              </small>
            )}

            {permissions.isAdmin && (
              <small>
                Admin: can edit the board and manage members.
              </small>
            )}

            {permissions.isEditor && (
              <small>
                Editor: can manage lists, cards, labels, and comments.
              </small>
            )}

            {permissions.isViewer && (
              <small>
                Viewer: read-only access. You can view cards but cannot edit.
              </small>
            )}
          </div>
        </div>

        <div className="board-header-actions">
          {permissions.canManageMembers && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsMembersPanelOpen(true)}
            >
              Members & roles
            </Button>
          )}

          {permissions.canDeleteBoard && (
            <Button
              type="button"
              variant="danger"
              onClick={() => setIsDeleteBoardOpen(true)}
            >
              Delete board
            </Button>
          )}
        </div>
      </header>

      {pageError && <div className="alert error">{pageError}</div>}

      {boardData.lists.length === 0 && (
        <section className="workflow-empty">
          <h2>No lists yet</h2>

          {permissions.canManageLists ? (
            <>
              <p>Create a Trello-like workflow to start managing cards.</p>

              <Button
                type="button"
                onClick={handleCreateDefaultWorkflow}
                isLoading={createListMutation.isPending}
              >
                Create default workflow
              </Button>
            </>
          ) : (
            <>
              <p>You have viewer access. You can view board content only.</p>

              <span className="permission-note">
                Ask the owner or admin for Editor access.
              </span>
            </>
          )}
        </section>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={drag.handleDragStart}
        onDragOver={drag.handleDragOver}
        onDragEnd={drag.handleDragEnd}
        onDragCancel={drag.handleDragCancel}
      >
        <SortableContext
          items={boardData.lists.map((list) => list.id)}
          strategy={horizontalListSortingStrategy}
        >
          <section className="trello-lanes">
            {boardData.lists.map((list) => (
              <SortableList
                key={list.id}
                list={list}
                cards={boardData.cardsByList[list.id] || []}
                canEdit={permissions.canManageCards}
                editingListId={editingListId}
                editingListTitle={editingListTitle}
                cardTitle={cardTitleByList[list.id] || ""}
                isCreatingCard={createCardMutation.isPending}
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
              />
            ))}

            {permissions.canManageLists && (
              <article className="trello-list add-list-panel">
                <form onSubmit={handleCreateList}>
                  <input
                    value={newListTitle}
                    onChange={(event) =>
                      setNewListTitle(event.target.value)
                    }
                    placeholder="Add another list"
                  />

                  <Button
                    type="submit"
                    variant="secondary"
                    isLoading={createListMutation.isPending}
                  >
                    Add list
                  </Button>
                </form>
              </article>
            )}
          </section>
        </SortableContext>

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