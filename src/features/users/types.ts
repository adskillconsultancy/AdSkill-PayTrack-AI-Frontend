export type UserRole =
  | "Super Admin"
  | "Admin"
  | "Consultant"
  | "Accountant"
  | "Support"
  | "Client";

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
  userId: string; // e.g. USR-2026-101
  name: string;
  username: string; // e.g. @patel_admin
  email: string;
  role: UserRole;
  status: UserStatus;
  whatsapp: string; // e.g. +1 416 555 0100
  phone?: string;
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
