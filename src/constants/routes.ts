// Application Route Constants

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
  SERVICE_EDIT: (id: string) => `/services/${id}/edit`,
  PAYMENTS: "/payments",
  PAYMENT_RECORD: "/payments/record",
  PAYMENT_PAY_ONLINE: "/payments/pay-online",
  TRACKING: "/tracking",
  REPORTS: "/reports",
  NOTIFICATIONS: "/notifications",
  PROFILE: "/profile",
  SUPPORT: "/support",
  USERS: "/users",
  USER_CREATE: "/users/create",
  USER_EDIT: (id: string) => `/users/${id}/edit`,
  ROLES: "/roles",
  ROLES_CREATE: "/roles/create",
  AUDIT: "/audit",
  INVOICES: "/invoices-receipts",
  ATTENDANCE: "/attendance",
  STAFF_MANAGEMENT: "/staff-management",
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
  ROUTES.PAYMENT_RECORD,
  ROUTES.PAYMENT_PAY_ONLINE,
  ROUTES.TRACKING,
  ROUTES.REPORTS,
  ROUTES.NOTIFICATIONS,
  ROUTES.PROFILE,
  ROUTES.SUPPORT,
  ROUTES.USERS,
  ROUTES.USER_CREATE,
  ROUTES.ROLES,
  ROUTES.ROLES_CREATE,
  ROUTES.AUDIT,
  ROUTES.ATTENDANCE,
] as const;

