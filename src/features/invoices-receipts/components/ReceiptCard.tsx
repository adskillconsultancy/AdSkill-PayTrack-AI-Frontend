"use client";

import * as React from "react";
import { cn, formatExplicitDate, formatCurrencyWithCode } from "@/lib/utils";
import type { Receipt } from "@/types/client-case.types";
import {
  Receipt as ReceiptIcon, Download, Calendar,
  CheckCircle2, Building, CreditCard,
  Loader2, ArrowUpRight, ShieldCheck,
  Copy, Check, BadgeCheck
} from "lucide-react";

interface Props {
  receipt: Receipt;
  apiBaseUrl: string;
  token: string | null;
  onView?: (rct: Receipt) => void;
}

const formatMoney = (amount: number | string, currency = "USD") =>
  formatCurrencyWithCode(amount, currency);

const formatDate = (d?: string | null) =>
  formatExplicitDate(d);

export function ReceiptCard({ receipt, apiBaseUrl, token, onView }: Props) {
  const [downloading, setDownloading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const client = receipt.case?.user;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(receipt.receiptNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/receipts/${receipt.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${receipt.receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      onClick={() => onView?.(receipt)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Top emerald gradient bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400" />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
              <ReceiptIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {receipt.receiptNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy receipt number"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Case: {receipt.case?.caseCode || receipt.caseId.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Cleared Badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
            Payment Cleared
          </span>
        </div>

        {/* Client & Service Info */}
        <div className="space-y-2">
          {client && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0">
                {client.name ? client.name.charAt(0).toUpperCase() : "C"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{client.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{client.clientId || client.email}</p>
              </div>
            </div>
          )}

          {receipt.case?.serviceNameSnapshot && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 px-1 truncate">
              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{receipt.case.serviceNameSnapshot}</span>
            </div>
          )}

          {/* Payment method & audit verification */}
          <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
            <div className="flex items-center gap-1 text-slate-500 font-medium">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              <span>{receipt.payment?.paymentMethod || "Electronic Wire"}</span>
            </div>

            {receipt.payment?.verifiedBy && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px] bg-emerald-50/80 px-2 py-0.5 rounded-md border border-emerald-100">
                <ShieldCheck className="h-3 w-3" />
                Audited
              </span>
            )}
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
              Amount Cleared
            </span>
            <span className="text-sm font-black text-emerald-800">
              {formatMoney(receipt.amount, receipt.currency)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Settlement Date
            </span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-slate-400" />
              {formatDate(receipt.payment?.paymentDate || receipt.issuedAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(receipt);
            }}
            className="flex-1 flex items-center justify-center gap-1 h-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Review Proof</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
            title="Download Official Receipt PDF"
          >
            {downloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
