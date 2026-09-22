"use client";

import * as React from "react";
import { cn, formatExplicitDate, formatCurrencyWithCode } from "@/lib/utils";
import type { Invoice } from "@/types/client-case.types";
import {
  FileText, Download, Calendar, CheckCircle2,
  Clock, ArrowUpRight, Building, User, Loader2,
  Copy, Check, FileCheck2
} from "lucide-react";

interface Props {
  invoice: Invoice;
  apiBaseUrl: string;
  token: string | null;
  onView?: (inv: Invoice) => void;
}

const formatMoney = (amount: number | string, currency = "USD") =>
  formatCurrencyWithCode(amount, currency);

const formatDate = (d?: string | null) =>
  formatExplicitDate(d);

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  ISSUED: { bg: "bg-blue-50 text-blue-700", border: "border-blue-200/80", text: "Issued", icon: Clock },
  PAID: { bg: "bg-emerald-50 text-emerald-700", border: "border-emerald-200/80", text: "Paid in Full", icon: CheckCircle2 },
  VOID: { bg: "bg-rose-50 text-rose-700", border: "border-rose-200/80", text: "Voided", icon: Clock },
};

export function InvoiceCard({ invoice, apiBaseUrl, token, onView }: Props) {
  const [downloading, setDownloading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const status = invoice.status || "ISSUED";
  const conf = statusConfig[status] || statusConfig.ISSUED;
  const StatusIcon = conf.icon;

  const client = invoice.case?.user;
  const plan = invoice.case?.paymentPlans?.[0];
  const contractedFee = Number(plan?.contractedFee || invoice.amount);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(invoice.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/invoices/${invoice.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
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
      onClick={() => onView?.(invoice)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Top dual-tone architectural accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0b192c] via-[#1e3a8a] to-[#d97706]" />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  {invoice.invoiceNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy invoice number"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <p className="text-[11px] font-semibold text-slate-400">
                Case: {invoice.case?.caseCode || invoice.caseId.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border", conf.bg, conf.border)}>
            <StatusIcon className="h-3 w-3" />
            {conf.text}
          </span>
        </div>

        {/* Client & Service Info */}
        <div className="space-y-2">
          {client && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0">
                {client.name ? client.name.charAt(0).toUpperCase() : "C"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{client.name}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{client.clientId || client.email}</p>
              </div>
            </div>
          )}

          {invoice.case?.serviceNameSnapshot && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 px-1 truncate">
              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{invoice.case.serviceNameSnapshot}</span>
            </div>
          )}
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Contract Total
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatMoney(contractedFee, invoice.currency)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Issued On
            </span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-slate-400" />
              {formatDate(invoice.issuedAt)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(invoice);
            }}
            className="flex-1 flex items-center justify-center gap-1 h-9 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <span>Review Details</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#0b192c] hover:bg-[#1e3a8a] text-white text-xs font-bold transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
            title="Download Official PDF"
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
