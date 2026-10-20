"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  FileText,
  ShieldCheck,
  UserCheck,
  Calendar,
  Sparkles,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Clock,
  Pin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/common";
import { ROUTES } from "@/constants";
import { sanitizeHtml } from "@/lib/sanitize";
import type { ClientDashboardSummary } from "@/types/dashboard.types";

interface ClientStaffDirectivesCardProps {
  summary?: ClientDashboardSummary;
}

const formatDate = (d?: string | null) => {
  if (!d) return "Recently";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
};

export function ClientStaffDirectivesCard({ summary }: ClientStaffDirectivesCardProps) {
  if (!summary?.hasActiveCase) {
    return null;
  }

  const consultantName = summary.assignedConsultant?.name || "Legal Advisory Desk";
  const clientVisibleNotes = summary.clientVisibleNotes?.trim();
  const clientNotes = summary.clientNotes || [];

  const hasDirective = Boolean(clientVisibleNotes);
  const hasTimelineNotes = clientNotes.length > 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5 p-6 sm:p-7 shadow-xs">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner & Attribution */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" />
              <span>Staff Verified • Client Visible</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight mt-0.5">
              Directives from Your Legal Advisory Team
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={ROUTES.SUPPORT}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-border text-foreground hover:bg-muted text-xs font-bold"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span>Clarify with Desk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-5 space-y-4">
        {hasDirective ? (
          <div className="rounded-2xl border border-blue-500/20 bg-background/60 p-5 backdrop-blur-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pb-2 border-b border-border/40">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                <span>Direct instruction from {consultantName}</span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                Official Case Directive
              </span>
            </div>

            {/* Render WYSIWYG HTML safely */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed break-words"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(clientVisibleNotes || ""),
              }}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-foreground">
                  Case Standing Is Fully On Track
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                  Your case file is being actively managed by {consultantName}. No immediate action
                  or extra documentation is currently required from you. Any official directives or
                  instructions will appear right here.
                </p>
              </div>
            </div>

            <Link href={ROUTES.SUPPORT} className="shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Inquire Status
              </Button>
            </Link>
          </div>
        )}

        {/* Client-Visible Case Notes History (if any) */}
        {hasTimelineNotes && (
          <div className="pt-2">
            <div className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-3 flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>Recent Milestone Timeline Directives</span>
            </div>

            <div className="space-y-2.5">
              {clientNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-border/60 bg-card/60 p-3.5 text-xs space-y-1.5 transition-colors hover:border-border"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Pin className="h-3 w-3 text-[#F3A712]" />
                      {note.authorName}
                    </span>
                    <span className="font-mono text-[10px]">{formatDate(note.createdAt)}</span>
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
          </div>
        )}
      </div>
    </div>
  );
}
