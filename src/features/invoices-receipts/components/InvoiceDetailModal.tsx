"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/client-case.types";
import {
  X, FileText, Download, CheckCircle2, Clock,
  User, Building, Calendar, DollarSign,
  Printer, Loader2, Copy, Check, Eye, ListTree, ShieldCheck,
  Building2, CreditCard, ChevronRight
} from "lucide-react";

interface Props {
  invoice: Invoice | null;
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
    <span className={cn("font-bold", accent ? "text-blue-700" : "text-slate-900")}>{value}</span>
  </div>
);

export function InvoiceDetailModal({ invoice, apiBaseUrl, token, onClose }: Props) {
  const [downloading, setDownloading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"details" | "preview">("details");

  if (!invoice) return null;

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const client = invoice.case?.user;
  const service = invoice.case?.service;
  const plan = invoice.case?.paymentPlans?.[0];
  const contractedFee = Number(plan?.contractedFee || invoice.amount);
  const baseFee = Number(plan?.baseFeeSnapshot || service?.baseFee || 0);
  const discount = Number(plan?.discountAmount || 0);
  const govFee = Number(service?.estimatedGovFee || 0);
  const attorneyFee = Number(service?.estimatedAttorneyFee || 0);
  const thirdPartyFee = Number(service?.estimatedThirdPartyFee || 0);
  const currency = invoice.currency;
  const nextInstallment = plan?.installments?.[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(invoice.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/invoices/${invoice.id}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
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
        {/* Top Architectural Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#0b192c] via-[#1e3a8a] to-[#d97706]" />

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-[#0b192c] text-white flex items-center justify-center shadow-sm">
              <FileText className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-black text-slate-900">{invoice.invoiceNumber}</h3>
                <button
                  onClick={handleCopy}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                  title="Copy invoice number"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  invoice.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                )}>
                  {invoice.status || "ISSUED"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Case: <span className="font-mono font-bold text-slate-700">{invoice.case?.caseCode || "N/A"}</span> • Issued: {fmtDate(invoice.issuedAt)}
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
                  activeTab === "preview" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                Document Canvas
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Invoice"
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0b192c] hover:bg-[#1e3a8a] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
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
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Contract Total</p>
                  <p className="text-xl font-black text-slate-900">{fmt(contractedFee, currency)}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Issue Date</p>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {fmtDate(invoice.issuedAt)}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status Standing</p>
                  <p className={cn("text-sm font-black flex items-center gap-1.5 mt-1", invoice.status === "PAID" ? "text-emerald-700" : "text-blue-700")}>
                    <CheckCircle2 className="h-4 w-4" />
                    {invoice.status === "PAID" ? "Settled & Verified" : "Active / Issued"}
                  </p>
                </div>
              </div>

              {/* Two Column Layout: Client & Service */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Info */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-600" /> Client Identity
                  </h4>
                  <div className="space-y-0.5">
                    <Row label="Full Name" value={client?.name || "Valued Client"} />
                    <Row label="Client ID" value={client?.clientId || "N/A"} accent />
                    <Row label="Email Address" value={client?.email || "N/A"} />
                    <Row label="Phone Number" value={client?.phone || "N/A"} />
                    {client?.country && <Row label="Country / Origin" value={client.country} />}
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-amber-500" /> Service Program
                  </h4>
                  <div className="space-y-0.5">
                    <Row label="Service Name" value={service?.name || invoice.case?.serviceNameSnapshot || "N/A"} />
                    <Row label="Service Code" value={service?.code || invoice.case?.serviceCodeSnapshot || "N/A"} accent />
                    <Row label="Schedule" value={plan?.scheduleType || "Milestones"} />
                    <Row label="Currency" value={`${currency} ($)`} />
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-slate-500" /> Contract Fee Breakdown
                </h4>
                <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                  {baseFee > 0 && (
                    <div className="flex justify-between items-center p-3.5 bg-white">
                      <div>
                        <p className="text-xs font-bold text-slate-900">AdSkill Legal & Advisory Retainer</p>
                        <p className="text-[10px] text-slate-400">Professional consulting, petition drafting, & intake management</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{fmt(baseFee, currency)}</p>
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="flex justify-between items-center p-3.5 bg-emerald-50/50">
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Fee Discount Applied</p>
                        <p className="text-[10px] text-emerald-600">{plan?.discountReason || "Special Contract Adjustment"}</p>
                      </div>
                      <p className="text-sm font-black text-emerald-700">-{fmt(discount, currency)}</p>
                    </div>
                  )}

                  {govFee > 0 && (
                    <div className="flex justify-between items-center p-3.5 bg-white">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Government / USCIS Filing Fees</p>
                        <p className="text-[10px] text-slate-400">Official pass-through filing fees (not retained by AdSkill)</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{fmt(govFee, currency)}</p>
                    </div>
                  )}

                  {attorneyFee > 0 && (
                    <div className="flex justify-between items-center p-3.5 bg-white">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Independent Legal Counsel Review</p>
                        <p className="text-[10px] text-slate-400">Bar-certified attorney legal petition review</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{fmt(attorneyFee, currency)}</p>
                    </div>
                  )}

                  {thirdPartyFee > 0 && (
                    <div className="flex justify-between items-center p-3.5 bg-white">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Certified Translations & Evaluations</p>
                        <p className="text-[10px] text-slate-400">Third-party academic credentials & expert business plan</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{fmt(thirdPartyFee, currency)}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-[#0b192c] text-white">
                    <span className="text-xs font-black uppercase tracking-wider">Total Contracted Value</span>
                    <span className="text-base font-black text-amber-400">{fmt(contractedFee, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Next Milestone Callout */}
              {nextInstallment && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-amber-900">Upcoming Milestone Payment</p>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Milestone #{nextInstallment.sequenceNumber} ({nextInstallment.title || "Next Scheduled Installment"}) • Due: <strong>{fmtDate(nextInstallment.dueDate)}</strong>
                    </p>
                    <p className="text-sm font-black text-amber-900 mt-1">{fmt(nextInstallment.amount, currency)}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Tab 2: Document Canvas (Visual Digital Twin) */
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
                  <div className="bg-[#0b192c] text-white p-3 rounded-xl text-center min-w-[130px]">
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-300">TAX INVOICE</p>
                    <p className="font-mono font-bold text-xs mt-0.5">{invoice.invoiceNumber}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500 text-white rounded text-[8px] font-black">
                      {invoice.status || "ISSUED"}
                    </span>
                  </div>
                </div>

                {/* Dual Meta Cards Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[9px] font-black uppercase text-blue-700 mb-1">BILLED TO / CLIENT</p>
                    <p className="font-bold text-slate-900">{client?.name || "Mohammad Rahim"}</p>
                    <p className="text-[9px] text-slate-500">ID: {client?.clientId || "ASK-2026-1001"}</p>
                    <p className="text-[9px] text-slate-500">{client?.email || "client@example.com"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[9px] font-black uppercase text-amber-700 mb-1">CASE REFERENCE</p>
                    <p className="font-bold text-slate-900">{invoice.case?.caseCode || "ASK-CASE-2026-0001"}</p>
                    <p className="text-[9px] text-slate-500">Issued: {fmtDate(invoice.issuedAt)}</p>
                    <p className="text-[9px] text-slate-500">Currency: {currency} ($)</p>
                  </div>
                </div>

                {/* Fee Table Preview */}
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-[#0b192c] text-white">
                      <th className="p-2 text-left rounded-l">ITEMIZATION</th>
                      <th className="p-2 text-right rounded-r">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-medium">AdSkill Retainer & Preparation</td>
                      <td className="p-2 text-right font-bold">{fmt(baseFee || contractedFee, currency)}</td>
                    </tr>
                    {govFee > 0 && (
                      <tr>
                        <td className="p-2 font-medium">Government Official Filing Fees</td>
                        <td className="p-2 text-right font-bold">{fmt(govFee, currency)}</td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 font-bold">
                      <td className="p-2 text-[#0b192c]">TOTAL CONTRACTED FEE</td>
                      <td className="p-2 text-right text-base text-[#0b192c]">{fmt(contractedFee, currency)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Remittance & Seal Area */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[9px] space-y-1">
                    <p className="font-bold text-blue-800">REMITTANCE OPTIONS</p>
                    <p className="text-slate-600">• Online Portal: portal.adskillconsultancy.com</p>
                    <p className="text-slate-600">• Wire: JPMorgan Chase (Account #8492019482)</p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="h-12 w-12 rounded-full border-2 border-[#1e3a8a] flex flex-col items-center justify-center text-[6px] font-bold text-[#1e3a8a] text-center">
                      <span>ADSKILL</span>
                      <span className="text-[5px] text-amber-600">SEAL</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-bold text-slate-800">Authorized Signature</p>
                      <p className="font-serif italic text-blue-600 text-xs mt-0.5">AdSkill Officer</p>
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
          <span className="text-slate-400 font-mono text-[11px]">System Record: {invoice.id}</span>
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
