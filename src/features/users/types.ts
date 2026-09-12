// 🛡️ Dynamic User Types (100% Database Driven) 🛡️

export type UserRole = string;

export type UserStatus = "Active" | "Inactive" | "Suspended" | "Pending";

export interface UserActivityLog {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress?: string;
}

export interface UserItem {
  id: string;
  userId: string; // e.g. ASK-2026-0001 or USR-XXXXXXXX
  clientId?: string | null;
  name: string;
  preferredName?: string | null;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  whatsapp: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  avatarUrl?: string;
  initials?: string;
  department: string;
  createdAt: string;
  lastActive: string;
  assignedCasesCount?: number;
  twoFactorEnabled: boolean;
  bio?: string;
  activityLogs?: UserActivityLog[];
}

export interface UserSummaryStats {
  totalUsers: number;
  activeUsers: number;
  staffCount: number;
  pendingInvitations: number;
}

export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  whatsapp: string;
  phone?: string;
  department: string;
  sendWelcomeWhatsApp?: boolean;
}
