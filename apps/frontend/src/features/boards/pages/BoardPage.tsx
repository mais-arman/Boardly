import { Link, useParams } from "react-router-dom";
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

import BoardHeader from "../components/BoardHeader";
import BoardMembersPanel from "../components/BoardMembersPanel";
import CardDetailsModal from "../components/CardDetailsModal";
import CardPreview from "../components/CardPreview";
import EmptyBoardState from "../components/board-page/EmptyBoardState";
import BoardLanes from "../components/board-page/BoardLanes";

import { useBoardCommands } from "../hooks/useBoardCommands";
import { useBoardData } from "../hooks/useBoardData";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import { useBoardPermissions } from "../hooks/useBoardPermissions";
import { useBoardRealtime } from "../hooks/useBoardRealtime";

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();

  const commands = useBoardCommands({
    boardId,
  });

  const { state, actions, mutations } = commands;

  const boardData = useBoardData(boardId, state.selectedCard?.id);
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
    onError: actions.setPageError,
  });

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
      <BoardHeader
        board={boardData.board}
        role={permissions.role}
        isOwner={permissions.isOwner}
        isAdmin={permissions.isAdmin}
        isEditor={permissions.isEditor}
        isViewer={permissions.isViewer}
        canManageMembers={permissions.canManageMembers}
        canDeleteBoard={permissions.canDeleteBoard}
        onOpenMembers={() => actions.setIsMembersPanelOpen(true)}
        onOpenDeleteBoard={() => actions.setIsDeleteBoardOpen(true)}
      />

      {state.pageError && <div className="alert error">{state.pageError}</div>}

      {boardData.lists.length === 0 && (
        <EmptyBoardState
          canManageLists={permissions.canManageLists}
          isCreating={mutations.createListMutation.isPending}
          onCreateDefaultWorkflow={actions.handleCreateDefaultWorkflow}
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
          editingListId={state.editingListId}
          editingListTitle={state.editingListTitle}
          cardTitleByList={state.cardTitleByList}
          newListTitle={state.newListTitle}
          isCreatingCard={mutations.createCardMutation.isPending}
          isCreatingList={mutations.createListMutation.isPending}
          onOpenCard={actions.setSelectedCard}
          onStartEditList={actions.startEditingList}
          onCancelEditList={actions.cancelEditingList}
          onEditingListTitleChange={actions.setEditingListTitle}
          onUpdateList={actions.handleUpdateList}
          onDeleteList={actions.setListToDelete}
          onCardTitleChange={actions.handleCardTitleChange}
          onCreateCard={actions.handleCreateCard}
          onNewListTitleChange={actions.setNewListTitle}
          onCreateList={actions.handleCreateList}
        />

        <DragOverlay>
          {drag.activeCard ? (
            <CardPreview card={drag.activeCard} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>

      {state.selectedCard && (
        <CardDetailsModal
          boardId={boardId}
          card={state.selectedCard}
          comments={boardData.comments}
          isUpdating={mutations.updateCardMutation.isPending}
          isAddingComment={mutations.createCommentMutation.isPending}
          isDeleting={mutations.deleteCardMutation.isPending}
          error={state.modalError}
          canEdit={permissions.canManageCards}
          canComment={permissions.canComment}
          roleLabel={permissions.role}
          onClose={() => actions.setSelectedCard(null)}
          onUpdate={actions.handleUpdateCard}
          onDelete={async (card) => actions.setCardToDelete(card)}
          onCreateComment={actions.handleCreateComment}
          onCardChanged={actions.handleCardChanged}
        />
      )}

      {state.isMembersPanelOpen && (
        <BoardMembersPanel
          boardId={boardId}
          canManageMembers={permissions.canManageMembers}
          onClose={() => actions.setIsMembersPanelOpen(false)}
        />
      )}

      {state.listToDelete && (
        <ConfirmModal
          title="Delete list?"
          description={`Delete ${state.listToDelete.title} and all its cards?`}
          confirmLabel="Delete list"
          isLoading={mutations.deleteListMutation.isPending}
          onCancel={() => actions.setListToDelete(null)}
          onConfirm={actions.confirmDeleteList}
        />
      )}

      {state.cardToDelete && (
        <ConfirmModal
          title="Delete card?"
          description={`Delete ${state.cardToDelete.title}?`}
          confirmLabel="Delete card"
          isLoading={mutations.deleteCardMutation.isPending}
          onCancel={() => actions.setCardToDelete(null)}
          onConfirm={actions.confirmDeleteCard}
        />
      )}

      {state.isDeleteBoardOpen && (
        <ConfirmModal
          title="Delete board?"
          description="This permanently deletes the board, lists, cards, labels, comments, and members."
          confirmLabel="Delete board"
          isLoading={mutations.deleteBoardMutation.isPending}
          onCancel={() => actions.setIsDeleteBoardOpen(false)}
          onConfirm={() => mutations.deleteBoardMutation.mutate()}
        />
      )}
    </main>
  );
}