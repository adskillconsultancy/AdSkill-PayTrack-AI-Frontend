"use client";

import * as React from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useCompleteFollowUpMutation } from "@/services/api/leads/leadsApi";
import { useConfirm } from "@/hooks/useConfirm";
import type { FollowUpQueueLead } from "../types";

const getPresetIsoString = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface CompleteFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: FollowUpQueueLead | null;
  onSuccess?: () => void;
}

export function CompleteFollowUpModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: CompleteFollowUpModalProps) {
  const { alert } = useConfirm();
  const [completeFollowUp, { isLoading }] = useCompleteFollowUpMutation();

  const [notes, setNotes] = React.useState("");
  const [scheduleNext, setScheduleNext] = React.useState(false);
  const [nextFollowUpDate, setNextFollowUpDate] = React.useState(
    getPresetIsoString(7),
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Reset state when opened with a new lead
  React.useEffect(() => {
    if (isOpen) {
      setNotes("");
      setScheduleNext(false);
      setNextFollowUpDate(getPresetIsoString(7));
      setErrorMessage(null);
    }
  }, [isOpen, lead]);

  // Handle escape key
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

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await completeFollowUp({
        leadId: lead.id,
        data: {
          notes: notes.trim() || undefined,
          nextFollowUpDate:
            scheduleNext && nextFollowUpDate
              ? new Date(nextFollowUpDate).toISOString()
              : null,
        },
      }).unwrap();

      const leadName = lead.fullName;
      onSuccess?.();
      onClose();

      await alert({
        title: "Follow-Up Completed",
        message: scheduleNext
          ? `Follow-up for "${leadName}" logged and next reminder scheduled for ${new Date(
              nextFollowUpDate,
            ).toLocaleDateString()}.`
          : `Follow-up for "${leadName}" marked as done and recorded in daily staff report.`,
        variant: "success",
      });
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Failed to mark follow-up as completed.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg rounded-2xl border border-border/80 bg-card p-6 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Mark Follow-Up as Completed
              </h2>
              <p className="text-xs text-muted-foreground">
                Log completion note for daily report and optionally reschedule.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead Context Pill */}
        <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">
              {lead.fullName}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {lead.phone} {lead.service?.name ? `• ${lead.service.name}` : ""}
            </span>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            {lead.status}
          </span>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Outcome Notes / Remarks
              <span className="text-[10px] text-muted-foreground font-normal">
                (Logged in EOD activity audit)
              </span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spoke with Mohammad on WhatsApp. Answered fee queries, waiting for document scan next week."
              className="w-full rounded-xl border border-border/80 bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Schedule Next Follow-up Toggle */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={scheduleNext}
                onChange={(e) => setScheduleNext(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-xs font-semibold text-foreground">
                Schedule Next Follow-Up Reminder?
              </span>
            </label>

            {scheduleNext && (
              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-primary" />
                    Quick Presets:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNextFollowUpDate(getPresetIsoString(1))}
                      className="rounded-lg border border-border/80 bg-background hover:bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
                      +1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setNextFollowUpDate(getPresetIsoString(3))}
                      className="rounded-lg border border-border/80 bg-background hover:bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setNextFollowUpDate(getPresetIsoString(7))}
                      className="rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary transition-colors cursor-pointer">
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          "modal-reschedule-followup-input",
                        ) as HTMLInputElement;
                        if (input) {
                          input.focus();
                          input.showPicker?.();
                        }
                      }}
                      className="rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 text-[11px] font-bold text-primary transition-colors cursor-pointer flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      Custom Date
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="modal-reschedule-followup-input"
                    type="datetime-local"
                    value={nextFollowUpDate}
                    onClick={(e) => (e.target as any).showPicker?.()}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full rounded-xl border border-border/80 bg-background pl-9 pr-3 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-4 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 text-xs shadow-md">
              {isLoading ? "Saving..." : "Confirm & Save Log"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
