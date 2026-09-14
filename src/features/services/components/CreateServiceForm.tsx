"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createServiceSchema,
  SERVICE_CATEGORIES,
  type CreateServiceFormValues,
} from "@/validations/service.schema";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useCreateServiceMutation } from "@/services/api/services/servicesApi";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Scale,
  FileSpreadsheet,
  Info,
  Clock,
  DollarSign,
  Building2,
  Sparkles,
} from "lucide-react";

export function CreateServiceForm() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // RTK Query Live Mutation
  const [createServiceMutation, { isLoading: isApiLoading }] = useCreateServiceMutation();

  // Fee Separation Input States
  const [govFee, setGovFee] = React.useState<number>(0);
  const [attyFee, setAttyFee] = React.useState<number>(0);
  const [thirdFee, setThirdFee] = React.useState<number>(0);

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
      code: "",
      category: "IMMIGRATION",
      description: "",
      baseFee: 5000,
      currency: "USD",
      defaultDeposit: 1500,
      defaultInstallments: 4,
      estimatedDuration: "6-9 months",
      isActive: true,
    },
  });

  const watchedBaseFee = watch("baseFee") || 0;
  const watchedName = watch("name") || "Untitled Service Offering";
  const watchedCode = watch("code") || "SKU-CODE";
  const watchedCategory = watch("category") || "IMMIGRATION";
  const watchedDuration = watch("estimatedDuration") || "6-9 months";
  const watchedDeposit = watch("defaultDeposit") || 0;
  const watchedInstallments = watch("defaultInstallments") || 1;

  const totalPassThrough = govFee + attyFee + thirdFee;
  const totalClientCost = Number(watchedBaseFee) + totalPassThrough;

  // Submit Handler (100% Live Backend API)
  const onSubmit = async (data: CreateServiceFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createServiceMutation({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        category: data.category,
        description: data.description?.trim() || undefined,
        baseFee: Number(data.baseFee) || 0,
        estimatedGovFee: govFee,
        estimatedAttorneyFee: attyFee,
        estimatedThirdPartyFee: thirdFee,
        currency: data.currency || "USD",
        defaultDeposit: data.defaultDeposit ? Number(data.defaultDeposit) : undefined,
        defaultInstallments: data.defaultInstallments
          ? Number(data.defaultInstallments)
          : undefined,
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
    <div className="space-y-6 w-full pb-16">
      {/* 1. TOP BREADCRUMB & PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] shadow-2xs">
            <Briefcase className="h-5 w-5 text-[#0a0a0a]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
              Add Service Offering
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Super Admin</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.SERVICES}
                className="hover:text-[#0a0a0a] transition-colors"
              >
                Service Catalog
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a]">Configure Offering</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(ROUTES.SERVICES)}
            className="h-10 px-4 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#0a0a0a] cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isApiLoading}
            className="h-10 px-5 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
          >
            {isSubmitting || isApiLoading ? (
              <span>Publishing...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                <span>Publish Service Offering</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-xs text-[#065F46] font-bold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0" />
          <span>
            Service Offering successfully registered into PostgreSQL! Redirecting to catalog...
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
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a]">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  1. Service Identity &amp; Program Categorization
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Official service title, SKU code, and category classification
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Program Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. EB-2 NIW - National Interest Waiver"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                />
                {errors.name && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Program Code / SKU <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    {...register("code")}
                    placeholder="e.g. EB2-NIW"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] font-mono text-xs font-bold uppercase text-[#0a0a0a]"
                  />
                  {errors.code && (
                    <p className="text-[11px] font-semibold text-rose-500">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                    Service Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    {...register("category")}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] cursor-pointer"
                  >
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Description &amp; Scope
                </label>
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Describe the legal advisory scope, preparation milestones, petition support, and deliverables..."
                  className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          {/* 🌟 Section 2: Strict Regulatory Fee Separation Architecture 🌟 */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    2. Strict Regulatory Fee Separation Architecture
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Isolate AdSkill advisory revenue from third-party pass-through disbursements.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-lg">
                Regulatory Rule
              </span>
            </div>

            {/* 4-BOX CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Box 1: AdSkill Advisory Fee */}
              <div className="space-y-1.5 rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF]">
                <label className="text-xs font-extrabold text-[#0a0a0a] flex items-center justify-between">
                  <span>AdSkill Advisory Fee</span>
                  <span className="font-mono text-[10px] font-bold text-[#059669] uppercase">
                    Revenue
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#64748B]">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    {...register("baseFee", { valueAsNumber: true })}
                    placeholder="5000"
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">
                  Firm professional fee (treated as taxable earnings).
                </p>
              </div>

              {/* Box 2: Gov / Filing Fee */}
              <div className="space-y-1.5 rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF]">
                <label className="text-xs font-extrabold text-[#0a0a0a] flex items-center justify-between">
                  <span>Gov / Filing Fee</span>
                  <span className="font-mono text-[10px] font-bold text-[#2563EB] uppercase">
                    Pass-Through
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#64748B]">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={govFee}
                    onChange={(e) => setGovFee(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">
                  USCIS or government filing disbursement.
                </p>
              </div>

              {/* Box 3: Attorney Representation */}
              <div className="space-y-1.5 rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF]">
                <label className="text-xs font-extrabold text-[#0a0a0a] flex items-center justify-between">
                  <span>Attorney Representation</span>
                  <span className="font-mono text-[10px] font-bold text-[#2563EB] uppercase">
                    Pass-Through
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#64748B]">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={attyFee}
                    onChange={(e) => setAttyFee(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">
                  Outside legal counsel fee disbursement.
                </p>
              </div>

              {/* Box 4: Evaluations / 3rd Party */}
              <div className="space-y-1.5 rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF]">
                <label className="text-xs font-extrabold text-[#0a0a0a] flex items-center justify-between">
                  <span>Evaluations / 3rd Party</span>
                  <span className="font-mono text-[10px] font-bold text-[#2563EB] uppercase">
                    Pass-Through
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-[#64748B]">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={thirdFee}
                    onChange={(e) => setThirdFee(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                  />
                </div>
                <p className="text-[10px] text-[#64748B]">
                  Translations, credential evals, business plans.
                </p>
              </div>
            </div>

            {/* Total Client Out-of-Pocket Estimate Banner */}
            <div className="rounded-2xl bg-[#0a0a0a] p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#F3A712]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Total Client Out-of-Pocket Estimate
                  </div>
                  <div className="text-[11px] text-slate-400">
                    AdSkill Base ($${(Number(watchedBaseFee) || 0).toLocaleString()}) + Total Pass-Through ($${totalPassThrough.toLocaleString()})
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-[#F3A712]">
                  $${totalClientCost.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-slate-400">USD</span>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="pt-2 flex items-center justify-between border-t border-[#F0ECE6]">
              <span className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider">
                Program Billing Currency:
              </span>
              <select
                {...register("currency")}
                className="h-9 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none cursor-pointer"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="CAD">CAD (C$) - Canadian Dollar</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
          </div>

          {/* Section 3: Retainer & Milestone Schedule Terms */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFFBEB] text-[#D97706]">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  3. Retainer &amp; Milestone Terms
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Suggested financial milestone defaults for client payment plans
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Upfront Retainer Deposit ($)
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("defaultDeposit", { valueAsNumber: true })}
                  placeholder="1500"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] font-mono text-xs font-bold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Milestone Installments Count
                </label>
                <Input
                  type="number"
                  {...register("defaultInstallments", { valueAsNumber: true })}
                  placeholder="4"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] font-mono text-xs font-bold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Estimated Duration
                </label>
                <Input
                  {...register("estimatedDuration")}
                  placeholder="e.g. 6-9 months"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0ECE6] flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#0a0a0a] block">
                  Active Offering Status
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Immediately make this service available for client case enrollment
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SUMMARY PREVIEW CARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-6 sticky top-6">
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#F0ECE6]">
              <Sparkles className="h-4 w-4 text-[#F3A712]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                Offering Summary Preview
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-mono text-xs font-bold text-[#0a0a0a] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#EAE6DF]">
                  {watchedCode}
                </span>
                <h4 className="text-sm font-black text-[#0a0a0a] mt-1.5">
                  {watchedName}
                </h4>
                <span className="inline-block mt-1 font-mono text-[10px] font-bold text-[#4F46E5] uppercase bg-[#EEF2FF] px-2 py-0.5 rounded-md">
                  {watchedCategory.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#F0ECE6] text-xs">
                <div className="flex justify-between text-[#64748B]">
                  <span>AdSkill Advisory Base:</span>
                  <strong className="text-[#059669] font-mono">
                    $${(Number(watchedBaseFee) || 0).toLocaleString()}
                  </strong>
                </div>

                <div className="flex justify-between text-[#64748B]">
                  <span>USCIS / Filing Fee:</span>
                  <span className="font-mono text-[#2563EB] font-bold">
                    $${govFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#64748B]">
                  <span>Attorney Fee:</span>
                  <span className="font-mono text-[#2563EB] font-bold">
                    $${attyFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#64748B]">
                  <span>3rd Party Evaluations:</span>
                  <span className="font-mono text-[#2563EB] font-bold">
                    $${thirdFee.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F0ECE6] flex justify-between text-xs font-extrabold text-[#0a0a0a]">
                  <span>Total Client Cost:</span>
                  <span className="font-mono text-base font-black text-[#0a0a0a]">
                    $${totalClientCost.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] p-3 border border-[#EAE6DF] space-y-1.5 text-[11px] text-[#64748B]">
                <div className="flex items-center gap-1.5 font-bold text-[#0a0a0a]">
                  <Clock className="h-3.5 w-3.5 text-[#F3A712]" />
                  <span>Timeline: {watchedDuration}</span>
                </div>
                <div>
                  Retainer: <strong>$${Number(watchedDeposit).toLocaleString()} upfront</strong>
                </div>
                <div>
                  Installments: <strong>{watchedInstallments} milestones</strong>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || isApiLoading}
                className="w-full h-11 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
              >
                {isSubmitting || isApiLoading ? (
                  <span>Publishing...</span>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
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
