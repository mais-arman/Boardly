import type { User } from "../types";
import type { Board } from "../../boards/types";

export function isSuperAdmin(user: User | null) {
  return user?.role === "super_admin";
}

export function canManageBoard(board: Board) {
  return board.role === "owner" || board.role === "admin";
}

export function canEditBoard(board: Board) {
  return (
    board.role === "owner" ||
    board.role === "admin" ||
    board.role === "editor"
  );
}

export function canDeleteBoard(board: Board) {
  return board.role === "owner";
}

export function canViewOnly(board: Board) {
  return board.role === "viewer";
}