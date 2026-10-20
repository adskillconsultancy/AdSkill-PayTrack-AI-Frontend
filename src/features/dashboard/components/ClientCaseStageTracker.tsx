"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  PauseCircle,
  XCircle,
  UserCheck,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pin,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/common";
import { ROUTES } from "@/constants";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ClientDashboardSummary } from "@/types/dashboard.types";

interface ClientCaseStageTrackerProps {
  summary?: ClientDashboardSummary;
}

interface StageStep {
  step: number;
  id: string;
  title: string;
  subtitle: string;
}

const STAGES: StageStep[] = [
  {
    step: 1,
    id: "INTAKE",
    title: "Intake & Retainer",
    subtitle: "Agreement & Onboarding",
  },
  {
    step: 2,
    id: "REVIEW",
    title: "Document Curation",
    subtitle: "Evidence & Legal Review",
  },
  {
    step: 3,
    id: "PROCESSING",
    title: "Active Filing",
    subtitle: "Agency & Petition Submission",
  },
  {
    step: 4,
    id: "COMPLETED",
    title: "Adjudication",
    subtitle: "Final Decision & Resolution",
  },
];

const formatDate = (d?: string | null) => {
  if (!d) return "Recently";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date(d));
};

export function ClientCaseStageTracker({ summary }: ClientCaseStageTrackerProps) {
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [showOlderNotes, setShowOlderNotes] = React.useState(false);

  if (!summary?.hasActiveCase) {
    return null;
  }

  const rawStatus = (summary.caseStatus || "INTAKE").toUpperCase();

  // Determine current active stage index (1-based)
  let currentStep = 1;
  let isSpecialStatus = false;
  let specialStatusLabel = "";
  let specialStatusDescription = "";

  if (rawStatus === "COMPLETED") {
    currentStep = 4;
  } else if (rawStatus === "ON_HOLD") {
    currentStep = 2;
    isSpecialStatus = true;
    specialStatusLabel = "Case Standing On Hold";
    specialStatusDescription =
      "Your case processing is temporarily on hold pending required client clarification or scheduled review with your legal team.";
  } else if (rawStatus === "CANCELLED") {
    currentStep = 1;
    isSpecialStatus = true;
    specialStatusLabel = "Case Terminated / Inactive";
    specialStatusDescription =
      "This file has been closed. Please contact our support desk if you believe this is in error.";
  } else if (rawStatus === "ACTIVE") {
    const percentPaid =
      summary.totalProfessionalFee > 0
        ? Math.round((summary.totalPaid / summary.totalProfessionalFee) * 100)
        : 0;

    if (percentPaid >= 60) {
      currentStep = 3;
    } else {
      currentStep = 2;
    }
  } else {
    currentStep = 1;
  }

  // Clear, clean percentages (25%, 50%, 75%, 100%)
  const progressPercentage =
    rawStatus === "COMPLETED"
      ? 100
      : currentStep === 1
      ? 25
      : currentStep === 2
      ? 50
      : currentStep === 3
      ? 75
      : 100;

  const consultant = summary.assignedConsultant;
  const consultantName = consultant?.name || "Assigned Legal Team";

  // Initials for avatar
  const initials = consultantName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "LS";

  // Check for directives
  const primaryNote = summary.clientVisibleNotes?.trim() || "";
  const timelineNotes = summary.clientNotes || [];

  // Determine latest directive to highlight
  const hasPrimaryNote = Boolean(primaryNote);
  const latestTimelineNote = timelineNotes.length > 0 ? timelineNotes[0] : null;
  const olderTimelineNotes = hasPrimaryNote ? timelineNotes : timelineNotes.slice(1);

  const activeDirectiveContent = hasPrimaryNote
    ? primaryNote
    : latestTimelineNote
    ? latestTimelineNote.content
    : "";

  const activeDirectiveAuthor = hasPrimaryNote
    ? consultantName
    : latestTimelineNote
    ? latestTimelineNote.authorName
    : consultantName;

  const activeDirectiveDate = !hasPrimaryNote && latestTimelineNote
    ? formatDate(latestTimelineNote.createdAt)
    : "Active Directive";

  const hasAnyDirective = Boolean(activeDirectiveContent);

  const handleCopyCaseCode = () => {
    if (!summary.caseCode) return;
    navigator.clipboard.writeText(summary.caseCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all">
      {/* Decorative subtle ambient highlights */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-56 w-56 rounded-full bg-[#F3A712]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-56 w-56 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* TOP HEADER: SERVICE INFO & ASSIGNED SPECIALIST */}
      <div className="p-6 sm:p-7 border-b border-border/70 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Program, Code, Status */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Official Case Standing & Lifecycle
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {summary.serviceName || "Legal Advisory Program"}
            </h2>

            <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
              {/* Case Code Pill with Copy Action */}
              <button
                type="button"
                onClick={handleCopyCaseCode}
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted/80 hover:bg-muted px-2.5 py-1 text-xs font-mono font-bold text-foreground border border-border/80 transition-colors cursor-pointer group"
                title="Click to copy Case Reference"
              >
                <span className="text-muted-foreground font-normal">Ref:</span>
                <span>{summary.caseCode || "ASK-CASE"}</span>
                {copiedCode ? (
                  <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </button>

              {/* Status Pill */}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border",
                  rawStatus === "COMPLETED"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                    : rawStatus === "ON_HOLD"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                    : rawStatus === "CANCELLED"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    rawStatus === "COMPLETED"
                      ? "bg-emerald-500"
                      : rawStatus === "ON_HOLD"
                      ? "bg-amber-500"
                      : rawStatus === "CANCELLED"
                      ? "bg-rose-500"
                      : "bg-blue-500 animate-pulse"
                  )}
                />
                <span>
                  {rawStatus === "COMPLETED"
                    ? "Case Completed & Approved"
                    : rawStatus === "ON_HOLD"
                    ? "Case On Hold"
                    : rawStatus === "CANCELLED"
                    ? "Case Closed"
                    : "Active Processing"}
                </span>
              </span>

              {summary.serviceCategory && (
                <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40 uppercase">
                  {summary.serviceCategory}
                </span>
              )}
            </div>
          </div>

          {/* Right: Assigned Specialist Card */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-background/90 p-3.5 sm:px-4.5 shadow-xs backdrop-blur-xs self-start lg:self-center">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm shadow-xs">
              {initials}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Assigned Case Specialist
                </span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" title="Online & Active" />
              </div>

              <div className="text-sm font-bold text-foreground truncate">{consultantName}</div>

              <div className="flex items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                {consultant?.email && (
                  <a
                    href={`mailto:${consultant.email}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1 transition-colors"
                    title={`Email ${consultantName}`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Email</span>
                  </a>
                )}
                {consultant?.phone && (
                  <a
                    href={`tel:${consultant.phone}`}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                    title={`Call ${consultantName}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-[11px]">{consultant.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL STATUS ALERT BANNER (If ON_HOLD or CANCELLED) */}
      {isSpecialStatus && (
        <div
          className={cn(
            "px-6 py-3.5 border-b flex items-center gap-3",
            rawStatus === "ON_HOLD"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200"
              : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200"
          )}
        >
          {rawStatus === "ON_HOLD" ? (
            <PauseCircle className="h-5 w-5 text-amber-600 shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <div className="text-xs leading-normal">
            <span className="font-bold mr-1.5">{specialStatusLabel}:</span>
            <span className="opacity-90">{specialStatusDescription}</span>
          </div>
        </div>
      )}

      {/* MIDDLE SECTION: CLEAN LINEAR STEPPER */}
      <div className="p-6 sm:p-7 space-y-5">
        {/* Step Status & Metric Row */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Clock className="h-4 w-4 text-[#F3A712]" />
            <span>
              Stage {currentStep} of {STAGES.length}:{" "}
              <span className="text-[#F3A712] font-black">{STAGES[currentStep - 1]?.title}</span>
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-bold text-foreground border border-border">
            <span>{progressPercentage}% Completed</span>
          </div>
        </div>

        {/* Linear Stepper Track & Nodes */}
        <div className="relative pt-2 pb-1">
          {/* Background Track Line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full" />

          {/* Active Filled Track Line */}
          <div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-blue-500 via-[#F3A712] to-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{
              width:
                currentStep === 1
                  ? "12.5%"
                  : currentStep === 2
                  ? "50%"
                  : currentStep === 3
                  ? "87.5%"
                  : "100%",
            }}
          />

          {/* Stepper Nodes Grid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2">
            {STAGES.map((stage) => {
              const isPassed = stage.step < currentStep || rawStatus === "COMPLETED";
              const isCurrent = stage.step === currentStep && rawStatus !== "COMPLETED";
              const isUpcoming = stage.step > currentStep && rawStatus !== "COMPLETED";

              return (
                <div key={stage.id} className="flex flex-col items-start sm:items-center text-left sm:text-center space-y-2">
                  {/* Step Node Icon / Number */}
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition-all duration-300",
                      isPassed
                        ? "bg-emerald-500 text-white shadow-xs ring-4 ring-emerald-500/20"
                        : isCurrent
                        ? "bg-[#F3A712] text-black shadow-md ring-4 ring-[#F3A712]/30 scale-110"
                        : "bg-muted text-muted-foreground border border-border"
                    )}
                  >
                    {isPassed ? <CheckCircle2 className="h-5 w-5" /> : stage.step}
                  </div>

                  {/* Step Title & Subtitle */}
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                      {stage.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-tight hidden sm:block">
                      {stage.subtitle}
                    </div>
                    <div>
                      <span
                        className={cn(
                          "inline-block text-[10px] font-bold rounded-full px-2 py-0.2 mt-0.5",
                          isPassed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isCurrent
                            ? "text-[#F3A712] font-black uppercase tracking-wider"
                            : "text-muted-foreground"
                        )}
                      >
                        {isPassed ? "Completed" : isCurrent ? "• In Progress" : "Upcoming"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: OFFICIAL STAFF DIRECTIVES BULLETIN */}
      <div className="px-6 py-5 sm:px-7 sm:py-6 bg-muted/20 border-t border-border/70">
        {hasAnyDirective ? (
          <div className="space-y-4">
            {/* Active Highlighted Directive Box */}
            <div className="rounded-2xl border border-blue-500/30 bg-card p-5 shadow-xs relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">
                      Directive from {activeDirectiveAuthor}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {activeDirectiveDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    Client Visible
                  </span>
                  <Link href={ROUTES.SUPPORT}>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs font-bold px-2.5 rounded-lg border-border hover:bg-muted"
                    >
                      <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
                      Reply on Desk
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Directive Body Content */}
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed pt-3 break-words"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(activeDirectiveContent),
                }}
              />
            </div>

            {/* Expandable Older Updates (if any exist) */}
            {olderTimelineNotes.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowOlderNotes(!showOlderNotes)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <span>Previous case directives ({olderTimelineNotes.length})</span>
                  {showOlderNotes ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {showOlderNotes && (
                  <div className="mt-3 space-y-2">
                    {olderTimelineNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-border/60 bg-card p-3 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Pin className="h-3 w-3 text-muted-foreground" />
                            {note.authorName}
                          </span>
                          <span className="font-mono text-[10px]">
                            {formatDate(note.createdAt)}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/80 leading-normal"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(note.content),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Reassuring clean state when no directives exist */
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>
                Your case file is actively on track with <strong className="text-foreground">{consultantName}</strong>. No immediate client action or additional documents required at this time.
              </span>
            </div>

            <Link href={ROUTES.SUPPORT} className="shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Inquire Status
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
