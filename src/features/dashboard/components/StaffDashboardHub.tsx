"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTES } from "@/constants";
import {
  Users,
  Receipt,
  MessageSquare,
  Briefcase,
  User,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common";

export function StaffDashboardHub() {
  const { user } = useAuth();
  const { role } = usePermissions();
  const displayName = user?.preferredName || user?.name || "Team Member";
  const roleDisplay = role ? role.replace(/_/g, " ") : "Consultant";

  const quickActions = [
    {
      title: "Client Case Directory",
      subtitle: "Access and manage all active client files, case intakes, and status notes.",
      href: ROUTES.CLIENTS,
      icon: Users,
      badge: "Assigned Files",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      buttonText: "Open Directory",
      highlight: true,
    },
    {
      title: "Payments & Invoices",
      subtitle: "Review payment transaction schedules, milestone records, and receipts.",
      href: ROUTES.PAYMENTS,
      icon: Receipt,
      badge: "Ledger",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      buttonText: "View Payments",
    },
    {
      title: "Record Offline Payment",
      subtitle: "Log manual cash, bank transfer, or wire deposit on behalf of clients.",
      href: ROUTES.PAYMENT_RECORD,
      icon: Receipt,
      badge: "Intake",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      buttonText: "Record Payment",
    },
    {
      title: "Support Desk & Chat",
      subtitle: "Collaborate and respond to assigned client inquiries and ticket messages.",
      href: ROUTES.SUPPORT,
      icon: MessageSquare,
      badge: "Communications",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      buttonText: "Open Tickets",
    },
    {
      title: "Services Catalog",
      subtitle: "Browse legal offerings, fee category rules, and installment templates.",
      href: ROUTES.SERVICES,
      icon: Briefcase,
      badge: "Programs",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      buttonText: "Browse Services",
    },
    {
      title: "Staff Profile & Security",
      subtitle: "Manage your credentials, notification settings, and two-factor authentication.",
      href: ROUTES.PROFILE,
      icon: User,
      badge: "Settings",
      badgeColor: "bg-muted text-foreground border-border",
      buttonText: "My Account",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>Enterprise Portal</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-bold">{roleDisplay} Workspace</span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted border border-border px-3 py-1 text-[11px] font-bold text-foreground capitalize">
          <span>Role: {roleDisplay.toLowerCase()}</span>
        </span>
      </div>

      {/* 2. WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#F3A712]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F3A712] tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AdSkill Team Workspace</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Manage your assigned client cases, record offline transactions, and communicate directly through the support desk.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={ROUTES.CLIENTS}>
              <Button
                type="button"
                className="gap-2 rounded-2xl bg-[#0a0a0a] text-[#F3A712] hover:bg-[#171717] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs px-4 py-2.5 cursor-pointer shadow-sm"
              >
                <Users className="h-4 w-4" />
                <span>My Client Cases</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Quick Actions & Assigned Routes
          </h2>
          <span className="text-xs text-muted-foreground">Select an area to continue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className={`group rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-md cursor-pointer ${
                  action.highlight
                    ? "border-[#F3A712]/50 bg-gradient-to-b from-card to-[#F3A712]/5"
                    : "border-border bg-card hover:border-border/80"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted text-foreground group-hover:bg-[#0a0a0a] group-hover:text-[#F3A712] transition-colors shadow-2xs">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${action.badgeColor}`}>
                      {action.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-[#F3A712] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {action.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs font-bold text-foreground group-hover:text-[#F3A712] transition-colors">
                  <span>{action.buttonText}</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}