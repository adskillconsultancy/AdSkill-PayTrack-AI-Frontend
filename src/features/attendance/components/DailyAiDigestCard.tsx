"use client";

import * as React from "react";
import { RefreshCw, Clock, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  useGetTodayDigestQuery,
  useGenerateDigestMutation,
} from "@/services/api/attendance/attendanceApi";
import { cn } from "@/lib/utils";

interface DailyAiDigestCardProps {
  className?: string;
}

export function DailyAiDigestCard({ className }: DailyAiDigestCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { data: digestResponse, isLoading, refetch } = useGetTodayDigestQuery();
  const [generateDigest, { isLoading: isGenerating }] = useGenerateDigestMutation();

  const digest = digestResponse?.data;

  const handleRegenerate = async () => {
    try {
      await generateDigest({}).unwrap();
      refetch();
    } catch {
      alert("Failed to refresh digest");
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl sm:rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE6DF]">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-[#0a0a0a]">
                AI Executive Daily Digest
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                Live Intelligence
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium">
              Aggregated team shift accomplishments, work hours, and daily payment operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={isGenerating || isLoading}
            className="h-9 gap-1.5 text-xs font-bold"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isGenerating && "animate-spin")} />
            <span>{isGenerating ? "Synthesizing..." : "Refresh Digest"}</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-[#FAF8F5] text-[#64748B] transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="pt-5 space-y-5 animate-in fade-in duration-200">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#7E22CE] shadow-2xs">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">Work Logged</span>
                <div className="text-base font-black text-[#0a0a0a]">
                  {digest ? `${digest.totalHoursLogged} hrs` : "0 hrs"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0284C7] shadow-2xs">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">Active Staff</span>
                <div className="text-base font-black text-[#0a0a0a]">
                  {digest ? `${digest.activeUsersCount} on shift` : "0 on shift"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#059669] shadow-2xs">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">Payments Processed</span>
                <div className="text-base font-black text-[#0a0a0a]">
                  {digest
                    ? `$${Number(digest.paymentsCollected).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : "$0.00"}
                </div>
              </div>
            </div>
          </div>

          {/* Digest Content — Rendered as formatted Markdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                Analyzing today&apos;s attendance logs and compiling AI briefing...
              </div>
            ) : digest?.summaryContent ? (
              <DigestMarkdown content={digest.summaryContent} />
            ) : (
              <div className="py-8 text-center text-xs text-[#94A3B8]">
                No digest generated yet for today. Click &quot;Refresh Digest&quot; above to compile today&apos;s briefing.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Lightweight Markdown Renderer ─────────────────────────────────────────────
function DigestMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="font-sans text-sm text-[#171717] leading-relaxed space-y-1.5">
      {lines.map((line, i) => {
        // H3 — e.g. ### 📋 Executive Daily Digest
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-sm font-black text-[#0a0a0a] pt-3 pb-0.5 first:pt-0">
              {renderInline(line.replace(/^### /, ""))}
            </h3>
          );
        }
        // H4 — e.g. #### 🎯 Key Accomplishments
        if (line.startsWith("#### ")) {
          return (
            <h4 key={i} className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider pt-2">
              {renderInline(line.replace(/^#### /, ""))}
            </h4>
          );
        }
        // Horizontal Rule
        if (line.trim() === "---") {
          return <hr key={i} className="border-[#EAE6DF] my-2" />;
        }
        // Bullet point
        if (/^[-*] /.test(line)) {
          return (
            <div key={i} className="flex gap-2 items-start pl-1">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#D97706] shrink-0" />
              <span className="text-[#374151]">{renderInline(line.replace(/^[-*] /, ""))}</span>
            </div>
          );
        }
        // Italic-only line like *No records were found.*
        if (/^\*[^*].*[^*]\*$/.test(line)) {
          return (
            <p key={i} className="text-xs italic text-[#94A3B8] pl-1">
              {line.slice(1, -1)}
            </p>
          );
        }
        // Empty line → small spacer
        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }
        // Normal paragraph
        return (
          <p key={i} className="text-sm text-[#374151]">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

// Renders **bold** and `code` inline
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-bold text-[#0a0a0a]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} className="px-1 py-0.5 rounded bg-[#EAE6DF] text-[10px] font-mono text-[#7E22CE]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}
