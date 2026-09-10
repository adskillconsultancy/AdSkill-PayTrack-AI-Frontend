// ── Application Route Constants ────────────────────────

export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  ADVISORY: "/advisory",
  PRICING: "/pricing",
  CONTACT: "/contact",
  PRIVACY_POLICY: "/privacy-policy",
  TERMS: "/terms-and-conditions",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Protected
  DASHBOARD: "/dashboard",
  CLIENTS: "/clients",
  CLIENT_CREATE: "/clients/create",
  SERVICES: "/services",
  SERVICE_CREATE: "/services/create",
  PAYMENTS: "/payments",
  TRACKING: "/tracking",
  REPORTS: "/reports",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  USERS: "/users",
  USER_CREATE: "/users/create",
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.ADVISORY,
  ROUTES.PRICING,
  ROUTES.CONTACT,
  ROUTES.PRIVACY_POLICY,
  ROUTES.TERMS,
] as const;

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.CLIENTS,
  ROUTES.CLIENT_CREATE,
  ROUTES.SERVICES,
  ROUTES.SERVICE_CREATE,
  ROUTES.PAYMENTS,
  ROUTES.TRACKING,
  ROUTES.REPORTS,
  ROUTES.NOTIFICATIONS,
  ROUTES.PROFILE,
  ROUTES.SETTINGS,
  ROUTES.USERS,
  ROUTES.USER_CREATE,
] as const;
