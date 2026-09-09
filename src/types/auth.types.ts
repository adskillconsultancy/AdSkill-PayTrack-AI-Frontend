// ─── Authentication Types ────────────────────────────────────────────────────

export interface UserRole {
  id: string;
  name: string;
}

export interface User {
  id: string;
  clientId?: string | null;
  name: string;
  preferredName?: string | null;
  email: string;
  avatar?: string;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  status?: string;
  isMfaEnabled?: boolean;
  roleId?: string;
  role: UserRole;
  permissions?: string[];
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirmation: string;
}
