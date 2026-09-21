"use client";

import Link from "next/link";
import { useGetDashboardRecentActivityQuery } from "@/services/api/dashboard/dashboardApi";
import { ROUTES } from "@/constants";
import {
  History,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Receipt,
  Lock,
} from "lucide-react";

export function DashboardRecentActivity() {
  const { data: response, isLoading, isError } =
    useGetDashboardRecentActivityQuery({ limit: 6 });
  const activities = response?.data || [];

  const formatTimeAgo = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActionConfig = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("FAIL") || act.includes("REJECT")) {
      return {
        dot: "bg-rose-500",
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        icon: AlertTriangle,
      };
    }
    if (act.includes("PAYMENT") || act.includes("VERIFY")) {
      return {
        dot: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: Receipt,
      };
    }
    if (act.includes("REGISTER") || act.includes("CREATE")) {
      return {
        dot: "bg-purple-500",
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        icon: UserPlus,
      };
    }
    return {
      dot: "bg-blue-500",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: Shield,
    };
  };

  const formatAction = (action: string) => {
    return action
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-500/15 text-slate-600 dark:text-slate-400 ring-1 ring-slate-500/30 shadow-2xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              Operational Audit Activity
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Immutable security, financial & authentication log stream
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.AUDIT}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F3A712] hover:text-[#D97706] dark:hover:text-[#FBBF24] transition-colors"
        >
          <span>Full Audit Log</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-xs text-muted-foreground p-3 rounded-2xl border border-border">
          Unable to load recent activity stream.
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {activities.map((item) => {
            const conf = getActionConfig(item.action);
            const initials = item.actorName
              ? item.actorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
              : "SY";

            return (
              <div
                key={item.id}
                className="group rounded-2xl border border-border/60 bg-muted/20 p-3 flex items-center justify-between gap-3 hover:border-border hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-foreground font-black text-xs border border-border shadow-2xs">
                      {initials}
                    </div>
                    <span
                      className={`absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${conf.dot}`}
                    />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-foreground">
                        {formatAction(item.action)}
                      </span>
                      <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase tracking-wider border ${conf.badge}`}>
                        {item.targetEntity}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground truncate">
                      by <strong className="text-foreground/80">{item.actorName}</strong>
                      {item.actorEmail && item.actorEmail !== item.actorName && (
                        <span> ({item.actorEmail})</span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-muted-foreground shrink-0 bg-card border border-border px-2 py-0.5 rounded-md">
                  {formatTimeAgo(item.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}