export type UserRole = "user" | "super_admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  name: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
};