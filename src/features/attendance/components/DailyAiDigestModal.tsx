"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  Clock,
  Users,
  DollarSign,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  useGetTodayDigestQuery,
  useGenerateDigestMutation,
} from "@/services/api/attendance/attendanceApi";
import { cn } from "@/lib/utils";

interface DailyAiDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyAiDigestModal({ isOpen, onClose }: DailyAiDigestModalProps) {
  const { data: digestResponse, isLoading, refetch } = useGetTodayDigestQuery(undefined, {
    skip: !isOpen,
  });
  const [generateDigest, { isLoading: isGenerating }] = useGenerateDigestMutation();
  const [mounted, setMounted] = React.useState(false);

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

  const digest = digestResponse?.data;

  const handleRegenerate = async () => {
    try {
      await generateDigest({}).unwrap();
      refetch();
    } catch {
      alert("Failed to refresh digest");
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Executive Daily Digest"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-[#EAE6DF] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#EAE6DF] bg-[#FAF8F5]/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-[#0a0a0a] tracking-tight">
                  AI Executive Daily Digest
                </h3>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  Live Briefing
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium mt-1">
                <Calendar className="h-3.5 w-3.5 text-[#94A3B8]" />
                <span>{currentDateFormatted}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating || isLoading}
              className="h-9 gap-1.5 text-xs font-bold bg-white hover:bg-[#FAF8F5] border-[#EAE6DF]"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-[#D97706]", isGenerating && "animate-spin")} />
              <span className="hidden sm:inline">{isGenerating ? "Synthesizing..." : "Refresh"}</span>
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EAE6DF] text-[#64748B] hover:text-[#0a0a0a] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Top 3 High-Impact Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#7E22CE] shadow-2xs">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">Work Logged</span>
                <div className="text-lg font-black text-[#0a0a0a]">
                  {digest ? `${digest.totalHoursLogged} hrs` : "0 hrs"}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0284C7] shadow-2xs">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">Active Staff</span>
                <div className="text-lg font-black text-[#0a0a0a]">
                  {digest ? `${digest.activeUsersCount} on duty` : "0 on duty"}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#059669] shadow-2xs">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">Payments Volume</span>
                <div className="text-lg font-black text-[#0a0a0a]">
                  {digest
                    ? `$${Number(digest.paymentsCollected).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : "$0.00"}
                </div>
              </div>
            </div>
          </div>

          {/* Formatted Intelligence Report Container */}
          <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5]/60 p-4 sm:p-5">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-center">
                <RefreshCw className="h-6 w-6 animate-spin text-[#D97706]" />
                <span className="text-xs font-bold text-[#64748B]">Synthesizing today's team shift data...</span>
              </div>
            ) : digest?.summaryContent ? (
              <DigestMarkdown content={digest.summaryContent} />
            ) : (
              <div className="py-10 text-center space-y-2">
                <Calendar className="h-7 w-7 text-[#D97706] mx-auto opacity-70" />
                <h4 className="text-sm font-bold text-[#0a0a0a]">No shift logs recorded for today yet</h4>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  When team members clock in, submit accomplishments on clock-out, or record payments, click "Refresh" to generate an updated executive briefing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAE6DF] bg-[#FAF8F5]/90 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-[#64748B] font-medium text-[11px]">
            <span className="hidden sm:inline">AdSkill PayTrack AI Operations Intelligence Engine</span>
            <span className="sm:hidden">PayTrack AI Engine</span>
          </div>

          <Button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-xl font-bold text-xs"
          >
            Close Briefing
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Lightweight Markdown Renderer ─────────────────────────────────────────────
function DigestMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="font-sans text-sm text-[#171717] leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-black text-[#0a0a0a] pt-3 pb-0.5 first:pt-0">
              {renderInline(line.replace(/^### /, ""))}
            </h3>
          );
        }
        if (line.startsWith("#### ")) {
          return (
            <h4 key={i} className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider pt-2">
              {renderInline(line.replace(/^#### /, ""))}
            </h4>
          );
        }
        if (line.trim() === "---") {
          return <hr key={i} className="border-[#EAE6DF] my-2" />;
        }
        if (/^[-*] /.test(line)) {
          return (
            <div key={i} className="flex gap-2 items-start pl-1">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#D97706] shrink-0" />
              <span className="text-[#374151]">{renderInline(line.replace(/^[-*] /, ""))}</span>
            </div>
          );
        }
        if (/^\*[^*].*[^*]\*$/.test(line)) {
          return (
            <p key={i} className="text-xs italic text-[#94A3B8] pl-1">
              {line.slice(1, -1)}
            </p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm text-[#374151]">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="font-bold text-[#0a0a0a]">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return <code key={i} className="px-1 py-0.5 rounded bg-[#EAE6DF] text-[10px] font-mono text-[#7E22CE]">{part.slice(1, -1)}</code>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
