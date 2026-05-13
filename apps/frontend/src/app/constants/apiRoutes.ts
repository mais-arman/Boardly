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

    LABELS: (boardId: string) => `/boards/${boardId}/labels`,
  },

  LISTS: {
    BY_ID: (listId: string) => `/lists/${listId}`,
    CARDS: (listId: string) => `/lists/${listId}/cards`,
  },

  CARDS: {
    BY_ID: (cardId: string) => `/cards/${cardId}`,
    MOVE: (cardId: string) => `/cards/${cardId}/move`,
    COMMENTS: (cardId: string) => `/cards/${cardId}/comments`,

    ASSIGNEES: (cardId: string) => `/cards/${cardId}/assignees`,
    ASSIGNEE_BY_ID: (cardId: string, userId: string) =>
      `/cards/${cardId}/assignees/${userId}`,

    LABELS: (cardId: string) => `/cards/${cardId}/labels`,
    LABEL_BY_ID: (cardId: string, labelId: string) =>
      `/cards/${cardId}/labels/${labelId}`,
  },
  ADMIN: {
    USERS: "/admin/users",
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    BOARDS: "/admin/boards",
    BOARD_BY_ID: (boardId: string) => `/admin/boards/${boardId}`,
  },
  INVITATIONS: {
    MY: "/invitations/me",
    PREVIEW: (token: string) => `/invitations/${token}`,
    ACCEPT: (token: string) => `/invitations/${token}/accept`,
    DECLINE: (token: string) => `/invitations/${token}/decline`,
    ACCEPT_MY: (invitationId: string) =>
      `/invitations/me/${invitationId}/accept`,
    DECLINE_MY: (invitationId: string) =>
      `/invitations/me/${invitationId}/decline`,
  },
} as const;