"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Flame,
  Clock,
  Calendar,
  ArrowRight,
  X,
  PhoneCall,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common";
import { ROUTES } from "@/constants";

interface DashboardFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  counts: {
    overdue: number;
    today: number;
    upcoming: number;
    completed: number;
    total: number;
  };
}

export function DashboardFollowUpModal({
  isOpen,
  onClose,
  counts,
}: DashboardFollowUpModalProps) {
  const router = useRouter();

  // Handle escape key & scroll lock
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenQueue = () => {
    onClose();
    router.push(ROUTES.LEADS_FOLLOW_UP);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-card p-6 sm:p-7 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Glow ambient background accents */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 shadow-xs">
              {counts.overdue > 0 ? (
                <Flame className="h-6 w-6 text-red-500 animate-pulse" />
              ) : (
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  Client Follow-Up Reminders
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  Action Required
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Priority prospective client leads waiting for contact
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close reminder modal"
            className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Urgency Summary Cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Overdue Card */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              counts.overdue > 0
                ? "border-red-500/30 bg-red-500/5 dark:bg-red-950/20 shadow-xs"
                : "border-border/60 bg-muted/20 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Overdue
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-500">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-600 dark:text-red-400">
                {counts.overdue}
              </span>
              <span className="text-xs font-medium text-red-700/80 dark:text-red-400/80">
                Leads overdue
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Missed schedule date • Requires immediate call
            </p>
          </div>

          {/* Due Today Card */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              counts.today > 0
                ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs"
                : "border-border/60 bg-muted/20 opacity-70"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Due Today
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {counts.today}
              </span>
              <span className="text-xs font-medium text-amber-700/80 dark:text-amber-400/80">
                Leads due today
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Scheduled for today • Keep deal momentum active
            </p>
          </div>
        </div>

        {/* Info Callout */}
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mt-0.5">
            <PhoneCall className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              Proactive Outreach Recommendation
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              You have prospective client leads requiring follow-up contact today. Check their dossier and log call outcomes to keep deal momentum active.
            </p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            onClick={handleOpenQueue}
            className="w-full sm:w-auto gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-10 px-6 cursor-pointer shadow-md transition-all hover:shadow-lg"
          >
            <Calendar className="h-4 w-4" />
            <span>Open Follow-Up Queue</span>
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
