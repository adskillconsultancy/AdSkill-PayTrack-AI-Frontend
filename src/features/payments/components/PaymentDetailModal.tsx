"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { useVerifyPaymentMutation } from "@/services/api/payments/paymentsApi";
import { usePermissions } from "@/hooks/usePermissions";
import type { Payment } from "@/types/client-case.types";
import { cn } from "@/lib/utils";
import {
  X,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Building,
  User,
  ShieldCheck,
  FileText,
  Calendar,
  Hash,
  ArrowUpRight,
  Shield,
  Loader2,
} from "lucide-react";

export interface PaymentDetailModalProps {
  payment: Payment | null;
  onClose: () => void;
  onVerified?: () => void;
}

const formatMoney = (amount: number | string, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(Number(amount) || 0);
};

const formatDate = (isoString?: string | null) => {
  if (!isoString) return "N/A";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

export function PaymentDetailModal({
  payment,
  onClose,
  onVerified,
}: PaymentDetailModalProps) {
  const { hasPermission } = usePermissions();
  const canVerify = hasPermission("payment:verify");
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [copied, setCopied] = React.useState(false);
  const [notice, setNotice] = React.useState("");

  if (!payment) return null;

  const isVerified = payment.status === "VERIFIED";
  const isPending = payment.status === "PENDING";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    try {
      await verifyPayment(payment.id).unwrap();
      setNotice("Payment verified and credited successfully!");
      if (onVerified) onVerified();
    } catch (err: any) {
      setNotice(err?.data?.message || "Failed to verify payment");
    }
  };

  const clientName = payment.case?.user?.name || "Client";
  const clientEmail = payment.case?.user?.email;
  const clientPhone = payment.case?.user?.phone;
  const caseCode = payment.case?.caseCode || "Case";
  const serviceName = payment.case?.service?.name || payment.case?.caseCategory || "Service";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-2xs">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Official Transaction Slip
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Payment #{payment.id.slice(0, 8).toUpperCase()}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/payments/${payment.id}`}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer transition-colors"
            >
              <span>Full Page</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Notice Alert */}
          {notice && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                className="text-emerald-700 hover:text-emerald-900 text-xs">
                Dismiss
              </button>
            </div>
          )}

          {/* Amount & Status Big Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs border border-amber-400/40">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-100 block mb-1">
                Settled Transaction Amount
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white flex items-center gap-2">
                <span>{formatMoney(payment.amount, payment.currency)}</span>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-white/20 text-white">
                  {payment.currency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Verified &amp; Credited
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Pending Verification
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                  {payment.status}
                </span>
              )}
            </div>
          </div>

          {/* Client & Case Identity Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Associated Client &amp; Program
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {clientName[0]}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">{clientName}</h4>
                  <p className="text-[11px] text-slate-500">{clientEmail || "No email"}</p>
                  {clientPhone && (
                    <p className="text-[11px] text-slate-500 font-mono">{clientPhone}</p>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right">
                <Link
                  href={`/clients/${payment.caseId}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  <span>Case {caseCode}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{serviceName}</p>
              </div>
            </div>
          </div>

          {/* Payment Technical Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Payment Method
              </span>
              <span className="font-extrabold text-slate-900 block flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                {payment.paymentMethod}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Payment Date
              </span>
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                {formatDate(payment.paymentDate)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Linked Milestone
              </span>
              <span className="font-bold text-slate-900 block truncate">
                {payment.installment?.title
                  ? `#${payment.installment.sequenceNumber} ${payment.installment.title}`
                  : "Unallocated / General Credit"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                System Recorded
              </span>
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(payment.recordedAt || payment.createdAt)}
              </span>
            </div>
          </div>

          {/* External Reference & Wire Details */}
          {payment.externalReference && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Bank Wire / External Reference Number
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(payment.externalReference || "")}
                  className="text-[10px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer">
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="font-mono text-xs font-black text-slate-900 break-all">
                {payment.externalReference}
              </p>
            </div>
          )}

          {/* Operational Caseworker Notes */}
          {payment.operationalNotes && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Operational Caseworker Memo
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {payment.operationalNotes}
              </p>
            </div>
          )}

          {/* Verification Audit Trail Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Audit Trail &amp; Verification Details
            </span>

            {isVerified ? (
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">
                      {payment.verifiedBy?.name || "Authorized Staff Member"}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {payment.verifiedBy?.email || "Staff Admin"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase block">
                    {payment.verifiedBy?.role?.name || "VERIFIED"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {formatDate(payment.verifiedAt || payment.updatedAt)}
                  </span>
                </div>
              </div>
            ) : isPending ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-amber-100/60 border border-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                  <span className="text-xs font-bold text-amber-900">
                    Awaiting Manager / Super Admin approval
                  </span>
                </div>

                {canVerify && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isVerifying}
                    onClick={handleVerify}
                    className="h-8 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-2xs cursor-pointer">
                    {isVerifying ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Verifying...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verify &amp; Credit Now
                      </span>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Status: {payment.status}</p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px]">
            UUID: {payment.id}
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer">
              Close Slip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
