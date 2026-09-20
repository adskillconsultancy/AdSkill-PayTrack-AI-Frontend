"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Briefcase,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Landmark,
  Layers,
  Lock,
  Pencil,
  Receipt,
  Scale,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  useGetServiceByIdQuery,
  useGetServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from "@/services/api/services/servicesApi";
import type { BackendService, BackendServiceCategory } from "../types";

interface ServiceDetailViewProps {
  serviceId: string;
}

const CATEGORY_STYLES: Record<
  BackendServiceCategory,
  { label: string; className: string }
> = {
  IMMIGRATION: {
    label: "Immigration & Visas",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  BUSINESS: {
    label: "Business Formation",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CONSULTATION: {
    label: "Strategic Advisory",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  DMV_PSB: {
    label: "Licensing & PSB",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CUSTOM: {
    label: "Custom Retainer",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const formatCurrency = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value?: string) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ServiceDetailView({ serviceId }: ServiceDetailViewProps) {
  const router = useRouter();
  const [copiedSku, setCopiedSku] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  // 1. Direct query by ID
  const {
    data: directResponse,
    isLoading: isDirectLoading,
    isFetching,
    refetch: refetchDirect,
  } = useGetServiceByIdQuery(serviceId);

  // 2. Fallback query by code in all services (e.g. for /services/CUSTOM-PKG)
  const { data: allServicesResponse, isLoading: isAllLoading } =
    useGetServicesQuery({ limit: 100 }, { skip: !serviceId });

  const [deleteServiceMutation, { isLoading: isDeleting }] =
    useDeleteServiceMutation();
  const [updateServiceMutation, { isLoading: isUpdating }] =
    useUpdateServiceMutation();

  // Resolve service from direct query or catalog code lookup
  const service: BackendService | null = React.useMemo(() => {
    if (directResponse) {
      if ("data" in directResponse && directResponse.data) {
        return directResponse.data as BackendService;
      }
      if ("id" in directResponse) {
        return directResponse as unknown as BackendService;
      }
    }
    if (allServicesResponse?.data) {
      const found = allServicesResponse.data.find(
        (s) =>
          s.code?.toLowerCase() === serviceId.toLowerCase() ||
          s.id === serviceId,
      );
      if (found) return found;
    }
    return null;
  }, [directResponse, allServicesResponse, serviceId]);

  const isLoading = (isDirectLoading || isAllLoading) && !service;

  const clearStatusSoon = (timeout = 2500) => {
    window.setTimeout(() => setStatusMessage(null), timeout);
  };

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(true);
    setStatusMessage(`SKU ${sku} copied to clipboard`);
    window.setTimeout(() => setCopiedSku(false), 2500);
    clearStatusSoon();
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setStatusMessage("Service offering link copied to clipboard");
    window.setTimeout(() => setCopiedLink(false), 2500);
    clearStatusSoon();
  };

  const handleToggleStatus = async () => {
    if (!service) return;
    const newStatus = !service.isActive;
    const confirmMsg = newStatus
      ? `Reactivate service offering "${service.name}" (${service.code})?`
      : `Deactivate service offering "${service.name}" (${service.code})? It will no longer be available for client intake.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateServiceMutation({
        id: service.id,
        data: { isActive: newStatus },
      }).unwrap();
      setStatusMessage(`Service is now ${newStatus ? "active" : "inactive"}`);
      clearStatusSoon(3500);
      refetchDirect();
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message ||
            "Failed to update service status"
          : "Failed to update service status";
      alert(msg);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    if (
      !window.confirm(
        `Are you sure you want to delete "${service.name}" (${service.code}) from the active catalog?`,
      )
    ) {
      return;
    }

    try {
      await deleteServiceMutation(service.id).unwrap();
      router.push(ROUTES.SERVICES);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message ||
            "Failed to delete service offering"
          : "Failed to delete service offering";
      alert(msg);
    }
  };

  const renderCategoryBadge = (category: BackendServiceCategory) => {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.CUSTOM;
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
          style.className,
        )}>
        {style.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <Loader
          size="lg"
          text="Loading service offering..."
          subtext="Resolving fee separation architecture and milestone terms."
        />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-slate-400" />}
          title={`Service Offering "${serviceId}" Not Found`}
          description="The requested service package or SKU identifier could not be located in the catalog."
          action={
            <Button
              variant="default"
              onClick={() => router.push(ROUTES.SERVICES)}
              className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs">
              Back to Catalog
            </Button>
          }
        />
      </div>
    );
  }

  const currency = service.currency || "USD";
  const base = Number(service.baseFee || 0);
  const gov = Number(service.estimatedGovFee || 0);
  const attorney = Number(service.estimatedAttorneyFee || 0);
  const thirdParty = Number(service.estimatedThirdPartyFee || 0);
  const passThrough = gov + attorney + thirdParty;
  const totalCost = base + passThrough;

  const rawDeposit =
    service.defaultDeposit !== undefined && service.defaultDeposit !== null
      ? Number(service.defaultDeposit)
      : null;
  const deposit =
    rawDeposit !== null && !Number.isNaN(rawDeposit) ? rawDeposit : null;

  const rawInstallments =
    service.defaultInstallments !== undefined &&
    service.defaultInstallments !== null
      ? Number(service.defaultInstallments)
      : null;
  const installments =
    rawInstallments !== null && !Number.isNaN(rawInstallments)
      ? rawInstallments
      : null;

  const isFullPayment =
    deposit === null || deposit <= 0 || installments === null || installments <= 1;

  const advisoryShare =
    totalCost > 0
      ? Math.max(0, Math.min(100, Math.round((base / totalCost) * 100)))
      : 100;
  const passThroughShare = 100 - advisoryShare;

  const feeRows = [
    {
      label: "AdSkill Advisory Base",
      value: base,
      detail: "Firm professional fee (accounted as taxable revenue)",
      icon: Sparkles,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      badge: "Firm Revenue",
      badgeClass: "bg-emerald-100/70 text-emerald-800",
    },
    {
      label: "Government Filing Fee",
      value: gov,
      detail: "USCIS or designated agency regulatory filing disbursement",
      icon: Landmark,
      color: "text-sky-700 bg-sky-50 border-sky-200",
      badge: "Pass-Through",
      badgeClass: "bg-sky-100/70 text-sky-800",
    },
    {
      label: "Attorney Representation",
      value: attorney,
      detail: "Outside legal counsel retainer and petition disbursement",
      icon: Lock,
      color: "text-violet-700 bg-violet-50 border-violet-200",
      badge: "Pass-Through",
      badgeClass: "bg-violet-100/70 text-violet-800",
    },
    {
      label: "Third-Party Auxiliary Expenses",
      value: thirdParty,
      detail: "Certified translations, credential evaluations & expert plans",
      icon: Layers,
      color: "text-amber-800 bg-amber-50 border-amber-200",
      badge: "Pass-Through",
      badgeClass: "bg-amber-100/70 text-amber-800",
    },
  ];

  const serviceFacts = [
    {
      label: "Turnaround Timeline",
      value: service.estimatedDuration || "Custom timeline",
      icon: Clock,
    },
    {
      label: "Initial Retainer",
      value:
        !isFullPayment && deposit && deposit > 0
          ? `${formatCurrency(deposit, currency)} Upfront`
          : "Full Payment (100%)",
      icon: WalletCards,
    },
    {
      label: "Milestone Cadence",
      value:
        !isFullPayment && installments && installments > 1
          ? `${installments} Milestones`
          : "Full Upfront Payment",
      icon: CalendarRange,
    },
  ];

  return (
    <div className="w-full space-y-6 pb-20">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-xs font-bold text-emerald-800 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER & BREADCRUMB CARD (CLEAN LIGHT DESIGN) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shrink-0 transition-all">
              <Link href={ROUTES.SERVICES}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Services Catalog</span>
              </Link>
            </Button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Catalog
                </span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <Link
                  href={ROUTES.SERVICES}
                  className="text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900">
                  Services
                </Link>
                <ChevronRight className="h-3 w-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => handleCopySku(service.code)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px] font-bold hover:bg-slate-200/70 transition-all cursor-pointer">
                  <span>{service.code}</span>
                  {copiedSku ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-slate-400" />
                  )}
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
                {service.name}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              disabled={isUpdating}
              className="h-10 px-3.5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 gap-2 transition-all cursor-pointer">
              {service.isActive ? (
                <>
                  <Ban className="h-3.5 w-3.5 text-rose-500" />
                  <span>Deactivate</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Reactivate</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-10 px-3.5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 gap-2 transition-all cursor-pointer">
              {copiedLink ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
              )}
              <span>Share Link</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 px-3.5 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 gap-2 transition-all">
              <Link href={`/services/${service.code || service.id}/edit`}>
                <Pencil className="h-3.5 w-3.5 text-amber-600" />
                <span>Edit Offering</span>
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs gap-2 transition-all">
              <Link href={ROUTES.CLIENT_CREATE}>
                <UserPlus className="h-4 w-4" />
                <span>Enroll Client with Package</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. HERO CARD (NO BLACK BOX — MODERN CLEAN LIGHT SAAS DESIGN) */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {renderCategoryBadge(service.category)}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
                  service.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600",
                )}>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    service.isActive
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-400",
                  )}
                />
                {service.isActive ? "Active in Catalog" : "Inactive Offering"}
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                {service.name}
              </h2>
              <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 max-w-3xl">
                {service.description ||
                  "Comprehensive immigration and advisory service offering with strict regulatory fee separation, pass-through disbursements, and default milestone payment terms."}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              {serviceFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div
                    key={fact.label}
                    className="rounded-2xl border border-slate-200/90 bg-slate-50/70 px-4 py-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <Icon className="h-3.5 w-3.5 text-amber-500" />
                      {fact.label}
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">
                      {fact.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Financial Box (REPLACING THE OLD BLACK CONTAINER) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Client Commitment
              </div>
              <div className="mt-1 font-mono text-3xl font-black tracking-tight text-slate-900">
                {formatCurrency(totalCost, currency)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700">
                  {formatCurrency(base, currency)} Advisory
                </span>
                <span className="text-sky-700">
                  {formatCurrency(passThrough, currency)} Pass-Through
                </span>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-200/80">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <span>AdSkill ({advisoryShare}%)</span>
                <span>Pass-Through ({passThroughShare}%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${advisoryShare}%` }}
                />
                <div
                  className="h-full bg-sky-500 transition-all duration-700"
                  style={{ width: `${passThroughShare}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: 2-COLUMN GRID */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        {/* LEFT COLUMN: ARCHITECTURE & ENGAGEMENT (8 COLS) */}
        <div className="space-y-6">
          {/* Section: Fee Architecture */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <Scale className="h-4 w-4 text-amber-500" />
                  <span>Fee Architecture</span>
                </div>
                <h3 className="mt-1 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  Separation of Advisory Revenue &amp; Pass-Through Costs
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Audit Ready
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {feeRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="grid gap-3 py-4 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border",
                        row.color,
                      )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {row.label}
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded",
                            row.badgeClass,
                          )}>
                          {row.badge}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {row.detail}
                      </div>
                    </div>
                    <div className="font-mono text-xl sm:text-2xl font-black tracking-tight text-slate-900 text-left sm:text-right">
                      {formatCurrency(row.value, currency)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary Totals */}
            <div className="grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-emerald-50/40 border border-emerald-100 p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Firm Advisory Revenue
                </div>
                <div className="mt-1 font-mono text-xl font-black text-emerald-700">
                  {formatCurrency(base, currency)}
                </div>
              </div>

              <div className="rounded-2xl bg-sky-50/40 border border-sky-100 p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                  Pass-Through Disbursements
                </div>
                <div className="mt-1 font-mono text-xl font-black text-sky-700">
                  {formatCurrency(passThrough, currency)}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Total Client Out-of-Pocket
                </div>
                <div className="mt-1 font-mono text-xl font-black text-slate-900">
                  {formatCurrency(totalCost, currency)}
                </div>
              </div>
            </div>
          </section>

          {/* Section: Engagement Setup & Milestone Cadence */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                <CalendarRange className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Engagement Setup
                </div>
                <h3 className="mt-0.5 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  Default Payment Plan &amp; Delivery Milestones
                </h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Upfront Retainer Deposit
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                  {!isFullPayment && deposit && deposit > 0
                    ? formatCurrency(deposit, currency)
                    : "Full Payment"}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {!isFullPayment && deposit && deposit > 0
                    ? `Due upon agreement execution (${totalCost > 0 ? Math.round((deposit / totalCost) * 100) : 0}% of package)`
                    : "100% due upon contract execution"}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Milestone Plan Schedule
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                  {!isFullPayment && installments && installments > 1
                    ? `${installments} Milestones`
                    : "Single Payment"}
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {!isFullPayment && installments && installments > 1
                    ? `~${formatCurrency(Math.round((totalCost - (deposit || 0)) / installments), currency)} per checkpoint`
                    : "Single upfront disbursement"}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Deliverable Scope &amp; Legal Framework</span>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                {service.description ||
                  "This service package can be directly attached to client case profiles to auto-generate invoices, track pass-through disbursements, and issue official payment receipts."}
              </p>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: SIDEBAR (4 COLS) */}
        <aside className="space-y-6">
          {/* System Record Card */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  System Record
                </div>
                <div className="mt-0.5 font-mono text-sm font-black text-slate-900">
                  {service.code}
                </div>
              </div>
              <Receipt className="h-5 w-5 text-amber-500" />
            </div>

            <dl className="divide-y divide-slate-100">
              {[
                ["Catalog Status", service.isActive ? "Active" : "Inactive"],
                ["Billing Currency", currency],
                ["Created By", service.createdBy?.name || "System Admin"],
                ["Date Created", formatDate(service.createdAt)],
                ["Last Updated", formatDate(service.updatedAt)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 py-2.5 text-xs">
                  <dt className="font-semibold text-slate-500">{label}</dt>
                  <dd className="text-right font-bold text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Quick Management Actions Card */}
          <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Management Actions
            </div>

            <Button
              asChild
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs gap-2 transition-all">
              <Link href={`/services/${service.code || service.id}/edit`}>
                <Pencil className="h-4 w-4" />
                <span>Edit Service Offering</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full h-11 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 gap-2 transition-all">
              <Link href={ROUTES.CLIENT_CREATE}>
                <UserPlus className="h-4 w-4 text-amber-600" />
                <span>Enroll Client with this Package</span>
              </Link>
            </Button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
              {copiedLink ? (
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Share2 className="h-4 w-4 text-slate-400 shrink-0" />
              )}
              <span>{copiedLink ? "Link Copied" : "Copy Service Link"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopySku(service.code)}
              className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer">
              {copiedSku ? (
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400 shrink-0" />
              )}
              <span>{copiedSku ? "SKU Copied" : "Copy SKU Identifier"}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 px-4 text-left text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all disabled:opacity-50 cursor-pointer">
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Deactivate Offering</span>
            </button>
          </section>

          {/* Compliance & Policy Alert */}
          <section className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div>
                <div className="text-xs font-extrabold text-amber-900">
                  Regulatory Compliance Standard
                </div>
                <p className="mt-1 text-xs font-medium leading-relaxed text-amber-800/90">
                  USCIS, attorney representation, and auxiliary filing costs are segregated into pass-through escrow accounts and excluded from AdSkill taxable gross advisory revenue.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
