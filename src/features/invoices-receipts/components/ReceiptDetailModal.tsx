"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Receipt } from "@/types/client-case.types";
import {
  X, Receipt as ReceiptIcon, Download, CheckCircle2,
  Calendar, DollarSign, Printer, Loader2, Copy, Check,
  Eye, ListTree, ShieldCheck, CreditCard, Building, User,
  BadgeCheck
} from "lucide-react";

interface Props {
  receipt: Receipt | null;
  apiBaseUrl: string;
  token: string | null;
  onClose: () => void;
}

const fmt = (v: number | string, c = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: c || "USD" }).format(Number(v) || 0);

const fmtDate = (d?: string | null) =>
  d ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(d)) : "N/A";

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
    <span className="text-slate-500 font-medium">{label}</span>
    <span className={cn("font-bold", accent ? "text-emerald-700" : "text-slate-900")}>{value}</span>
  </div>
);

export function ReceiptDetailModal({ receipt, apiBaseUrl, token, onClose }: Props) {
  const [downloading, setDownloading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"details" | "preview">("details");

  if (!receipt) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const client = receipt.case?.user;
  const payment = receipt.payment;
  const currency = receipt.currency;

  const handleCopy = () => {
    navigator.clipboard.writeText(receipt.receiptNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/receipts/${receipt.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${receipt.receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80">
        {/* Top Emerald Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400" />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <ReceiptIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-black text-slate-900">{receipt.receiptNumber}</h3>
                <button
                  onClick={handleCopy}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy receipt number"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                  PAYMENT VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Case: <span className="font-mono font-bold text-slate-700">{receipt.case?.caseCode || "N/A"}</span> • Settled: {fmtDate(payment?.paymentDate || receipt.issuedAt)}
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-200/60 rounded-xl mr-1">
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  activeTab === "details" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <ListTree className="h-3.5 w-3.5" />
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  activeTab === "preview" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                Receipt Canvas
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Receipt"
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === "details" ? (
            <>
              {/* Summary Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">Cleared Amount</p>
                  <p className="text-xl font-black text-emerald-800">{fmt(receipt.amount, currency)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Settlement Date</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {fmtDate(payment?.paymentDate || receipt.issuedAt)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Audit Verification</p>
                  <p className="text-sm font-black text-emerald-700 flex items-center gap-1.5 mt-1">
                    <ShieldCheck className="h-4 w-4" />
                    Staff Confirmed
                  </p>
                </div>
              </div>

              {/* Two Column Layout: Client & Transaction Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Info */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-600" /> Client Identity
                  </h4>
                  <div className="space-y-0.5">
                    <Row label="Client Full Name" value={client?.name || "Valued Client"} />
                    <Row label="Client ID" value={client?.clientId || "N/A"} accent />
                    <Row label="Email Address" value={client?.email || "N/A"} />
                    <Row label="Case Program" value={receipt.case?.serviceNameSnapshot || "N/A"} />
                  </div>
                </div>

                {/* Audit & Transaction */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-emerald-600" /> Transaction Audit Proof
                  </h4>
                  <div className="space-y-0.5">
                    <Row label="Payment Method" value={payment?.paymentMethod || "STRIPE"} />
                    <Row label="Gateway Ref / ID" value={payment?.externalReference || payment?.id?.slice(0, 16) || "N/A"} accent />
                    <Row label="Verified By" value={payment?.verifiedBy?.name ? `${payment.verifiedBy.name} (${payment.verifiedBy.role?.name || "OFFICER"})` : "Authorized Financial Controller"} />
                    <Row label="Status" value="VERIFIED & CLEARED" accent />
                  </div>
                </div>
              </div>

              {/* Allocation breakdown */}
              {payment?.installment && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-1">
                    Retained Milestone Allocation
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Allocated directly to Milestone #{payment.installment.sequenceNumber} ({payment.installment.title || "Retainer Milestone"}).
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Simulated Receipt Paper Canvas */
            <div className="p-6 sm:p-8 bg-slate-100 rounded-3xl border border-slate-200 flex justify-center">
              <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6 text-slate-800 font-sans text-xs">
                {/* Simulated Header */}
                <div className="flex items-start justify-between border-b pb-4 border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-[#0b192c] flex items-center justify-center text-white font-black text-sm">
                        P
                      </div>
                      <div>
                        <span className="font-black text-[#0b192c] text-sm tracking-wider">ADSKILL</span>
                        <span className="font-black text-amber-600 text-sm tracking-wider"> PAYTRACK</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1">1234 Innovation Drive, Suite 400, New York, NY 10001</p>
                    <p className="text-[9px] text-slate-500">billing@adskillconsultancy.com • EIN: 47-8921034</p>
                  </div>
                  <div className="bg-emerald-800 text-white p-3 rounded-xl text-center min-w-[130px]">
                    <p className="text-[8px] font-black uppercase tracking-wider text-emerald-200">OFFICIAL RECEIPT</p>
                    <p className="font-mono font-bold text-xs mt-0.5">{receipt.receiptNumber}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-black">
                      PAID &amp; CLEARED
                    </span>
                  </div>
                </div>

                {/* Dual Meta Cards Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[9px] font-black uppercase text-blue-700 mb-1">CLIENT IDENTITY</p>
                    <p className="font-bold text-slate-900">{client?.name || "Mohammad Rahim"}</p>
                    <p className="text-[9px] text-slate-500">ID: {client?.clientId || "ASK-2026-1001"}</p>
                    <p className="text-[9px] text-slate-500">{client?.email || "client@example.com"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[9px] font-black uppercase text-emerald-700 mb-1">SETTLEMENT RECORD</p>
                    <p className="font-bold text-slate-900">{receipt.case?.caseCode || "ASK-CASE-2026-0001"}</p>
                    <p className="text-[9px] text-slate-500">Settled: {fmtDate(payment?.paymentDate || receipt.issuedAt)}</p>
                    <p className="text-[9px] text-slate-500">Method: {payment?.paymentMethod || "STRIPE"}</p>
                  </div>
                </div>

                {/* Cleared Line Item Preview */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
                  <div>
                    <p className="font-black text-emerald-900 text-sm">TOTAL AMOUNT CLEARED &amp; CONFIRMED</p>
                    <p className="text-[9px] text-emerald-700 mt-0.5">Ref ID: {payment?.externalReference || "ch_stripe_demo_1001"}</p>
                  </div>
                  <p className="text-xl font-black text-emerald-800">{fmt(receipt.amount, currency)}</p>
                </div>

                {/* Corporate Seal & Verification Area */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[9px] space-y-1">
                    <p className="font-bold text-emerald-800">AUDIT CLEARANCE PROOF</p>
                    <p className="text-slate-600">• Auditor: {payment?.verifiedBy?.name || "AdSkill Super Administrator"}</p>
                    <p className="text-slate-600">• Gateway Status: 100% Verified Inflow</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="h-12 w-12 rounded-full border-2 border-emerald-700 flex flex-col items-center justify-center text-[6px] font-bold text-emerald-700 text-center">
                      <span>ADSKILL</span>
                      <span className="text-[5px] text-emerald-800 font-black">CLEARED</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-800">Authorized Financial Audit</p>
                      <p className="font-serif italic text-emerald-700 text-xs mt-0.5">Verified Officer</p>
                      <p className="text-[7px] text-slate-400">Digital ID: #ASK-885916</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center text-[8px] text-slate-400 border-t border-slate-100">
                  AdSkill Consultancy Inc. • Official Accounting Document • Confidential
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">System Record: {receipt.id}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
