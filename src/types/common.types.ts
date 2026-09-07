// ── Common Shared Types ────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type Theme = "light" | "dark" | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  read: boolean;
  createdAt: string;
}
