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

export type CommentUser = {
  id: string;
  name: string;
  email: string;
};

export type Comment = {
  id: string;
  card_id: string;
  user_id: string;
  user?: CommentUser;
  content: string;
  created_at: string;
  updated_at: string;
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

export type MoveCardPayload = {
  target_list_id: string;
  position: number;
};

export type CreateCommentPayload = {
  content: string;
};

export type CreateLabelPayload = {
  name: string;
  color: string;
};

export type ApplyLabelPayload = {
  label_id: string;
};

export type AddAssigneePayload = {
  user_id: string;
};