import type { Board } from "../types";

export function useBoardPermissions(board: Board | undefined) {
  const role = board?.role || "viewer";

  return {
    role,

    isOwner: role === "owner",
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isViewer: role === "viewer",

    canView: Boolean(board),

    canEditBoard: role === "owner" || role === "admin",

    canManageMembers: role === "owner" || role === "admin",

    canManageLists:
      role === "owner" || role === "admin" || role === "editor",

    canManageCards:
      role === "owner" || role === "admin" || role === "editor",

    canComment:
      role === "owner" || role === "admin" || role === "editor",

    canDeleteBoard: role === "owner",
  };
}