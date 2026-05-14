export type AdminUserRole = "user" | "super_admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminBoard = {
  id: string;
  title: string;
  description: string | null;
  background_color: string;
  owner_id: string;
  owner_name: string | null;
  owner_email: string | null;
  members_count: number;
  lists_count: number;
  cards_count: number;
  created_at: string;
  updated_at: string;
};

export type UpdateAdminUserRolePayload = {
  role: AdminUserRole;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};