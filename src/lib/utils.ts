import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into an explicit date string: "September 15, 2026"
 */
export function formatExplicitDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date and time into an explicit string: "September 15, 2026, 3:30 PM"
 */
export function formatExplicitDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Formats currency with both symbol and ISO currency code: "$1,500.00 USD"
 */
export function formatCurrencyWithCode(
  amount: number | string | null | undefined,
  currency: string = "USD",
): string {
  const val = Number(amount) || 0;
  const curr = (currency || "USD").toUpperCase();
  const validCurr = curr.length === 3 ? curr : "USD";
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: validCurr,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
  return `${formatted} ${curr}`;
}

/**
 * Formats a date for HTML input[type="date"]: "YYYY-MM-DD"
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
