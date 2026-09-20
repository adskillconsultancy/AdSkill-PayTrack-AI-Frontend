"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useCreateServiceMutation } from "@/services/api/services/servicesApi";
import {
  createServiceSchema,
  SERVICE_CATEGORIES,
  type CreateServiceFormValues,
} from "@/validations/service.schema";

const DURATION_PRESETS = [
  "1 - 3 Months",
  "3 - 6 Months",
  "6 - 9 Months",
  "9 - 12 Months",
  "12 - 18 Months",
  "Ongoing",
];

const CATEGORY_META: Record<
  string,
  { label: string; desc: string; badgeClass: string }
> = {
  IMMIGRATION: {
    label: "Immigration & Visas",
    desc: "Petitions, waivers, consular processing & residency filings",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  BUSINESS: {
    label: "Business Formation",
    desc: "Entity registrations, investor portfolios & commercial filings",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CONSULTATION: {
    label: "Strategic Advisory",
    desc: "One-on-one evaluations, audit reviews & strategy sessions",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  DMV_PSB: {
    label: "Licensing & PSB",
    desc: "State authorizations, credential validations & agency permits",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200",
  },
  CUSTOM: {
    label: "Custom Retainer",
    desc: "Tailored multi-jurisdiction or specialized client packages",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function CreateServiceForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // RTK Query Live Mutation
  const [createServiceMutation, { isLoading: isApiLoading }] =
    useCreateServiceMutation();

  // Fee Separation Input States (empty string initial to prevent leading zeros)
  const [govFee, setGovFee] = React.useState<string>("");
  const [attyFee, setAttyFee] = React.useState<string>("");
  const [thirdFee, setThirdFee] = React.useState<string>("");

  // Helper to prevent leading zeros when user types
  const handleFeeInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
        val = val.replace(/^0+/, "") || "0";
      }
      setter(val);
    };

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      category: "IMMIGRATION",
      description: "",
      baseFee: undefined,
      currency: "USD",
      defaultDeposit: undefined,
      defaultInstallments: undefined,
      estimatedDuration: "",
      isActive: true,
    },
  });

  const watchedBaseFee = watch("baseFee");
  const numBaseFee = Number(watchedBaseFee) || 0;
  const watchedName = watch("name") || "Untitled Service Offering";
  const watchedCategory = watch("category") || "IMMIGRATION";
  const watchedDuration = watch("estimatedDuration") || "";
  const watchedDeposit = watch("defaultDeposit");
  const numDeposit = Number(watchedDeposit) || 0;
  const watchedInstallments = watch("defaultInstallments");
  const numInstallments =
    watchedInstallments !== undefined &&
    watchedInstallments !== null &&
    !Number.isNaN(Number(watchedInstallments))
      ? Number(watchedInstallments)
      : undefined;
  const watchedCurrency = watch("currency") || "USD";
  const watchedIsActive = watch("isActive") ?? true;

  const numGovFee = Number(govFee) || 0;
  const numAttyFee = Number(attyFee) || 0;
  const numThirdFee = Number(thirdFee) || 0;

  const totalPassThrough = numGovFee + numAttyFee + numThirdFee;
  const totalClientCost = numBaseFee + totalPassThrough;

  const advisoryPercent =
    totalClientCost > 0
      ? Math.max(0, Math.min(100, Math.round((numBaseFee / totalClientCost) * 100)))
      : 100;
  const passThroughPercent = 100 - advisoryPercent;

  // Submit Handler (100% Live Backend API)
  const onSubmit = async (data: CreateServiceFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const depositVal =
      data.defaultDeposit !== undefined &&
      data.defaultDeposit !== null &&
      !Number.isNaN(Number(data.defaultDeposit))
        ? Number(data.defaultDeposit)
        : undefined;

    const installmentsVal =
      data.defaultInstallments !== undefined &&
      data.defaultInstallments !== null &&
      !Number.isNaN(Number(data.defaultInstallments))
        ? Number(data.defaultInstallments)
        : undefined;

    try {
      await createServiceMutation({
        name: data.name.trim(),
        category: data.category,
        description: data.description?.trim() || undefined,
        baseFee: Number(data.baseFee) || 0,
        estimatedGovFee: numGovFee,
        estimatedAttorneyFee: numAttyFee,
        estimatedThirdPartyFee: numThirdFee,
        currency: data.currency || "USD",
        defaultDeposit: depositVal,
        defaultInstallments: installmentsVal,
        estimatedDuration: data.estimatedDuration?.trim() || undefined,
        isActive: data.isActive,
      }).unwrap();

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.SERVICES);
      }, 700);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message ||
            "Failed to publish service offering. Please check all fields."
          : "Failed to publish service offering. Please check all fields.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. TOP HEADER & BREADCRUMB CARD (CLEAN LIGHT DESIGN) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shrink-0 transition-all">
              <Link href={ROUTES.SERVICES}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Service Catalog</span>
              </Link>
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Service Architecture
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Strict Fee Separation
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
                Configure Service Offering
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Define advisory pricing, isolate third-party pass-through costs, and establish default milestone schedules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.SERVICES)}
              className="h-10 px-4 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer">
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || isApiLoading}
              className="h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs gap-1.5 transition-all cursor-pointer">
              {isSubmitting || isApiLoading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Publishing...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publish Service Offering</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>
            Service Offering successfully registered into the catalog! Redirecting...
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700 font-bold animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. MAIN GRID: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: FORM SECTIONS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Service Identity & Program Categorization */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  1. Service Identity &amp; Program Categorization
                </h3>
                <p className="text-[11px] text-slate-500">
                  Official service title, category classification, and deliverable scope
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                  <span>
                    Program Title <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 normal-case">
                    Displayed on client proposals &amp; invoices
                  </span>
                </label>
                <Input
                  {...register("name")}
                  className="h-11 rounded-xl bg-slate-50/70 border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition-all"
                />
                {errors.name && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Service Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat] || {
                      label: cat,
                      desc: "General service offering",
                      badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    const isSelected = watchedCategory === cat;
                    return (
                      <div
                        key={cat}
                        onClick={() => setValue("category", cat, { shouldValidate: true })}
                        className={cn(
                          "cursor-pointer rounded-2xl border p-3.5 transition-all text-left flex items-start gap-3",
                          isSelected
                            ? "border-amber-500 bg-amber-50/40 ring-1 ring-amber-500 shadow-xs"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        )}>
                        <div
                          className={cn(
                            "mt-0.5 flex h-4 w-4 shrink-0 rounded-full border items-center justify-center transition-all",
                            isSelected
                              ? "border-amber-600 bg-amber-500 text-white"
                              : "border-slate-300 bg-white"
                          )}>
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900">
                            {meta.label}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {meta.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                  <span>Description &amp; Deliverables Scope</span>
                  <span className="text-[10px] font-semibold text-slate-400 normal-case">
                    Optional outline of representation services
                  </span>
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  className="w-full p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Strict Regulatory Fee Separation Architecture */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    2. Strict Regulatory Fee Separation Architecture
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Isolate taxable AdSkill advisory revenue from third-party agency and counsel disbursements
                  </p>
                </div>
              </div>
              <span className="self-start sm:self-auto text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Compliance Engine
              </span>
            </div>

            {/* 4-BOX CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Box 1: AdSkill Advisory Base Fee */}
              <div className="space-y-2 rounded-2xl bg-emerald-50/20 p-4 border border-emerald-200/90 transition-all hover:bg-emerald-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    Advisory Base Fee
                  </span>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    Firm Revenue
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    {...register("baseFee", {
                      setValueAs: (v) =>
                        v === "" || v === null || Number.isNaN(v) ? undefined : Number(v),
                    })}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
                        val = val.replace(/^0+/, "") || "0";
                        e.target.value = val;
                      }
                      setValue(
                        "baseFee",
                        val === "" ? (undefined as unknown as number) : Number(val),
                        { shouldValidate: true }
                      );
                    }}
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                {errors.baseFee && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.baseFee.message}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 leading-tight">
                  Firm professional fee (accounted as earned revenue).
                </p>
              </div>

              {/* Box 2: Gov / Filing Fee */}
              <div className="space-y-2 rounded-2xl bg-sky-50/20 p-4 border border-sky-200/90 transition-all hover:bg-sky-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    Gov / Filing Fee
                  </span>
                  <span className="font-mono text-[10px] font-bold text-sky-700 uppercase bg-sky-100/70 px-2 py-0.5 rounded-md">
                    Pass-Through
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={govFee}
                    onChange={handleFeeInputChange(setGovFee)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  USCIS or government filing disbursement.
                </p>
              </div>

              {/* Box 3: Attorney Representation */}
              <div className="space-y-2 rounded-2xl bg-violet-50/20 p-4 border border-violet-200/90 transition-all hover:bg-violet-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    Attorney Fee
                  </span>
                  <span className="font-mono text-[10px] font-bold text-violet-700 uppercase bg-violet-100/70 px-2 py-0.5 rounded-md">
                    Pass-Through
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={attyFee}
                    onChange={handleFeeInputChange(setAttyFee)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Outside legal counsel fee disbursement.
                </p>
              </div>

              {/* Box 4: Evaluations / 3rd Party */}
              <div className="space-y-2 rounded-2xl bg-amber-50/20 p-4 border border-amber-200/90 transition-all hover:bg-amber-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">
                    3rd Party / Evals
                  </span>
                  <span className="font-mono text-[10px] font-bold text-amber-800 uppercase bg-amber-100/70 px-2 py-0.5 rounded-md">
                    Pass-Through
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={thirdFee}
                    onChange={handleFeeInputChange(setThirdFee)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Translations, credential evals, business plans.
                </p>
              </div>
            </div>

            {/* Total Client Out-of-Pocket Summary Card (NO BLACK BANNER — PURE LIGHT SAAS) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-amber-600 shadow-2xs">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">
                      Total Client Out-of-Pocket Estimate
                    </div>
                    <div className="text-[11px] text-slate-500">
                      AdSkill Base (${numBaseFee.toLocaleString()}) + Total Pass-Through (${totalPassThrough.toLocaleString()})
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Combined Cost
                  </div>
                  <div className="flex items-baseline sm:justify-end gap-1.5">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900">
                      ${totalClientCost.toLocaleString()}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {watchedCurrency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dual-color Progress Ratio Bar */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    AdSkill Advisory: {advisoryPercent}% (${numBaseFee.toLocaleString()})
                  </span>
                  <span className="text-sky-700 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    Pass-Through Escrow: {passThroughPercent}% (${totalPassThrough.toLocaleString()})
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${advisoryPercent}%` }}
                  />
                  <div
                    className="h-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${passThroughPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Program Billing Currency:
              </span>
              <select
                {...register("currency")}
                className="h-10 px-3.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer">
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="CAD">CAD (C$) — Canadian Dollar</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="EUR">EUR (€) — Euro</option>
              </select>
            </div>
          </div>

          {/* Section 3: Client Payment Plan & Milestone Defaults */}
          <div className="p-6 sm:p-7 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  3. Client Payment Plan &amp; Milestone Defaults
                </h3>
                <p className="text-[11px] text-slate-500">
                  Default upfront retainer, installment cadence, and turnaround timeline for new case intake
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                  <span>Initial Retainer ($)</span>
                  {totalClientCost > 0 && numDeposit > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700">
                      {Math.round((numDeposit / totalClientCost) * 100)}% of total
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("defaultDeposit", {
                    setValueAs: (v) =>
                      v === "" || v === null || Number.isNaN(v) ? undefined : Number(v),
                  })}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
                      val = val.replace(/^0+/, "") || "0";
                      e.target.value = val;
                    }
                    setValue(
                      "defaultDeposit",
                      val === "" ? (undefined as unknown as number) : Number(val),
                      { shouldValidate: true }
                    );
                  }}
                  className="h-11 rounded-xl bg-slate-50/70 border-slate-200 font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition-all"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Leave empty or 0 to default new cases to Full Upfront Payment.
                </p>
                {errors.defaultDeposit && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.defaultDeposit.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                  <span>Number of Milestones</span>
                  {numInstallments && numInstallments > 1 && totalClientCost > numDeposit && (
                    <span className="text-[10px] font-bold text-sky-700">
                      ~${Math.round((totalClientCost - numDeposit) / numInstallments).toLocaleString()} ea.
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  {...register("defaultInstallments", {
                    setValueAs: (v) =>
                      v === "" || v === null || Number.isNaN(v) ? undefined : Number(v),
                  })}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val.length > 1 && val.startsWith("0")) {
                      val = val.replace(/^0+/, "") || "0";
                      e.target.value = val;
                    }
                    setValue(
                      "defaultInstallments",
                      val === "" ? (undefined as unknown as number) : Number(val),
                      { shouldValidate: true }
                    );
                  }}
                  className="h-11 rounded-xl bg-slate-50/70 border-slate-200 font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition-all"
                />
                <p className="text-[10px] text-slate-500 leading-tight">
                  Installments count. If 0 or 1, treated as Full Payment.
                </p>
                {errors.defaultInstallments && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.defaultInstallments.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Estimated Timeline <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("estimatedDuration")}
                  className="h-11 rounded-xl bg-slate-50/70 border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 transition-all"
                />
                {errors.estimatedDuration && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.estimatedDuration.message}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Duration Chips */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick Timeline Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setValue("estimatedDuration", dur, { shouldValidate: true })}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                      watchedDuration === dur
                        ? "bg-amber-50 border-amber-300 text-amber-900 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}>
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Status Switch */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  Active Offering Status
                </span>
                <span className="text-[11px] text-slate-500">
                  Instantly publish to client case onboarding directory
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SUMMARY PREVIEW CARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          <div className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Live Offering Specification
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Catalog Preview
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="inline-block font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  SKU: Auto-assigned
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-2 leading-tight">
                  {watchedName}
                </h4>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                    {watchedCategory.replace("_", " ")}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border",
                      watchedIsActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        watchedIsActive ? "bg-emerald-500" : "bg-slate-400"
                      )}
                    />
                    {watchedIsActive ? "Active" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Itemized Fee Breakdown */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    AdSkill Advisory Base:
                  </span>
                  <strong className="text-emerald-700 font-mono font-bold">
                    ${numBaseFee.toLocaleString()}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    USCIS / Filing Fee:
                  </span>
                  <span className="font-mono text-sky-700 font-bold">
                    ${numGovFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    Attorney Fee:
                  </span>
                  <span className="font-mono text-violet-700 font-bold">
                    ${numAttyFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    3rd Party Evaluations:
                  </span>
                  <span className="font-mono text-amber-800 font-bold">
                    ${numThirdFee.toLocaleString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900">Total Client Cost:</span>
                  <span className="font-mono text-lg font-black text-slate-900">
                    ${totalClientCost.toLocaleString()}{" "}
                    <span className="text-[11px] text-slate-500 font-bold">
                      {watchedCurrency}
                    </span>
                  </span>
                </div>
              </div>

              {/* Engagement Terms Snapshot */}
              <div className="rounded-2xl bg-slate-50/70 p-3.5 border border-slate-200/80 space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    Timeline: {watchedDuration ? watchedDuration : "Pending definition"}
                  </span>
                </div>
                {numDeposit > 0 && numInstallments !== undefined && numInstallments > 1 ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Initial Retainer:</span>
                      <strong className="text-slate-900 font-mono">
                        ${numDeposit.toLocaleString()} upfront
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Installments:</span>
                      <strong className="text-slate-900 font-mono">
                        {numInstallments} milestones
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Full Payment (100% upfront on execution)
                  </div>
                )}
              </div>

              {/* Action Button (Amber styling, no pitch black) */}
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || isApiLoading}
                className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs gap-1.5 transition-all cursor-pointer">
                {isSubmitting || isApiLoading ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Publishing Offering...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Publish Offering Now</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
