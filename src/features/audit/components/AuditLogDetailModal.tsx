"use client";

import * as React from "react";
import {
  X,
  Shield,
  User2,
  Activity,
  Layers,
  Clock,
  Globe,
  Monitor,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";
import { useGetAuditLogByIdQuery } from "@/services/api/audit/auditApi";

// ─── JSON Diff Viewer ──────────────────────────────────────────────────────

function JsonBlock({ title, value, accent }: { title: string; value: unknown; accent: string }) {
  if (value === null || value === undefined) {
    return (
      <div className="flex-1 min-w-0">
        <div className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${accent}`}>{title}</div>
        <div className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 text-xs text-[#94A3B8] italic font-mono">
          (no snapshot)
        </div>
      </div>
    );
  }

  const json = JSON.stringify(value, null, 2);
  return (
    <div className="flex-1 min-w-0">
      <div className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${accent}`}>{title}</div>
      <pre className="rounded-xl border border-[#EAE6DF] bg-[#0F172A] text-green-300 text-[11px] font-mono p-4 overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all">
        {json}
      </pre>
    </div>
  );
}

// ─── Detail Row ────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F8F6F1] last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F8F6F1]">
        <Icon className="h-3.5 w-3.5 text-[#475569]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-0.5">{label}</div>
        <div className="text-[13px] text-[#0F172A] font-medium break-all">{value ?? <span className="text-[#CBD5E1] italic text-xs">—</span>}</div>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

interface Props {
  logId: string;
  onClose: () => void;
}

export function AuditLogDetailModal({ logId, onClose }: Props) {
  const { data: response, isLoading, isError } = useGetAuditLogByIdQuery(logId);
  const log = response?.data;

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZoneName: "short",
    });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── Header ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE6DF] bg-gradient-to-r from-[#092244] to-[#0d2e5e] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3A712]/20">
                <Shield className="h-5 w-5 text-[#F3A712]" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-white">Audit Log Detail</h2>
                <p className="text-[11px] text-white/50 font-mono mt-0.5 truncate max-w-[280px]">
                  #{logId}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* ─── Body ───────────────────────────────────────────────────────── */}
          <div className="overflow-y-auto flex-1">
            {isLoading && (
              <div className="p-6 space-y-6">
                {/* Event Summary Skeleton */}
                <div className="rounded-xl border border-[#EAE6DF] divide-y divide-[#F8F6F1] overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF8F5]">
                    <Skeleton className="h-3 w-28 rounded" />
                  </div>
                  <div className="px-4 py-2 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-2.5 w-20 rounded" />
                          <Skeleton className={cn("h-3.5 rounded", i % 2 === 0 ? "w-48" : "w-64")} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Snapshots Skeleton */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-3 w-36 rounded" />
                    <Skeleton className="h-3 w-40 rounded" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-40 w-full rounded-xl" />
                    </div>
                  </div>
                </div>

                {/* Metadata Skeleton */}
                <div className="rounded-xl border border-[#EAE6DF] divide-y divide-[#F8F6F1] overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF8F5]">
                    <Skeleton className="h-3 w-36 rounded" />
                  </div>
                  <div className="px-4 py-2 space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 py-2">
                        <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-2.5 w-20 rounded" />
                          <Skeleton className="h-3.5 w-40 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle className="h-10 w-10 text-red-400" />
                <p className="text-sm text-[#475569]">Failed to load audit entry details.</p>
              </div>
            )}

            {log && (
              <div className="p-6 space-y-6">
                {/* ─── Event Summary ─────────────────────────────────────────── */}
                <div className="rounded-xl border border-[#EAE6DF] divide-y divide-[#F8F6F1] overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF8F5]">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#475569]">
                      Event Summary
                    </h3>
                  </div>
                  <div className="px-4">
                    <DetailRow icon={Clock} label="Timestamp (UTC)" value={formatDate(log.createdAt)} />
                    <DetailRow icon={Activity} label="Action" value={
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold text-[12px]">
                        {log.action}
                      </span>
                    } />
                    <DetailRow icon={Layers} label="Target Entity" value={`${log.targetEntity} — #${log.targetId}`} />
                    {log.reason && (
                      <DetailRow icon={FileText} label="Reason / Justification" value={log.reason} />
                    )}
                  </div>
                </div>

                {/* ─── Actor Details ─────────────────────────────────────────── */}
                <div className="rounded-xl border border-[#EAE6DF] divide-y divide-[#F8F6F1] overflow-hidden">
                  <div className="px-4 py-3 bg-[#FAF8F5]">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#475569]">
                      Actor (Who Did This)
                    </h3>
                  </div>
                  <div className="px-4">
                    <DetailRow icon={User2} label="Name" value={log.actor?.name ?? "Unknown / System"} />
                    <DetailRow icon={User2} label="Email" value={log.actorEmail ?? log.actor?.email ?? "—"} />
                    <DetailRow icon={Shield} label="Role" value={
                      log.actor?.role?.name
                        ? <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#092244]/10 text-[#092244]">
                            {log.actor.role.name.replace(/_/g, " ")}
                          </span>
                        : null
                    } />
                    <DetailRow icon={Globe} label="IP Address" value={log.ipAddress ?? "Not captured"} />
                    <DetailRow icon={Monitor} label="User Agent" value={
                      <span className="text-[11px] text-[#94A3B8] font-mono break-all">
                        {log.userAgent ?? "Not captured"}
                      </span>
                    } />
                  </div>
                </div>

                {/* ─── Before / After Snapshot ──────────────────────────────── */}
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#475569] mb-3">
                    Data Snapshot (Before → After)
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <JsonBlock
                      title="Before"
                      value={log.beforeValue}
                      accent="text-red-500"
                    />
                    <JsonBlock
                      title="After"
                      value={log.afterValue}
                      accent="text-green-600"
                    />
                  </div>
                </div>

                {/* ─── Immutability Notice ──────────────────────────────────── */}
                <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                  <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    <strong>Immutable Record:</strong> This audit entry cannot be modified or deleted by any user,
                    including Super Administrators. It is an append-only forensic record for compliance and security oversight.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ─────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#EAE6DF] bg-[#FAF8F5] shrink-0">
            <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
