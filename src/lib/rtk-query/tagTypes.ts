// RTK Query Cache Tag Types
// All tag types must be registered here centrally.
// Feature endpoint files reference these for providesTags / invalidatesTags.

export const TAG_TYPES = [
  "Auth",
  "User",
  "Role",
  "Service",
  "Client",
  "Case",
  "Document",
  "PaymentPlan",
  "Installment",
  "Payment",
  "Invoice",
  "Receipt",
  "Booking",
  "Tracking",
  "Report",
  "Notification",
  "Dashboard",
  "CaseNote",
  "Support",
  "AuditLog",
] as const;

export type TagType = (typeof TAG_TYPES)[number];
