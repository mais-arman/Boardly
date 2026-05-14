import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../shared/realtime/socket";

type BoardRealtimeEvent = {
  type: string;
  board_id: string;
  payload: Record<string, unknown>;
};

type UseBoardRealtimeParams = {
  boardId: string | undefined;
  listIds: string[];
};

const BOARD_QUERY_KEY = "board";
const LISTS_QUERY_KEY = "board-lists";
const CARDS_QUERY_KEY = "list-cards";
const COMMENTS_QUERY_KEY = "card-comments";
const LABELS_QUERY_KEY = "board-labels";
const MEMBERS_QUERY_KEY = "board-members";
const INVITATIONS_QUERY_KEY = "board-invitations";

export function useBoardRealtime({
  boardId,
  listIds,
}: UseBoardRealtimeParams) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!boardId) {
      return;
    }

    const socket = getSocket();

    if (!socket) {
      return;
    }

    socket.emit("join_board", {
      board_id: boardId,
    });

    function handleBoardEvent(event: BoardRealtimeEvent) {
      if (event.board_id !== boardId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: [BOARD_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [LISTS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [LABELS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [MEMBERS_QUERY_KEY, boardId],
      });

      queryClient.invalidateQueries({
        queryKey: [INVITATIONS_QUERY_KEY, boardId],
      });

      listIds.forEach((listId) => {
        queryClient.invalidateQueries({
          queryKey: [CARDS_QUERY_KEY, listId],
        });
      });

      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY],
        exact: false,
      });
    }

    socket.on("board:event", handleBoardEvent);

    return () => {
      socket.emit("leave_board", {
        board_id: boardId,
      });

      socket.off("board:event", handleBoardEvent);
    };
  }, [boardId, listIds, queryClient]);
}