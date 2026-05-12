export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
  },

  BOARDS: {
    ROOT: "/boards",
    BY_ID: (boardId: string) => `/boards/${boardId}`,
    LISTS: (boardId: string) => `/boards/${boardId}/lists`,
    REORDER_LISTS: (boardId: string) => `/boards/${boardId}/lists/reorder`,

    MEMBERS: (boardId: string) => `/boards/${boardId}/members`,
    MEMBER_BY_ID: (boardId: string, memberId: string) =>
      `/boards/${boardId}/members/${memberId}`,

    INVITATIONS: (boardId: string) => `/boards/${boardId}/invitations`,
    CANCEL_INVITATION: (boardId: string, invitationId: string) =>
      `/boards/${boardId}/invitations/${invitationId}/cancel`,
  },

  LISTS: {
    BY_ID: (listId: string) => `/lists/${listId}`,
    CARDS: (listId: string) => `/lists/${listId}/cards`,
  },

  CARDS: {
    BY_ID: (cardId: string) => `/cards/${cardId}`,
    MOVE: (cardId: string) => `/cards/${cardId}/move`,
    COMMENTS: (cardId: string) => `/cards/${cardId}/comments`,
  },
} as const;