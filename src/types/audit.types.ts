// Audit Log Types

export interface AuditLogActor {
  id: string;
  name: string;
  email: string;
  role: { name: string };
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetEntity: string;
  targetId: string;
  beforeValue: Record<string, unknown> | null;
  afterValue: Record<string, unknown> | null;
  reason: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: AuditLogActor | null;
}

export interface AuditLogFilters {
  searchTerm?: string;
  actorEmail?: string;
  action?: string;
  targetEntity?: string;
  targetId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
