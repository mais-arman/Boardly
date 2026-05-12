import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AxiosError } from "axios";
import { Link, useParams } from "react-router-dom";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  closestCorners,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { ROUTES } from "../../../app/constants/routes";
import { t } from "../../../app/constants/translations";
import Button from "../../../shared/components/Button";
import Input from "../../../shared/components/Input";
import Loader from "../../../shared/components/Loader";
import BoardMembersPanel from "../components/BoardMembersPanel";
import CardDetailsModal from "../components/CardDetailsModal";
import type { BoardList, Card } from "../types";
import {
  createCardRequest,
  createCommentRequest,
  createListRequest,
  getBoardListsRequest,
  getBoardRequest,
  getCardCommentsRequest,
  getListCardsRequest,
  moveCardRequest,
  reorderListsRequest,
  updateCardRequest,
} from "../api/boardPageApi";

type ErrorResponse = { message?: string };

const BOARD_QUERY_KEY = "board";
const LISTS_QUERY_KEY = "board-lists";
const CARDS_QUERY_KEY = "list-cards";
const COMMENTS_QUERY_KEY = "card-comments";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    return data?.message || fallback;
  }

  return fallback;
}

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const queryClient = useQueryClient();

  const [newListTitle, setNewListTitle] = useState("");
  const [cardTitleByList, setCardTitleByList] = useState<Record<string, string>>(
    {}
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [pageError, setPageError] = useState("");
  const [modalError, setModalError] = useState("");
  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  const boardQuery = useQuery({
    queryKey: [BOARD_QUERY_KEY, boardId],
    queryFn: () => getBoardRequest(boardId as string),
    enabled: Boolean(boardId),
  });

  const listsQuery = useQuery({
    queryKey: [LISTS_QUERY_KEY, boardId],
    queryFn: () => getBoardListsRequest(boardId as string),
    enabled: Boolean(boardId),
  });

  const lists = useMemo(() => listsQuery.data || [], [listsQuery.data]);

  const cardQueries = useQueries({
    queries: lists.map((list) => ({
      queryKey: [CARDS_QUERY_KEY, list.id],
      queryFn: () => getListCardsRequest(list.id),
      enabled: Boolean(list.id),
    })),
  });

  const cardsByList = useMemo(() => {
    return lists.reduce<Record<string, Card[]>>((acc, list, index) => {
      acc[list.id] = cardQueries[index]?.data || [];
      return acc;
    }, {});
  }, [lists, cardQueries]);

  const commentsQuery = useQuery({
    queryKey: [COMMENTS_QUERY_KEY, selectedCard?.id],
    queryFn: () => getCardCommentsRequest(selectedCard!.id),
    enabled: Boolean(selectedCard?.id),
  });

  const createListMutation = useMutation({
    mutationFn: (title: string) =>
      createListRequest(boardId as string, { title }),
    onSuccess: () => {
      setNewListTitle("");
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, boardId] });
      queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY, boardId] });
    },
  });

  const createCardMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) =>
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
      queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY, boardId] });
    },
  });

  const reorderListsMutation = useMutation({
    mutationFn: ({
      currentBoardId,
      reorderedLists,
    }: {
      currentBoardId: string;
      reorderedLists: BoardList[];
    }) =>
      reorderListsRequest(currentBoardId, {
        lists: reorderedLists.map((list, index) => ({
          id: list.id,
          position: index,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY, boardId] });
      queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY, boardId] });
    },
  });

  const moveCardMutation = useMutation({
    mutationFn: ({
      cardId,
      targetListId,
      position,
    }: {
      cardId: string;
      targetListId: string;
      position: number;
    }) =>
      moveCardRequest(cardId, {
        target_list_id: targetListId,
        position,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY, boardId] });

      lists.forEach((list) => {
        queryClient.invalidateQueries({
          queryKey: [CARDS_QUERY_KEY, list.id],
        });
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
      queryClient.invalidateQueries({ queryKey: [BOARD_QUERY_KEY, boardId] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ cardId, content }: { cardId: string; content: string }) =>
      createCommentRequest(cardId, { content }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY, variables.cardId],
      });
    },
  });

  async function handleCreateList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");

    const title = newListTitle.trim();

    if (!title) {
      return;
    }

    try {
      await createListMutation.mutateAsync(title);
    } catch (error) {
      setPageError(getErrorMessage(error, "Failed to create list."));
    }
  }

  async function handleCreateDefaultWorkflow() {
    setPageError("");

    try {
      for (const title of t.boards.defaultLists) {
        await createListMutation.mutateAsync(title);
      }
    } catch (error) {
      setPageError(getErrorMessage(error, "Failed to create workflow lists."));
    }
  }

  async function handleCreateCard(
    event: FormEvent<HTMLFormElement>,
    listId: string
  ) {
    event.preventDefault();
    setPageError("");

    const title = cardTitleByList[listId]?.trim();

    if (!title) {
      return;
    }

    try {
      await createCardMutation.mutateAsync({ listId, title });
    } catch (error) {
      setPageError(getErrorMessage(error, "Failed to create card."));
    }
  }

  async function handleUpdateCard(payload: {
    cardId: string;
    title: string;
    description: string;
    dueDate: string;
  }) {
    setModalError("");

    try {
      await updateCardMutation.mutateAsync(payload);
    } catch (error) {
      setModalError(getErrorMessage(error, "Failed to update card."));
    }
  }

  async function handleCreateComment(cardId: string, content: string) {
    setModalError("");

    try {
      await createCommentMutation.mutateAsync({ cardId, content });
    } catch (error) {
      setModalError(getErrorMessage(error, "Failed to add comment."));
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || !boardId) {
      return;
    }

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "list" && overType === "list") {
      const oldIndex = lists.findIndex((list) => list.id === active.id);
      const newIndex = lists.findIndex((list) => list.id === over.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const reorderedLists = arrayMove(lists, oldIndex, newIndex);

      try {
        await reorderListsMutation.mutateAsync({
          currentBoardId: boardId,
          reorderedLists,
        });
      } catch (error) {
        setPageError(getErrorMessage(error, "Failed to reorder lists."));
      }

      return;
    }

    if (activeType !== "card") {
      return;
    }

    const activeCard = active.data.current?.card as Card | undefined;
    const targetListId =
      (over.data.current?.listId as string | undefined) ||
      (over.data.current?.card as Card | undefined)?.list_id;

    if (!activeCard || !targetListId) {
      return;
    }

    const targetCards = cardsByList[targetListId] || [];
    const overCard = over.data.current?.card as Card | undefined;

    let targetPosition = targetCards.length;

    if (overCard) {
      targetPosition = targetCards.findIndex((card) => card.id === overCard.id);

      if (targetPosition < 0) {
        targetPosition = targetCards.length;
      }
    }

    try {
      await moveCardMutation.mutateAsync({
        cardId: activeCard.id,
        targetListId,
        position: targetPosition,
      });
    } catch (error) {
      setPageError(getErrorMessage(error, "Failed to move card."));
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

  if (boardQuery.isLoading || listsQuery.isLoading) {
    return <Loader />;
  }

  if (!boardId || boardQuery.isError || !boardQuery.data) {
    return (
      <main className="board-page">
        <div className="alert error">Board not found.</div>
        <Link to={ROUTES.DASHBOARD}>{t.boards.boardBack}</Link>
      </main>
    );
  }

  const board = boardQuery.data;
  const canManageMembers = board.role === "owner" || board.role === "admin";
  const canEdit =
    board.role === "owner" || board.role === "admin" || board.role === "editor";

  return (
    <main className="trello-board-page">
      <header className="trello-board-header">
        <div>
          <Link to={ROUTES.DASHBOARD} className="back-link">
            ← {t.boards.boardBack}
          </Link>
          <h1>{board.title}</h1>
        </div>

        <div className="board-header-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsMembersPanelOpen(true)}
          >
            Members
          </Button>

          <span className={`role-pill ${board.role || "viewer"}`}>
            {board.role || "viewer"}
          </span>
        </div>
      </header>

      {pageError && <div className="alert error">{pageError}</div>}

      {lists.length === 0 && (
        <section className="workflow-empty">
          <h2>No lists yet</h2>
          <p>Create a Trello-like workflow to start managing cards.</p>
          <Button
            type="button"
            onClick={handleCreateDefaultWorkflow}
            isLoading={createListMutation.isPending}
            disabled={!canEdit}
          >
            {t.boards.setupWorkflow}
          </Button>
        </section>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={canEdit ? handleDragEnd : undefined}
      >
        <SortableContext
          items={lists.map((list) => list.id)}
          strategy={horizontalListSortingStrategy}
        >
          <section className="trello-lanes">
            {lists.map((list: BoardList) => (
              <SortableListContainer
                key={list.id}
                list={list}
                cardIds={(cardsByList[list.id] || []).map((card) => card.id)}
                disabled={!canEdit}
              >
                <div className="trello-list-header">
                  <h2>{list.title}</h2>
                  <span>{cardsByList[list.id]?.length || 0}</span>
                </div>

                <div className="trello-cards">
                  {(cardsByList[list.id] || []).map((card) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      disabled={!canEdit}
                      onClick={() => setSelectedCard(card)}
                    >
                      {card.labels.length > 0 && (
                        <div className="trello-card-labels">
                          {card.labels.map((label) => (
                            <span
                              key={label.id}
                              style={{ background: label.color }}
                            />
                          ))}
                        </div>
                      )}

                      <strong>{card.title}</strong>

                      {card.description && <p>{card.description}</p>}

                      <div className="trello-card-footer">
                        {card.due_date && (
                          <span>
                            📅 {new Date(card.due_date).toLocaleDateString()}
                          </span>
                        )}

                        {card.assignees.length > 0 && (
                          <span>👤 {card.assignees.length}</span>
                        )}
                      </div>
                    </SortableCard>
                  ))}
                </div>

                {canEdit && (
                  <form
                    className="trello-add-card"
                    onSubmit={(event) => handleCreateCard(event, list.id)}
                  >
                    <input
                      value={cardTitleByList[list.id] || ""}
                      onChange={(event) =>
                        setCardTitleByList((current) => ({
                          ...current,
                          [list.id]: event.target.value,
                        }))
                      }
                      placeholder={t.boards.addCard}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="secondary"
                      isLoading={createCardMutation.isPending}
                    >
                      {t.boards.addCard}
                    </Button>
                  </form>
                )}
              </SortableListContainer>
            ))}

            {canEdit && (
              <article className="trello-list trello-add-list">
                <form onSubmit={handleCreateList}>
                  <Input
                    label={t.boards.listTitle}
                    value={newListTitle}
                    onChange={(event) => setNewListTitle(event.target.value)}
                    placeholder={t.boards.newListTitle}
                    required
                  />

                  <Button
                    type="submit"
                    fullWidth
                    isLoading={createListMutation.isPending}
                  >
                    + {t.boards.addList}
                  </Button>
                </form>
              </article>
            )}
          </section>
        </SortableContext>
      </DndContext>

      {selectedCard && (
        <CardDetailsModal
          boardId={boardId}
          card={selectedCard}
          comments={commentsQuery.data || []}
          isUpdating={updateCardMutation.isPending}
          isAddingComment={createCommentMutation.isPending}
          error={modalError}
          canEdit={canEdit}
          onClose={() => {
            setSelectedCard(null);
            setModalError("");
          }}
          onUpdate={handleUpdateCard}
          onCreateComment={handleCreateComment}
          onCardChanged={handleCardChanged}
        />
      )}

      {isMembersPanelOpen && (
        <BoardMembersPanel
          boardId={boardId}
          canManageMembers={canManageMembers}
          onClose={() => setIsMembersPanelOpen(false)}
        />
      )}
    </main>
  );
}

function SortableListContainer({
  list,
  cardIds,
  disabled,
  children,
}: {
  list: BoardList;
  cardIds: string[];
  disabled: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: list.id,
      disabled,
      data: {
        type: "list",
        listId: list.id,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="trello-list"
      {...attributes}
      {...listeners}
    >
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </article>
  );
}

function SortableCard({
  card,
  disabled,
  children,
  onClick,
}: {
  card: Card;
  disabled: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: card.id,
      disabled,
      data: {
        type: "card",
        listId: card.list_id,
        card,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      className="trello-card"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      {children}
    </button>
  );
}