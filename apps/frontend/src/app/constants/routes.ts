export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_EMAIL: "/verify-email",
  DASHBOARD: "/dashboard",
  BOARD: "/boards/:boardId",
  PROFILE: "/profile",
  ADMIN: "/admin",
} as const;

export function getBoardPath(boardId: string) {
  return `/boards/${boardId}`;
}