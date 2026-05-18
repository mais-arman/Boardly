import { io, type Socket } from "socket.io-client";
import { STORAGE_KEYS } from "../../app/constants/storage";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  private getSocketUrl() {
    return import.meta.env.VITE_SOCKET_URL || window.location.origin;
  }

  connect() {
    const nextToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (!nextToken) {
      return null;
    }

    if (this.socket && this.token === nextToken) {
      return this.socket;
    }

    this.disconnect();

    this.token = nextToken;

    this.socket = io(this.getSocketUrl(), {
      transports: ["websocket"],
      query: {
        token: nextToken,
      },
    });

    return this.socket;
  }

  getInstance() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.token = null;
  }
}

export const socketService = new SocketService();

export function getSocket() {
  return socketService.connect();
}

export function disconnectSocket() {
  socketService.disconnect();
}