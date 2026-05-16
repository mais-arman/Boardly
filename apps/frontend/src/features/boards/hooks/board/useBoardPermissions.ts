import type { Board, BoardRole } from "../../types";

function isEditorRole(role: BoardRole) {
  return role === "owner" || role === "admin" || role === "editor";
}

function isManagerRole(role: BoardRole) {
  return role === "owner" || role === "admin";
}

export function useBoardPermissions(board: Board | undefined) {
  const role: BoardRole = board?.role || "viewer";

  return {
    role,

    isOwner: role === "owner",
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isViewer: role === "viewer",

    canView: Boolean(board),

    canEditBoard: isManagerRole(role),

    canManageMembers: isManagerRole(role),

    canManageLists: isEditorRole(role),

    canManageCards: isEditorRole(role),

    canComment: isEditorRole(role),

    canDeleteBoard: role === "owner",
  };
}