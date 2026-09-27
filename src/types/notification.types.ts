export type NotificationType = "CASE" | "PAYMENT" | "DOCUMENT" | "INVOICE" | "SUPPORT" | "SYSTEM";
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  entityType?: string | null;
  entityId?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
}

export interface NotificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationPreferences {
  id?: string;
  userId?: string;
  emailOnCaseUpdates: boolean;
  emailOnPayments: boolean;
  emailOnDocuments: boolean;
  emailOnSupport: boolean;
  inAppAlerts: boolean;
}
