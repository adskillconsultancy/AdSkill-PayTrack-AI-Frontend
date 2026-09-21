"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useGetMyCasesQuery } from "@/services/api/clients/clientCasesApi";
import { ROUTES } from "@/constants";
import {
  CalendarRange,
  CreditCard,
  Receipt,
  FileText,
  MessageSquare,
  User,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/common";

export function ClientDashboardHub() {
  const { user } = useAuth();
  const { data: casesResponse, isLoading: isCasesLoading } = useGetMyCasesQuery();
  const myCases = casesResponse?.data || [];

  const displayName = user?.preferredName || user?.name || "Client";
  const clientId = user?.clientId || "ASK-CLIENT";

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const quickActions = [
    {
      title: "Payment Schedule",
      subtitle: "View your milestone plan, upcoming installment dates, and payment history.",
      href: ROUTES.PAYMENTS,
      icon: CalendarRange,
      badge: "Installments",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      buttonText: "View Schedule",
    },
    {
      title: "Pay Online",
      subtitle: "Quickly and securely complete your installment with instant card payment.",
      href: `${ROUTES.PAYMENTS}?action=pay`,
      icon: CreditCard,
      badge: "Instant / Card",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      buttonText: "Pay Online",
      highlight: true,
    },
    {
      title: "Submit Offline Payment",
      subtitle: "Paid via bank deposit or wire? Upload your receipt or slip for verification.",
      href: ROUTES.PAYMENT_RECORD,
      icon: Receipt,
      badge: "Bank Transfer",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      buttonText: "Submit Proof",
    },
    {
      title: "Invoices & Receipts",
      subtitle: "Download official sequential invoices (INV-XXXX) and payment vouchers.",
      href: `${ROUTES.PAYMENTS}?tab=invoices`,
      icon: FileText,
      badge: "Documents",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      buttonText: "View Invoices",
    },
    {
      title: "Consultant Support",
      subtitle: "Direct message your assigned case manager or submit inquiries to the desk.",
      href: ROUTES.SUPPORT,
      icon: MessageSquare,
      badge: "Messenger",
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      buttonText: "Open Chat",
    },
    {
      title: "Profile & Security",
      subtitle: "Manage your contact address, phone, emergency details, and password.",
      href: ROUTES.PROFILE,
      icon: User,
      badge: "Account",
      badgeColor: "bg-muted text-foreground border-border",
      buttonText: "Edit Profile",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP BREADCRUMB & HEADER */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>Client Portal</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-bold">My Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active Account
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono font-bold text-muted-foreground border border-border">
            {clientId}
          </span>
        </div>
      </div>

      {/* 2. WELCOME BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#F3A712]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F3A712] tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AdSkill Client Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Welcome back, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Access your payment milestones, billing receipts, offline verifications, and case consultant communications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`${ROUTES.PAYMENTS}?action=pay`}>
              <Button
                type="button"
                className="gap-2 rounded-2xl bg-[#0a0a0a] text-[#F3A712] hover:bg-[#171717] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs px-4 py-2.5 cursor-pointer shadow-sm"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay Next Due</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID (ASSIGNED ROUTES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Quick Actions & Portal Directory
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

      {/* 4. ACTIVE CASES & ADVISORY SECTION (IF CLIENT HAS CASES) */}
      {myCases.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/70">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">My Advisory Programs</h3>
                <p className="text-[11px] text-muted-foreground">
                  Your registered cases and payment track records
                </p>
              </div>
            </div>

            <Link
              href={ROUTES.PAYMENTS}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#F3A712] hover:underline"
            >
              <span>View Payment Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myCases.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground truncate">
                    {c.serviceNameSnapshot || c.service?.name || "Advisory Program"}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-bold text-foreground">
                    {c.caseCode}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Status: <strong className="text-foreground capitalize">{c.caseStatus.toLowerCase()}</strong></span>
                  </div>
                  <span>•</span>
                  <div>
                    <span>Standing: <strong className="text-foreground capitalize">{c.financialStatus.toLowerCase().replace(/_/g, " ")}</strong></span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {c.destinationCountry ? `Destination: ${c.destinationCountry}` : "Case active"}
                  </span>
                  <Link
                    href={`${ROUTES.PAYMENTS}?caseId=${c.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F3A712] hover:underline"
                  >
                    <span>Installments</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TRUST & SECURITY FOOTER NOTICE */}
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Every transaction is recorded into an immutable audit trail with official sequential receipts. Need help?
          </span>
        </div>
        <Link
          href={ROUTES.SUPPORT}
          className="font-bold text-[#F3A712] hover:underline shrink-0"
        >
          Contact Support Desk $ightarrow$
        </Link>
      </div>
    </div>
  );
}