import { io, type Socket } from "socket.io-client";
import { STORAGE_KEYS } from "../../app/constants/storage";

let socket: Socket | null = null;

export function getSocket() {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ["websocket"],
      query: {
        token,
      },
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}