// ── RTK Query Cache Tag Types ──────────────────────────
// All tag types must be registered here centrally.
// Feature endpoint files reference these for providesTags / invalidatesTags.

export const TAG_TYPES = [
  "Auth",
  "User",
  "Client",
  "Booking",
  "Payment",
  "Tracking",
  "Report",
  "Notification",
  "Dashboard",
] as const;

export type TagType = (typeof TAG_TYPES)[number];
