"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useGetServiceByIdQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} from "@/services/api/services/servicesApi";
import type { BackendService, BackendServiceCategory } from "../types";
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
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ServiceDetailViewProps {
  serviceId: string;
}

const categoryStyles: Record<
  BackendServiceCategory,
  { label: string; className: string }
> = {
  IMMIGRATION: {
    label: "Immigration",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  BUSINESS: {
    label: "Business",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CONSULTATION: {
    label: "Consultation",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  DMV_PSB: {
    label: "DMV / PSB",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CUSTOM: {
    label: "Custom Package",
    className: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const dateLabel = (value: string, style: "long" | "short" = "short") =>
  new Date(value).toLocaleDateString("en-US", {
    month: style,
    day: "numeric",
    year: "numeric",
  });

export function ServiceDetailView({ serviceId }: ServiceDetailViewProps) {
  const router = useRouter();
  const [copiedSku, setCopiedSku] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const {
    data: directResponse,
    isLoading: isDirectLoading,
    isFetching,
    refetch: refetchDirect,
  } = useGetServiceByIdQuery(serviceId);

  const [deleteServiceMutation, { isLoading: isDeleting }] =
    useDeleteServiceMutation();
  const [updateServiceMutation, { isLoading: isUpdating }] =
    useUpdateServiceMutation();

  const service: BackendService | null = React.useMemo(() => {
    if (!directResponse) return null;
    if ("data" in directResponse && directResponse.data) {
      return directResponse.data as BackendService;
    }
    if ("id" in directResponse) {
      return directResponse as unknown as BackendService;
    }
    return null;
  }, [directResponse]);

  const isLoading = isDirectLoading || (isFetching && !service);

  const clearStatusSoon = (timeout = 2500) => {
    window.setTimeout(() => setStatusMessage(null), timeout);
  };

  const handleCopySku = (sku: string) => {
    navigator.clipboard.writeText(sku);
    setCopiedSku(true);
    setStatusMessage(`SKU ${sku} copied`);
    window.setTimeout(() => setCopiedSku(false), 2500);
    clearStatusSoon();
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setStatusMessage("Service link copied");
    window.setTimeout(() => setCopiedLink(false), 2500);
    clearStatusSoon();
  };

  const handleToggleStatus = async () => {
    if (!service) return;
    const newStatus = !service.isActive;
    const confirmMsg = newStatus
      ? `Reactivate service offering "${service.name}" (${service.code})?`
      : `Deactivate service offering "${service.name}" (${service.code})? Clients will not be able to enroll in this package.`;

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
        `Are you sure you want to permanently deactivate "${service.name}" (${service.code}) from the catalog?`,
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
            "Failed to delete service"
          : "Failed to delete service";
      alert(msg);
    }
  };

  const renderCategoryBadge = (category: BackendServiceCategory) => {
    const categoryStyle = categoryStyles[category] || categoryStyles.CUSTOM;

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
          categoryStyle.className,
        )}
      >
        {categoryStyle.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <Loader
          size="lg"
          text="Loading service package..."
          subtext="Resolving fee schedule, milestone defaults, and status."
        />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-[#64748B]" />}
          title={`Service SKU "${serviceId}" Not Found`}
          description="The requested service package or SKU identifier could not be located in the active catalog directory."
          action={
            <Button
              variant="default"
              onClick={() => router.push(ROUTES.SERVICES)}
              className="h-10 px-4 text-xs font-semibold"
            >
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
    totalCost > 0 ? Math.max(0, Math.min(100, Math.round((base / totalCost) * 100))) : 100;
  const passThroughShare = 100 - advisoryShare;

  const feeRows = [
    {
      label: "Advisory base",
      value: base,
      detail: "Firm revenue",
      icon: Sparkles,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Government filing",
      value: gov,
      detail: "Agency pass-through",
      icon: Landmark,
      color: "text-sky-700 bg-sky-50 border-sky-200",
    },
    {
      label: "Attorney estimate",
      value: attorney,
      detail: "Counsel pass-through",
      icon: Lock,
      color: "text-violet-700 bg-violet-50 border-violet-200",
    },
    {
      label: "Third-party expenses",
      value: thirdParty,
      detail: "Auxiliary pass-through",
      icon: Layers,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
  ];

  const serviceFacts = [
    {
      label: "Duration",
      value: service.estimatedDuration || "Custom timeline",
      icon: Clock,
    },
    {
      label: "Deposit",
      value:
        !isFullPayment && deposit && deposit > 0
          ? money(deposit, currency)
          : "Full Payment (100%)",
      icon: WalletCards,
    },
    {
      label: "Installments",
      value:
        !isFullPayment && installments && installments > 1
          ? `${installments} milestones`
          : "Full Payment (No installments)",
      icon: CalendarRange,
    },
  ];

  return (
    <div className="pb-12">
      {statusMessage && (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs font-bold text-emerald-700 shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" className="h-10 w-10">
            <Link href={ROUTES.SERVICES}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to services</span>
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
              <span>Catalog</span>
              <ChevronRight className="h-3 w-3" />
              <Link href={ROUTES.SERVICES} className="hover:text-[#0a0a0a]">
                Services
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-mono text-[#0a0a0a]">{service.code}</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#0a0a0a]">
              Service package
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isUpdating}
            className="h-10 gap-2 px-3.5"
          >
            {service.isActive ? (
              <>
                <Ban className="h-3.5 w-3.5 text-rose-500" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Reactivate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopySku(service.code)}
            className="h-10 gap-2 px-3.5"
          >
            {copiedSku ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            SKU
          </Button>

          <Button asChild variant="outline" size="sm" className="h-10 gap-2 px-3.5 border-[#EAE6DF] hover:bg-[#FAF8F5]">
            <Link href={`/services/${service.code || service.id}/edit`}>
              <Pencil className="h-3.5 w-3.5 text-[#F3A712]" />
              <span>Edit Offering</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-10 gap-2 px-4">
            <Link href={ROUTES.CLIENT_CREATE}>
              <UserPlus className="h-4 w-4 text-[#F3A712]" />
              Enroll client
            </Link>
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[1.5rem] border border-[#EAE6DF] bg-white shadow-sm">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="relative min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {renderCategoryBadge(service.category)}
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
                  service.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#EAE6DF] bg-[#FAF8F5] text-[#64748B]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    service.isActive ? "bg-emerald-600" : "bg-[#94A3B8]",
                  )}
                />
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <h2 className="mt-3 max-w-3xl text-2xl font-black tracking-tight text-[#0a0a0a] sm:text-3xl">
              {service.name}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748B]">
              {service.description ||
                "Custom advisory package with separated pass-through costs, default engagement milestones, and client enrollment controls."}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {serviceFacts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div
                    key={fact.label}
                    className="rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-[#64748B]">
                      <Icon className="h-3.5 w-3.5 text-[#F3A712]" />
                      {fact.label}
                    </div>
                    <div className="mt-1.5 text-sm font-black text-[#0a0a0a]">
                      {fact.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[#0a0a0a] p-5 text-white">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-white/45">
                Estimated total
              </div>
              <div className="mt-1 font-mono text-3xl font-black tracking-tight">
                {money(totalCost, currency)}
              </div>
              <div className="mt-1 text-xs font-semibold text-[#F3A712]">
                {money(base, currency)} advisory revenue
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-white/45">
                <span>Advisory</span>
                <span>Pass-through</span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-white/12">
                <div
                  className="bg-[#F3A712] transition-all duration-700"
                  style={{ width: `${advisoryShare}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-white/55">
                <span>{advisoryShare}%</span>
                <span>{passThroughShare}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#EAE6DF] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[#F1ECE4] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                  <Scale className="h-4 w-4 text-[#F3A712]" />
                  Fee architecture
                </div>
                <h3 className="mt-2 text-xl font-black tracking-tight text-[#0a0a0a]">
                  Revenue and client disbursements stay separated.
                </h3>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Audit ready
              </span>
            </div>

            <div className="divide-y divide-[#F5F1EC]">
              {feeRows.map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="grid gap-4 py-5 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl border",
                        row.color,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-[#0a0a0a]">
                        {row.label}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-[#64748B]">
                        {row.detail}
                      </div>
                    </div>
                    <div className="font-mono text-2xl font-black tracking-tight text-[#0a0a0a]">
                      {money(row.value, currency)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 border-t border-[#F1ECE4] pt-5 sm:grid-cols-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wide text-[#94A3B8]">
                  Firm revenue
                </div>
                <div className="mt-1 font-mono text-lg font-black text-emerald-700">
                  {money(base, currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wide text-[#94A3B8]">
                  Pass-through
                </div>
                <div className="mt-1 font-mono text-lg font-black text-[#0a0a0a]">
                  {money(passThrough, currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wide text-[#94A3B8]">
                  Total client cost
                </div>
                <div className="mt-1 font-mono text-lg font-black text-[#0a0a0a]">
                  {money(totalCost, currency)}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#EAE6DF] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3A712] text-white">
                <CalendarRange className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                  Engagement setup
                </div>
                <h3 className="mt-1 text-xl font-black tracking-tight text-[#0a0a0a]">
                  Default payment structure
                </h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#FAF8F5] p-5">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                  Upfront retainer
                </div>
                <div className="mt-2 font-mono text-3xl font-black text-[#0a0a0a]">
                  {!isFullPayment && deposit && deposit > 0
                    ? money(deposit, currency)
                    : "Full Payment"}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#64748B]">
                  {!isFullPayment && deposit && deposit > 0
                    ? `Due at engagement start (${totalCost > 0 ? Math.round((deposit / totalCost) * 100) : 0}% of total)`
                    : "100% due upon contract execution"}
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] p-5">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">
                  Installment plan
                </div>
                <div className="mt-2 font-mono text-3xl font-black text-[#0a0a0a]">
                  {!isFullPayment && installments && installments > 1
                    ? `${installments}`
                    : "Full"}
                </div>
                <div className="mt-1 text-xs font-semibold text-[#64748B]">
                  {!isFullPayment && installments && installments > 1
                    ? `Milestone checkpoints (${money(Math.round((totalCost - (deposit || 0)) / installments), currency)} each)`
                    : "Single upfront full payment"}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-[#F1ECE4] pt-5">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                <FileText className="h-4 w-4 text-[#F3A712]" />
                Scope
              </div>
              <p className="max-w-3xl text-sm font-medium leading-7 text-[#334155]">
                {service.description ||
                  "This package can be attached to a client profile to create invoices, payment checkpoints, and pass-through tracking for the engagement."}
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#EAE6DF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#F1ECE4] pb-4">
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                  System record
                </div>
                <div className="mt-1 font-mono text-sm font-black text-[#0a0a0a]">
                  {service.code}
                </div>
              </div>
              <Receipt className="h-5 w-5 text-[#F3A712]" />
            </div>

            <dl className="mt-2 divide-y divide-[#F5F1EC]">
              {[
                ["Status", service.isActive ? "Active" : "Inactive"],
                ["Currency", currency],
                ["Created by", service.createdBy?.name || "System Admin"],
                ["Created", dateLabel(service.createdAt, "long")],
                ["Updated", dateLabel(service.updatedAt)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-3 text-xs"
                >
                  <dt className="font-bold text-[#64748B]">{label}</dt>
                  <dd className="text-right font-black text-[#0a0a0a]">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-[1.5rem] border border-[#EAE6DF] bg-white p-5 shadow-sm">
            <div className="mb-4 text-[11px] font-black uppercase tracking-wider text-[#64748B]">
              Actions
            </div>
            <div className="space-y-2">
              <Button asChild className="h-11 w-full justify-start gap-2 bg-[#0a0a0a] text-white hover:bg-[#171717]">
                <Link href={`/services/${service.code || service.id}/edit`}>
                  <Pencil className="h-4 w-4 text-[#F3A712]" />
                  Edit Service Offering
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-11 w-full justify-start gap-2 border-[#EAE6DF] hover:bg-[#FAF8F5]">
                <Link href={ROUTES.CLIENT_CREATE}>
                  <UserPlus className="h-4 w-4 text-[#F3A712]" />
                  Enroll client with this package
                </Link>
              </Button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-11 w-full items-center gap-3 rounded-xl border border-[#EAE6DF] bg-white px-4 text-left text-xs font-bold text-[#0a0a0a] transition-colors hover:bg-[#FAF8F5]"
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Share2 className="h-4 w-4 text-[#64748B]" />
                )}
                {copiedLink ? "Link copied" : "Copy service link"}
              </button>

              <button
                type="button"
                onClick={() => handleCopySku(service.code)}
                className="flex h-11 w-full items-center gap-3 rounded-xl border border-[#EAE6DF] bg-white px-4 text-left text-xs font-bold text-[#0a0a0a] transition-colors hover:bg-[#FAF8F5]"
              >
                {copiedSku ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4 text-[#64748B]" />
                )}
                {copiedSku ? "SKU copied" : "Copy SKU"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex h-11 w-full items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 text-left text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Deactivate offering
              </button>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
              <div>
                <div className="text-xs font-black text-amber-900">
                  Pass-through policy
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-amber-800/80">
                  Government, attorney, and auxiliary estimates are tracked
                  separately from AdSkill advisory revenue.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
