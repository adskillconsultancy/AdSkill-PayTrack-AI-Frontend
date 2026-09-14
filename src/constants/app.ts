// ── Application Constants ──────────────────────────────

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "AdSkill PayTrack AI";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Auto-switches: uses live API in production, local API in development
export const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_LIVE_API_URL || "https://apiadskill-pay-track.vercel.app/api/v1"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
