"use client";

import { Button } from "@/components/common/Button";
import { SkeletonDetailView } from "@/components/common/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";
import { downloadAndPrintPaymentReceipt } from "@/lib/documentDownload";
import {
  cn,
  formatCurrencyWithCode,
  formatExplicitDateTime,
} from "@/lib/utils";
import {
  useGetPaymentQuery,
  useVerifyPaymentMutation,
} from "@/services/api/payments/paymentsApi";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck,
  Loader2,
  Printer,
  Receipt,
  RefreshCw,
  Shield,
  ShieldCheck,
  User
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

const formatMoney = (amount: number | string, currency = "USD") =>
  formatCurrencyWithCode(amount, currency);

const formatDate = (isoString?: string | null) =>
  formatExplicitDateTime(isoString);

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function PaymentDetailPage() {
  const params = useParams();
  const paymentId = (params?.id as string) || "";
  const router = useRouter();

  const { hasPermission } = usePermissions();
  const canVerify = hasPermission("payment:verify");

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetPaymentQuery(paymentId, {
    skip: !paymentId,
    refetchOnMountOrArgChange: true,
  });
  const payment = response?.data;

  const [verifyPayment, { isLoading: isVerifying }] =
    useVerifyPaymentMutation();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string>("");
  const [isDownloadingReceipt, setIsDownloadingReceipt] = React.useState(false);

  const handleDownloadReceipt = async () => {
    if (!payment) return;
    setIsDownloadingReceipt(true);
    try {
      await downloadAndPrintPaymentReceipt(
        payment.id,
        payment.externalReference || payment.id.slice(0, 8).toUpperCase()
      );
      setNotice("Official money receipt generated and downloaded successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to download receipt";
      setNotice(msg);
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleVerify = async () => {
    if (!payment) return;
    try {
      setNotice("");
      await verifyPayment(payment.id).unwrap();
      setNotice("Payment verified and case ledger credited successfully!");
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setNotice(apiErr?.data?.message || "Failed to verify payment");
    }
  };

  if (isLoading) {
    return <SkeletonDetailView />;
  }

  if (isError || !payment) {
    return (
      <div className="min-h-screen py-24 max-w-xl mx-auto text-center px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xs">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-extrabold text-slate-900">
            Payment Not Found
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested payment transaction could not be located or has been
            archived.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/payments")}
              className="text-xs font-bold rounded-xl cursor-pointer">
              Back to Ledger
            </Button>
            <Button
              size="sm"
              onClick={() => refetch()}
              className="text-xs font-bold rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-600 cursor-pointer gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = payment.status === "VERIFIED";
  const isPending = payment.status === "PENDING";
  const isStripe = Boolean(
    payment.paymentMethod?.startsWith("STRIPE") ||
    payment.stripePaymentIntentId,
  );
  const proofDocs = payment.proofDocuments || [];

  return (
    <div className="min-h-screen pb-24">
      {/* TOP NAVIGATION & BREADCRUMB */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/payments")}
            className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/payments"
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
                Payments Ledger
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-extrabold text-slate-900 font-mono">
                {payment.id.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-0.5 flex items-center gap-2.5">
              Settlement Slip & Audit Dossier
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold",
                  isVerified
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200",
                )}>
                {isVerified ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    VERIFIED & CREDITED
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
                    PENDING VERIFICATION
                  </>
                )}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReceipt}
            disabled={isDownloadingReceipt}
            className="text-xs font-bold rounded-xl border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 cursor-pointer gap-2 disabled:opacity-50">
            {isDownloadingReceipt ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-700" />
            ) : (
              <Receipt className="h-3.5 w-3.5 text-amber-700" />
            )}
            {isDownloadingReceipt ? "Generating..." : "Download Official Receipt"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer gap-2">
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            Print Slip
          </Button>

          {isPending && canVerify && (
            <Button
              size="sm"
              onClick={handleVerify}
              disabled={isVerifying}
              className="text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer gap-2">
              {isVerifying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verify & Credit Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-extrabold text-emerald-800 flex items-center justify-between">
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            className="text-emerald-600 hover:text-emerald-800 font-black cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* EXECUTIVE SUMMARY BANNER */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs mb-8 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Confirmed Payment Value
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {formatMoney(payment.amount, payment.currency)}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-800 tracking-wider">
                {payment.currency}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Settled via{" "}
              <span className="font-extrabold text-slate-900">
                {payment.paymentMethod.replace(/_/g, " ")}
              </span>{" "}
              on{" "}
              <span className="font-bold text-slate-800">
                {formatDate(payment.paymentDate)}
              </span>
            </p>
          </div>

          <div className="md:col-span-5 md:border-l md:border-slate-100 md:pl-8 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Internal Transaction ID
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs font-bold text-slate-800 truncate">
                  {payment.id.slice(0, 12)}...
                </span>
                <button
                  onClick={() => handleCopy(payment.id, "paymentId")}
                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">
                  {copiedKey === "paymentId" ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Recorded Timestamp
              </span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {formatDate(payment.recordedAt || payment.createdAt)}
              </span>
            </div>

            {payment.externalReference && (
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Bank Reference / Wire Confirmation #
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-sm font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                    {payment.externalReference}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(payment.externalReference!, "extRef")
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer">
                    {copiedKey === "extRef" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {payment.stripePaymentIntentId && (
              <div className="col-span-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Stripe Gateway Reference (Payment Intent / Session)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60 truncate">
                    {payment.stripePaymentIntentId}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(payment.stripePaymentIntentId!, "stripeRef")
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer shrink-0">
                    {copiedKey === "stripeRef" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-COLUMN DOSSIER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Official Settlement Slip Voucher & Documents */}
        <div className="lg:col-span-7 space-y-6">
          {/* UNIVERSAL OFFICIAL PAYMENT SETTLEMENT SLIP & RECEIPT VOUCHER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/70 to-amber-50/20 p-6 sm:p-8 shadow-xs border border-slate-200/90 text-slate-900 print-slip-sheet">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 mb-6">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-2xl bg-[#0b192c] text-white flex items-center justify-center font-black text-sm tracking-tighter shadow-xs">
                  ASK
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400 block">
                    AdSkill Consultancy • Financial Treasury
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Official Payment Settlement Slip
                  </h3>
                </div>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold shadow-2xs border",
                  isVerified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                )}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isVerified ? "AUTHENTICATED & VERIFIED" : "PENDING AUDIT"}</span>
              </div>
            </div>

            {/* Client & Service Info Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 px-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs mb-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Client Name
                </span>
                <span className="font-extrabold text-slate-900 text-xs truncate block">
                  {payment.case?.user?.name || "Client"}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ID: {payment.case?.user?.clientId || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Case Reference
                </span>
                <span className="font-mono font-bold text-slate-900 text-xs truncate block">
                  {payment.case?.caseCode || "N/A"}
                </span>
                <span className="text-[10px] text-slate-500 truncate block">
                  {payment.case?.service?.name || "Legal Consulting"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Clearing Channel
                </span>
                <span className="font-extrabold text-slate-900 text-xs block">
                  {isStripe ? "Stripe Gateway" : payment.paymentMethod.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {payment.externalReference || (isStripe ? "Electronic Settlement" : "Office Clearance")}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  Settled Value
                </span>
                <span className="font-mono font-black text-slate-900 text-base leading-tight block">
                  {formatMoney(payment.amount, payment.currency)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 block">
                  {payment.currency} • Remitted
                </span>
              </div>
            </div>

            {/* Transaction Particulars Grid */}
            <div className="space-y-3 py-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Internal Transaction Reference:</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {payment.id}
                </span>
              </div>

              {payment.externalReference && (
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-500 font-medium">Bank Wire / Confirmation #:</span>
                  <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    {payment.externalReference}
                  </span>
                </div>
              )}

              {payment.installment && (
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] py-1 border-b border-dashed border-slate-200">
                  <span className="text-slate-500 font-medium">Milestone Allocation:</span>
                  <span className="font-bold text-slate-800">
                    Milestone #{payment.installment.sequenceNumber} ({payment.installment.title || "Contracted Step"})
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] py-1 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Settlement Timestamp:</span>
                <span className="text-slate-800 font-bold">
                  {formatDate(payment.paymentDate || payment.recordedAt || (payment as any).createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] py-1">
                <span className="text-slate-500 font-medium">Verification Stamp:</span>
                <span className="text-slate-800 font-bold">
                  {isStripe
                    ? "Stripe Webhook HMAC Engine (256-Bit SSL)"
                    : payment.verifiedBy?.name
                    ? `Verified by ${payment.verifiedBy.name} (${payment.verifiedBy.role?.name || "Staff"})`
                    : "Authorized AdSkill Treasury"}
                </span>
              </div>
            </div>

            {/* Simulated Barcode, Auth ID & Slip Action Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Barcode Graphic */}
                <div className="flex items-center gap-0.5 bg-slate-100/90 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <div className="w-0.5 h-6 bg-slate-800" />
                  <div className="w-1 h-6 bg-slate-800" />
                  <div className="w-0.5 h-6 bg-slate-800" />
                  <div className="w-1.5 h-6 bg-slate-800" />
                  <div className="w-0.5 h-6 bg-slate-800" />
                  <div className="w-1 h-6 bg-slate-800" />
                  <div className="w-0.5 h-6 bg-slate-800" />
                  <div className="w-1.5 h-6 bg-slate-800" />
                  <div className="w-0.5 h-6 bg-slate-800" />
                  <div className="w-1 h-6 bg-slate-800" />
                  <div className="w-0.5 h-6 bg-slate-800" />
                  <div className="w-1.5 h-6 bg-slate-800" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500 block">
                    AUTH: {(payment.externalReference || payment.stripePaymentIntentId || payment.id).slice(-12).toUpperCase()}
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    ADSKILL IMMUTABLE AUDIT TRAIL
                  </span>
                </div>
              </div>

              {/* Buttons inside slip: Print Slip & Download Official Receipt */}
              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloadingReceipt}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  title="Download official PDF receipt">
                  {isDownloadingReceipt ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-amber-700" />
                  )}
                  <span>{isDownloadingReceipt ? "Generating..." : "Download Receipt"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>

          {/* PHYSICAL PROOF & BANK ATTACHMENTS (IF ANY) */}
          {proofDocs.length > 0 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs print:hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  Uploaded Proof Documents & Physical Slips
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg text-slate-400">
                  {proofDocs.length} Attachment{proofDocs.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {proofDocs.map((doc) => {
                  const isImage =
                    doc.mimeType?.startsWith("image/") ||
                    ["png", "jpg", "jpeg", "webp"].some((ext) =>
                      doc.originalName.toLowerCase().endsWith(ext),
                    );
                  return (
                    <div
                      key={doc.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-slate-300 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {isImage ? "IMG" : "PDF"}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 truncate">
                              {doc.originalName}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {formatFileSize(doc.size)} • Uploaded {formatDate(doc.createdAt)}
                            </span>
                          </div>
                        </div>

                        {doc.signedDownloadUrl ? (
                          <a
                            href={doc.signedDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl px-3 py-1.5 transition-colors shrink-0 cursor-pointer">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </a>
                        ) : null}
                      </div>

                      {isImage && doc.signedDownloadUrl && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <a
                            href={doc.signedDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer">
                            <img
                              src={doc.signedDownloadUrl}
                              alt="Bank Slip Preview"
                              className="w-full max-h-72 object-contain rounded-xl bg-white border border-slate-200 p-1 shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MILESTONE & CASE ALLOCATION */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs print:hidden">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <Receipt className="h-4 w-4 text-amber-500" />
              Contracted Milestone Allocation
            </h3>

            {payment.installment ? (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                      #{payment.installment.sequenceNumber}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {payment.installment.title ||
                          `Milestone #${payment.installment.sequenceNumber}`}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Due Date: {formatDate(payment.installment.dueDate)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {formatMoney(payment.installment.amount, payment.currency)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-extrabold text-slate-800 block">
                  General Account Credit / Retainer
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  This transaction was credited directly against the total case
                  balance without tying to a specific milestone.
                </span>
              </div>
            )}

            {payment.operationalNotes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Caseworker Operational Remarks
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed">
                  "{payment.operationalNotes}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Client Dossier & Verifier Audit */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* CLIENT DOSSIER CARD */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <User className="h-4 w-4 text-amber-500" />
              Client Dossier & Application
            </h3>

            {payment.case ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {(payment.case.user?.name || "C").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {payment.case.user?.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Client ID:{" "}
                      <span className="font-bold text-slate-800">
                        {payment.case.user?.clientId || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="font-bold text-slate-800">
                      {payment.case.user?.email}
                    </span>
                  </div>
                  {payment.case.user?.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <span className="font-bold text-slate-800">
                        {payment.case.user.phone}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      Case Code:
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {payment.case.caseCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      Service Program:
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[180px] text-right">
                      {payment.case.service?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">
                      Destination:
                    </span>
                    <span className="font-bold text-slate-800">
                      {payment.case.destinationCountry || "Global"}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/clients/${payment.caseId}`)}
                  className="w-full text-xs font-bold rounded-xl border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer gap-2 mt-2">
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  Open Full Case Workspace
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Case particulars unavailable
              </p>
            )}
          </div>

          {/* VERIFIER AUDIT TRAIL */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Compliance & Verification Trail
            </h3>

            {isVerified ? (
              isStripe ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shadow-xs tracking-tight">
                      STRIPE
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-extrabold text-slate-900">
                          Stripe Payment Gateway
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Auto-Verified
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                        Webhook Engine • 256-Bit SSL HMAC
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                      GATEWAY
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      Status:{" "}
                      <strong className="text-slate-800 font-bold">
                        Ledger Credited &amp; Settled
                      </strong>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      Audit Stamp:{" "}
                      <strong className="text-slate-800 font-bold">
                        {formatDate(
                          payment.paymentDate ||
                            payment.recordedAt ||
                            (payment as any).createdAt,
                        )}
                      </strong>
                    </p>
                    {payment.stripePaymentIntentId && (
                      <p className="flex items-center gap-1.5 text-[10px]">
                        <Shield className="h-3 w-3 text-indigo-500 shrink-0" />
                        Reference:{" "}
                        <span className="font-mono text-slate-700 truncate">
                          {payment.stripePaymentIntentId}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                      {(payment.verifiedBy?.name || "A")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">
                        {payment.verifiedBy?.name || "Authorized Staff Member"}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {payment.verifiedBy?.email || "Staff Verification"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {payment.verifiedBy?.role?.name || "STAFF"}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Status:{" "}
                      <strong className="text-slate-800 font-bold">
                        Ledger Credited &amp; Settled
                      </strong>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Audit Stamp:{" "}
                      <strong className="text-slate-800 font-bold">
                        {formatDate(
                          payment.paymentDate ||
                            payment.recordedAt ||
                            (payment as any).createdAt,
                        )}
                      </strong>
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-extrabold">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Awaiting Staff Verification
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                  This transaction has not yet been approved. Once verified by a
                  manager or super admin, it will immediately credit the
                  client's case standing.
                </p>
                {canVerify && (
                  <Button
                    size="sm"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer gap-2">
                    {isVerifying ? "Verifying..." : "Verify & Credit Now"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
