import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../shared/realtime/socket";

type UserRealtimeEvent = {
  type: string;
  user_id: string;
  payload: Record<string, unknown>;
};

export function useDashboardRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    function handleUserEvent(event: UserRealtimeEvent) {
      if (
        event.type === "invitation.received" ||
        event.type === "invitation.accepted" ||
        event.type === "invitation.declined"
      ) {
        queryClient.invalidateQueries({ queryKey: ["boards"] });
        queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
      }
    }

    socket.on("user:event", handleUserEvent);

    return () => {
      socket.off("user:event", handleUserEvent);
    };
  }, [queryClient]);
}