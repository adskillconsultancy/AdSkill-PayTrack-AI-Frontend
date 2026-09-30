"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useClockOutMutation } from "@/services/api/attendance/attendanceApi";

interface ClockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClockOutModal({ isOpen, onClose, onSuccess }: ClockOutModalProps) {
  const [eodNotes, setEodNotes] = React.useState("");
  const [mounted, setMounted] = React.useState(false);
  const [clockOut, { isLoading }] = useClockOutMutation();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and listen for Escape key when open
  React.useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clockOut({ eodNotes: eodNotes.trim() || undefined }).unwrap();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      alert(apiErr?.data?.message || "Failed to clock out");
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Complete Shift / Clock Out"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-lg rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
              <LogOut className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0a0a0a]">Complete Shift / Clock Out</h3>
              <p className="text-xs text-[#64748B] font-medium">Record hours and submit daily accomplishments</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F1EFEA] text-[#94A3B8] hover:text-[#0a0a0a] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0a0a0a] flex items-center justify-between">
              <span>What did you accomplish today? (Optional)</span>
              <span className="text-[11px] font-semibold text-[#D97706] flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Powers AI Daily Digest
              </span>
            </label>
            <textarea
              rows={4}
              value={eodNotes}
              onChange={(e) => setEodNotes(e.target.value)}
              placeholder="e.g.&#10;• Completed intake review for Client Mohammad Rahim&#10;• Followed up on $2,500 pending invoice payment&#10;• Submitted case documentation package"
              className="w-full p-3.5 rounded-xl border border-[#EAE6DF] bg-white text-sm text-[#0a0a0a] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FEF3C7]/40 border border-[#FEF3C7] text-xs text-[#92400E] flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
            <p>
              Your bullet points are aggregated into the daily team briefing for management oversight and client service tracking.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoading ? "Clocking Out..." : "Confirm & Clock Out"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
