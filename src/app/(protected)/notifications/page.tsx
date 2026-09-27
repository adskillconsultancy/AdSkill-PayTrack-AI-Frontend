"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  Check,
  Search,
  Briefcase,
  CreditCard,
  FileText,
  LifeBuoy,
  Receipt,
  ExternalLink,
  SlidersHorizontal,
  Sparkles,
  Inbox,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button, Input, SkeletonNotificationList } from "@/components/common";
import { NotificationMetricCards } from "@/features/notifications/components";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "@/services/api/notifications/notificationsApi";
import type { NotificationItem, NotificationType } from "@/types/notification.types";

function formatFullDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "Yesterday";
    if (diffDay < 7) return `${diffDay}d ago`;
    return past.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getTypeBadge(type: NotificationType) {
  switch (type) {
    case "CASE":
      return {
        icon: <Briefcase className="h-4 w-4 text-blue-500" />,
        bg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
        label: "Case",
      };
    case "PAYMENT":
      return {
        icon: <CreditCard className="h-4 w-4 text-amber-500" />,
        bg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
        label: "Payment",
      };
    case "DOCUMENT":
      return {
        icon: <FileText className="h-4 w-4 text-teal-500" />,
        bg: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
        label: "Document",
      };
    case "INVOICE":
      return {
        icon: <Receipt className="h-4 w-4 text-emerald-500" />,
        bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        label: "Invoice",
      };
    case "SUPPORT":
      return {
        icon: <LifeBuoy className="h-4 w-4 text-purple-500" />,
        bg: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
        label: "Support",
      };
    default:
      return {
        icon: <Bell className="h-4 w-4 text-primary" />,
        bg: "bg-primary/10 border-primary/20 text-primary",
        label: "System",
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "CASE" | "PAYMENT" | "SUPPORT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Queries
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  const queryFilters = useMemo(() => {
    if (activeTab === "UNREAD") return { isRead: false, limit: 50 };
    if (activeTab === "CASE") return { type: "CASE" as NotificationType, limit: 50 };
    if (activeTab === "PAYMENT") return { type: "PAYMENT" as NotificationType, limit: 50 };
    if (activeTab === "SUPPORT") return { type: "SUPPORT" as NotificationType, limit: 50 };
    return { limit: 50 };
  }, [activeTab]);

  const { data: notificationsData, isLoading } = useGetNotificationsQuery(queryFilters);
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const { data: prefsData } = useGetNotificationPreferencesQuery();
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();

  const rawNotifications: NotificationItem[] = notificationsData?.data || [];

  const summaryStats = useMemo(() => {
    const total = notificationsData?.meta?.total ?? rawNotifications.length;
    const unread = unreadCount;
    const payments = rawNotifications.filter(
      (n) => n.type === "PAYMENT" || n.type === "INVOICE"
    ).length;
    const urgent = rawNotifications.filter(
      (n) =>
        n.priority === "HIGH" ||
        n.priority === "URGENT" ||
        n.type === "CASE" ||
        n.type === "SUPPORT"
    ).length;
    return { total, unread, payments, urgent };
  }, [rawNotifications, notificationsData?.meta?.total, unreadCount]);

  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return rawNotifications;
    const query = searchQuery.toLowerCase();
    return rawNotifications.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
    );
  }, [rawNotifications, searchQuery]);

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Notifications Center"
          description="Stay updated on case progress, payment verifications, invoices, and support threads."
        />

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreferencesOpen(!isPreferencesOpen)}
            className="gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Preferences</span>
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="gap-2 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metric Summary Cards */}
      <NotificationMetricCards stats={summaryStats} isLoading={isLoading} />

      {/* Preferences Panel Accordion */}
      {isPreferencesOpen && (
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-sm animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">Email & Notification Preferences</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control which email alerts are sent to your registered address.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsPreferencesOpen(false)}>
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/60">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={prefsData?.data?.emailOnCaseUpdates ?? true}
                onChange={(e) => updatePreferences({ emailOnCaseUpdates: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              >
              </input>
              <span className="text-xs font-semibold text-foreground">Case Updates & Status</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={prefsData?.data?.emailOnPayments ?? true}
                onChange={(e) => updatePreferences({ emailOnPayments: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              >
              </input>
              <span className="text-xs font-semibold text-foreground">Payment Receipts & Dues</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={prefsData?.data?.emailOnDocuments ?? true}
                onChange={(e) => updatePreferences({ emailOnDocuments: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              >
              </input>
              <span className="text-xs font-semibold text-foreground">Document Reviews</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={prefsData?.data?.emailOnSupport ?? true}
                onChange={(e) => updatePreferences({ emailOnSupport: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              >
              </input>
              <span className="text-xs font-semibold text-foreground">Support Messages</span>
            </label>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("UNREAD")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "UNREAD"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "UNREAD"
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-rose-500/20 text-rose-600"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CASE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "CASE"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Cases
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("PAYMENT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "PAYMENT"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Payments
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("SUPPORT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "SUPPORT"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Support
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Notification List Container */}
      {isLoading ? (
        <SkeletonNotificationList count={6} />
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm p-16 text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
            <Inbox className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No notifications found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No notifications matched your search "${searchQuery}".`
              : "You don't have any notifications in this view."}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden divide-y divide-border/50">
            {filteredNotifications.map((item) => {
              const badge = getTypeBadge(item.type);
              const isHighPriority = item.priority === "HIGH" || item.priority === "URGENT";

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-muted/40 transition-colors cursor-pointer group ${
                    !item.isRead ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  {/* Category Icon */}
                  <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:border-primary/40 transition-colors">
                    {badge.icon}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>

                      {isHighPriority && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600">
                          <ShieldAlert className="h-3 w-3" />
                          <span>Important</span>
                        </span>
                      )}

                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}

                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(item.createdAt)}</span>
                        <span className="hidden sm:inline">({formatFullDate(item.createdAt)})</span>
                      </span>
                    </div>

                    <h4
                      className={`text-sm ${
                        !item.isRead ? "font-bold text-foreground" : "font-medium text-foreground/90"
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-3xl">
                      {item.message}
                    </p>

                    {item.actionUrl && (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                        <span>Go to related record</span>
                        <ExternalLink className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Actions (Mark read / Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkRead(e, item.id)}
                        title="Mark as read"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, item.id)}
                      title="Dismiss notification"
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
