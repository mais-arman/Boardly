export const QUERY_KEYS = {
  AUTH: {
    ME: ["auth", "me"] as const,
  },

  BOARDS: {
    ALL: ["boards"] as const,
    DETAIL: (boardId: string | undefined) => ["board", boardId] as const,
    LISTS: (boardId: string | undefined) => ["board-lists", boardId] as const,
    LIST_CARDS: (listId: string | undefined) => ["list-cards", listId] as const,
    CARD_COMMENTS: (cardId: string | undefined) =>
      ["card-comments", cardId] as const,
    LABELS: (boardId: string | undefined) => ["board-labels", boardId] as const,
    MEMBERS: (boardId: string | undefined) =>
      ["board-members", boardId] as const,
    INVITATIONS: (boardId: string | undefined) =>
      ["board-invitations", boardId] as const,
  },

  DASHBOARD: {
    MY_INVITATIONS: ["my-invitations"] as const,
  },

  ADMIN: {
    USERS: ["admin", "users"] as const,
    BOARDS: ["admin", "boards"] as const,
  },
} as const;