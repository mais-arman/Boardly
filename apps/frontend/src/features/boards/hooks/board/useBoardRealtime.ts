import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../../../app/constants/queryKeys";
import { getSocket } from "../../../../shared/services/socket";

type BoardRealtimeEvent = {
  type: string;
  board_id: string;
  payload: Record<string, unknown>;
};

type UseBoardRealtimeParams = {
  boardId: string | undefined;
  listIds: string[];
};

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
        queryKey: QUERY_KEYS.BOARDS.DETAIL(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LISTS(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.LABELS(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.MEMBERS(boardId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOARDS.INVITATIONS(boardId),
      });

      listIds.forEach((listId) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.BOARDS.LIST_CARDS(listId),
        });
      });

      queryClient.invalidateQueries({
        queryKey: ["card-comments"],
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