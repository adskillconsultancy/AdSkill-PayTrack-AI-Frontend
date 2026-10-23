"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/common";

export function UserWelcomeHub() {
  const { user } = useAuth();
  const displayName = user?.preferredName || user?.name || "Applicant";
  const userEmail = user?.email || "";

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP STATUS BAR & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>Portal</span>
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground font-bold">Applicant Dashboard</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Registered Applicant
          </span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground border border-border">
            {userEmail}
          </span>
        </div>
      </div>

      {/* 2. HERO WELCOME & ONBOARDING CALLOUT */}
      <div className="relative overflow-hidden rounded-3xl border border-[#F3A712]/30 bg-gradient-to-br from-card via-card to-[#F3A712]/5 p-6 sm:p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#F3A712]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F3A712]/15 border border-[#F3A712]/30 px-3 py-0.5 text-xs font-bold text-[#F3A712] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AdSkill Consultancy Client Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Welcome to AdSkill, {displayName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
              Your portal account is active. To protect client confidentiality and deliver deterministic legal advisory, official case dossiers, milestone schedules, and sequential branded invoices are activated once an advisor completes your case onboarding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href={ROUTES.SERVICES}>
              <Button
                type="button"
                className="gap-2 rounded-2xl bg-[#0a0a0a] text-[#F3A712] hover:bg-[#1f1f1f] dark:bg-[#FAF8F5] dark:text-[#0a0a0a] font-bold text-xs sm:text-sm px-5 py-3 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
              >
                <Briefcase className="h-4 w-4" />
                <span>Explore Services</span>
              </Button>
            </Link>

            <Link href={ROUTES.SUPPORT}>
              <Button
                type="button"
                variant="outline"
                className="gap-2 rounded-2xl border-border text-foreground hover:bg-muted font-bold text-xs sm:text-sm px-4 py-3 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>Contact Advisor</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. ONBOARDING ROADMAP / PROGRESS CARDS */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Onboarding Roadmap & Process
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            How your service case and milestone payment schedule are initiated
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Completed
              </span>
            </div>
            <h3 className="font-bold text-xs text-foreground">1. Portal Registration</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Your profile is verified and access to the AdSkill portal has been granted.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-xs">
                2
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Current Step
              </span>
            </div>
            <h3 className="font-bold text-xs text-foreground">2. Initial Consultation</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Meet with your assigned advisor to review qualifications, requirements, and scope.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-muted text-muted-foreground font-bold text-xs">
                3
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </span>
            </div>
            <h3 className="font-bold text-xs text-foreground">3. Case Dossier Opened</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Staff publishes your unique case code, fee breakdown, and retainer agreement.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-muted text-muted-foreground font-bold text-xs">
                4
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </span>
            </div>
            <h3 className="font-bold text-xs text-foreground">4. Milestone Payments</h3>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Pay scheduled milestone installments with one-click Stripe card checkout or wire proofs.
            </p>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS & DIRECT CONTACT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3A712]/15 text-[#F3A712]">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Browse Practice Areas & Services</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore our transparent fee schedules for EB-2 NIW, EB-1A Extraordinary Ability, E-2 Treaty Investor, Family Immigration, and U.S. Corporate Formations.
            </p>
          </div>
          <Link href={ROUTES.SERVICES}>
            <Button variant="subtle" size="sm" className="gap-2 w-full justify-between">
              <span>View Service Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-foreground">Client Communication Desk</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have questions regarding case eligibility, documents, or payment terms? Open a secure support ticket to consult directly with our staff.
            </p>
          </div>
          <Link href={ROUTES.SUPPORT}>
            <Button variant="subtle" size="sm" className="gap-2 w-full justify-between">
              <span>Open Support Desk</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
