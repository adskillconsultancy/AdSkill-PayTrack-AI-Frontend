"use client";

import Link from "next/link";
import { Flame, Clock, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common";
import { ROUTES } from "@/constants";
import { useGetFollowUpQueueQuery } from "@/services/api/leads/leadsApi";

export function DashboardFollowUpAlert() {
  const { data: queueResponse } = useGetFollowUpQueueQuery(
    { page: 1, limit: 1 },
    { pollingInterval: 30000 },
  );

  const counts = queueResponse?.data?.counts || {
    overdue: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    total: 0,
  };

  const hasUrgentFollowUps = counts.overdue > 0 || counts.today > 0;

  if (!hasUrgentFollowUps) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            {counts.overdue > 0 ? (
              <Flame className="h-6 w-6 text-red-500 animate-pulse" />
            ) : (
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Client Follow-Up Reminders
              </h3>
              {counts.overdue > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  <Flame className="h-3 w-3" />
                  {counts.overdue} Overdue
                </span>
              )}
              {counts.today > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  {counts.today} Due Today
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You have prospective client leads requiring follow-up contact today. Check their dossier and log call outcomes to keep deal momentum active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={ROUTES.LEADS_FOLLOW_UP}>
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span>Open Follow-Up Queue</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
