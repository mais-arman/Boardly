import { io, type Socket } from "socket.io-client";
import { STORAGE_KEYS } from "../../app/constants/storage";

let socket: Socket | null = null;
let socketToken: string | null = null;

function getSocketUrl() {
  return import.meta.env.VITE_SOCKET_URL || window.location.origin;
}

export function getSocket() {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    return null;
  }

  if (socket && socketToken === token) {
    return socket;
  }

  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }

  socketToken = token;

  socket = io(getSocketUrl(), {
    transports: ["websocket"],
    query: {
      token,
    },
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = null;
  }
}