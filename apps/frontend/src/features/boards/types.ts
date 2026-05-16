export type BoardRole = "owner" | "admin" | "editor" | "viewer";

export type ManageableBoardRole = "admin" | "editor" | "viewer";

export type Board = {
  id: string;
  title: string;
  description: string | null;
  background_color: string;
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

export type BoardMemberUser = {
  id: string;
  name: string;
  email: string;
};

export type BoardMember = {
  id: string;
  board_id: string;
  user_id: string;
  role: BoardRole;
  user: BoardMemberUser;
  created_at: string;
};

export type BoardInvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"
  | "expired";

export type BoardInvitation = {
  id: string;
  board_id: string;
  invited_by_id: string;
  email: string;
  role: ManageableBoardRole;
  status: BoardInvitationStatus;
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  board_title: string | null;
  invited_by_name: string | null;
  invited_by_email: string | null;
};

export type CreateBoardPayload = {
  title: string;
  description?: string | null;
  background_color?: string;
};

export type UpdateBoardPayload = {
  title?: string;
  description?: string | null;
  background_color?: string;
};

export type CreateListPayload = {
  title: string;
};

export type UpdateListPayload = {
  title: string;
};

export type ReorderListsPayload = {
  lists: {
    id: string;
    position: number;
  }[];
};

export type InviteMemberPayload = {
  email: string;
  role: ManageableBoardRole;
};

export type UpdateMemberRolePayload = {
  role: ManageableBoardRole;
};