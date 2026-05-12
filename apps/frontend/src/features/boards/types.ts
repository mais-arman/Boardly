export type BoardRole = "owner" | "admin" | "editor" | "viewer";

export type Board = {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  role: BoardRole | null;
  members_count: number;
  lists_count: number;
  cards_count: number;
  created_at: string;
  updated_at: string;
};

export type BoardList = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type CardLabel = {
  id: string;
  board_id: string;
  name: string;
  color: string;
};

export type CardAssignee = {
  id: string;
  name: string;
  email: string;
};

export type Card = {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  position: number;
  labels: CardLabel[];
  assignees: CardAssignee[];
  created_at: string;
  updated_at: string;
};

export type Comment = {
  id: string;
  card_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CreateBoardPayload = {
  title: string;
  description?: string | null;
};

export type CreateListPayload = {
  title: string;
};

export type CreateCardPayload = {
  title: string;
  description?: string | null;
  due_date?: string | null;
};

export type UpdateCardPayload = {
  title?: string;
  description?: string | null;
  due_date?: string | null;
};

export type ReorderListsPayload = {
  lists: {
    id: string;
    position: number;
  }[];
};

export type MoveCardPayload = {
  target_list_id: string;
  position: number;
};

export type CreateCommentPayload = {
  content: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ManageableBoardRole = "admin" | "editor" | "viewer";

export type BoardMember = {
  id: string;
  board_id: string;
  user_id: string;
  role: BoardRole;
  created_at: string;
};

export type BoardInvitation = {
  id: string;
  board_id: string;
  invited_by_id: string;
  email: string;
  role: ManageableBoardRole;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  expires_at: string;
  created_at: string;
  responded_at: string | null;
};

export type InviteMemberPayload = {
  email: string;
  role: ManageableBoardRole;
};

export type UpdateMemberRolePayload = {
  role: ManageableBoardRole;
};