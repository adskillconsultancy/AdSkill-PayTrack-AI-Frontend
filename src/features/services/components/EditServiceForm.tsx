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
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileSpreadsheet,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Loader } from "@/components/common/Loader";
import { SkeletonForm } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import {
  useGetServiceByIdQuery,
  useUpdateServiceMutation,
} from "@/services/api/services/servicesApi";
import {
  createServiceSchema,
  SERVICE_CATEGORIES,
  type CreateServiceFormValues,
} from "@/validations/service.schema";
import type { BackendService } from "../types";

interface EditServiceFormProps {
  serviceId: string;
}

export function EditServiceForm({ serviceId }: EditServiceFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Live Query
  const {
    data: serviceResponse,
    isLoading: isServiceLoading,
    isFetching,
    refetch,
  } = useGetServiceByIdQuery(serviceId);

  // Live Mutation
  const [updateServiceMutation, { isLoading: isApiUpdating }] =
    useUpdateServiceMutation();

  const service: BackendService | null = React.useMemo(() => {
    if (!serviceResponse) return null;
    if ("data" in serviceResponse && serviceResponse.data) {
      return serviceResponse.data as BackendService;
    }
    if ("id" in serviceResponse) {
      return serviceResponse as unknown as BackendService;
    }
    return null;
  }, [serviceResponse]);

  // Sync browser URL to human-readable SKU code if loaded via raw UUID
  React.useEffect(() => {
    if (service?.code && serviceId !== service.code && typeof window !== "undefined") {
      window.history.replaceState(null, "", `/services/${service.code}/edit`);
    }
  }, [service?.code, serviceId]);

  const [copiedSku, setCopiedSku] = React.useState(false);
  const handleCopySku = (sku: string) => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  // Fee Separation Input States (Strings prevent leading zero issues)
  const [govFee, setGovFee] = React.useState<string>("");
  const [attyFee, setAttyFee] = React.useState<string>("");
  const [thirdFee, setThirdFee] = React.useState<string>("");

  const handleFeeInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      if (val.length > 1 && val.startsWith("0") && !val.startsWith("0.")) {
        val = val.replace(/^0+/, "") || "0";
      }
      setter(val);
    };

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
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

  // Pre-populate form when service data loads
  React.useEffect(() => {
    if (service) {
      reset({
        name: service.name || "",
        category: service.category || "IMMIGRATION",
        description: service.description || "",
        baseFee: Number(service.baseFee) || 0,
        currency: service.currency || "USD",
        defaultDeposit:
          service.defaultDeposit !== undefined && service.defaultDeposit !== null
            ? Number(service.defaultDeposit)
            : undefined,
        defaultInstallments:
          service.defaultInstallments !== undefined && service.defaultInstallments !== null
            ? Number(service.defaultInstallments)
            : undefined,
        estimatedDuration: service.estimatedDuration || "",
        isActive: service.isActive ?? true,
      });

      setGovFee(
        service.estimatedGovFee && Number(service.estimatedGovFee) > 0
          ? String(Number(service.estimatedGovFee))
          : ""
      );
      setAttyFee(
        service.estimatedAttorneyFee && Number(service.estimatedAttorneyFee) > 0
          ? String(Number(service.estimatedAttorneyFee))
          : ""
      );
      setThirdFee(
        service.estimatedThirdPartyFee && Number(service.estimatedThirdPartyFee) > 0
          ? String(Number(service.estimatedThirdPartyFee))
          : ""
      );
    }
  }, [service, reset]);

  // Watched values for live calculation & preview
  const watchedBaseFee = watch("baseFee");
  const numBaseFee = Number(watchedBaseFee) || 0;
  const watchedName = watch("name") || service?.name || "Untitled Service Offering";
  const watchedCategory = watch("category") || service?.category || "IMMIGRATION";
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

  const numGovFee = Number(govFee) || 0;
  const numAttyFee = Number(attyFee) || 0;
  const numThirdFee = Number(thirdFee) || 0;

  const totalPassThrough = numGovFee + numAttyFee + numThirdFee;
  const totalClientCost = numBaseFee + totalPassThrough;

  // Submit Handler
  const onSubmit = async (data: CreateServiceFormValues) => {
    if (!service) return;
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
      await updateServiceMutation({
        id: service.id,
        data: {
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
        },
      }).unwrap();

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/services/${service.code || service.id}`);
      }, 700);
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message ||
            "Failed to save changes. Please review fields."
          : "Failed to save changes. Please review fields.";
      setErrorMessage(msg);
    }
  };

  const isPageLoading = isServiceLoading || (isFetching && !service);

  if (isPageLoading) {
    return <SkeletonForm fieldsCount={8} />;
  }

  if (!service) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-[#64748B]" />}
          title={`Service SKU "${serviceId}" Not Found`}
          description="The requested service package could not be located in the catalog directory."
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

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. TOP BREADCRUMB & PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-[#EAE6DF] bg-white text-[#0a0a0a] hover:bg-[#FAF8F5] shadow-2xs"
          >
            <Link href={`/services/${service.code || service.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to service</span>
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
              <Link
                href={`/services/${service.code || service.id}`}
                className="font-mono text-[#0a0a0a] hover:underline"
              >
                {service.code}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#F3A712] font-black">Edit</span>
            </div>
            <div className="flex items-center gap-2.5 mt-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
                Edit Service Package
              </h1>
              <span className="font-mono text-xs font-bold text-[#0a0a0a] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">
                {service.code}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => handleCopySku(service.code)}
            className="h-10 gap-2 px-3.5 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] hover:bg-[#FAF8F5] cursor-pointer"
          >
            {copiedSku ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#64748B]" />
            )}
            <span>SKU</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/services/${service.code || service.id}`)}
            className="h-10 px-4 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#0a0a0a] cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isApiUpdating}
            className="h-10 px-5 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
          >
            {isSubmitting || isApiUpdating ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="h-4 w-4 text-[#F3A712]" />
                <span>Save Changes</span>
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
            Service Offering successfully updated! Redirecting to dossier...
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

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    SKU Identifier (Code)
                  </label>
                  <div className="h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center font-mono font-bold text-xs text-[#0a0a0a]">
                    {service.code}
                  </div>
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

          {/* Section 2: Strict Regulatory Fee Separation Architecture */}
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
                    placeholder="0"
                    className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-[#CBD5E1] font-mono text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
                  />
                </div>
                {errors.baseFee && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.baseFee.message}
                  </p>
                )}
                <p className="text-[10px] text-[#64748B]">
                  Firm professional fee (taxable earnings).
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
                    onChange={handleFeeInputChange(setGovFee)}
                    onFocus={(e) => e.target.select()}
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
                    onChange={handleFeeInputChange(setAttyFee)}
                    onFocus={(e) => e.target.select()}
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
                    onChange={handleFeeInputChange(setThirdFee)}
                    onFocus={(e) => e.target.select()}
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
                    AdSkill Base (${numBaseFee.toLocaleString()}) + Total Pass-Through (${totalPassThrough.toLocaleString()})
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-[#F3A712]">
                  ${totalClientCost.toLocaleString()}
                </span>
                <span className="font-mono text-xs text-slate-400">{watchedCurrency}</span>
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

          {/* Section 3: Client Payment Plan Defaults */}
          <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFFBEB] text-[#D97706]">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  3. Client Payment Plan Defaults
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Default deposit, milestone cadence, and delivery timeline for client engagements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Initial Engagement Payment ($)
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
                  placeholder="0"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] font-mono text-xs font-bold text-[#0a0a0a]"
                />
                <p className="text-[10px] text-[#64748B]">
                  Upfront retainer. If 0 or empty, engagement defaults to Full Payment.
                </p>
                {errors.defaultDeposit && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.defaultDeposit.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Number of Milestone Payments
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
                  placeholder="4"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] font-mono text-xs font-bold text-[#0a0a0a]"
                />
                <p className="text-[10px] text-[#64748B]">
                  Milestone count. If 0 or 1, engagement is treated as Full Payment.
                </p>
                {errors.defaultInstallments && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.defaultInstallments.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Estimated Delivery Timeline <span className="text-rose-500">*</span>
                </label>
                <Input
                  {...register("estimatedDuration")}
                  placeholder="e.g. 6-9 months"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#0a0a0a]"
                />
                {errors.estimatedDuration && (
                  <p className="text-[11px] font-semibold text-rose-500">
                    {errors.estimatedDuration.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0ECE6] flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#0a0a0a] block">
                  Active Offering Status
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Make this service offering available for client case enrollment
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
                  {service.code}
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
                    ${numBaseFee.toLocaleString()}
                  </strong>
                </div>

                <div className="flex justify-between text-[#64748B]">
                  <span>USCIS / Filing Fee:</span>
                  <span className="font-mono text-[#2563EB] font-bold">
                    ${numGovFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#64748B]">
                  <span>Attorney Fee:</span>
                  <span className="font-mono text-[#2563EB] font-bold">
                    ${numAttyFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#64748B]">
                  <span>3rd Party Evaluations:</span>
                  <span className="font-mono text-[#2563EB] font-bold">
                    ${numThirdFee.toLocaleString()}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#F0ECE6] flex justify-between text-xs font-extrabold text-[#0a0a0a]">
                  <span>Total Client Cost:</span>
                  <span className="font-mono text-base font-black text-[#0a0a0a]">
                    ${totalClientCost.toLocaleString()} {watchedCurrency}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FAF8F5] p-3 border border-[#EAE6DF] space-y-1.5 text-[11px] text-[#64748B]">
                <div className="flex items-center gap-1.5 font-bold text-[#0a0a0a]">
                  <Clock className="h-3.5 w-3.5 text-[#F3A712]" />
                  <span>
                    Timeline: {watchedDuration ? watchedDuration : "Required — Please specify"}
                  </span>
                </div>
                {numDeposit > 0 && numInstallments !== undefined && numInstallments > 1 ? (
                  <>
                    <div>
                      Retainer:{" "}
                      <strong>
                        ${numDeposit.toLocaleString()} upfront
                      </strong>
                    </div>
                    <div>
                      Installments:{" "}
                      <strong>{numInstallments} milestones</strong>
                    </div>
                  </>
                ) : (
                  <div>
                    Payment Structure:{" "}
                    <strong className="text-[#059669]">
                      Full Payment (100% upfront upon execution)
                    </strong>
                  </div>
                )}
              </div>

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || isApiUpdating}
                className="w-full h-11 rounded-xl bg-[#0a0a0a] text-white hover:bg-[#171717] text-xs font-bold shadow-xs gap-1.5 cursor-pointer"
              >
                {isSubmitting || isApiUpdating ? (
                  <span>Saving Changes...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4 text-[#F3A712]" />
                    <span>Save Offering Changes</span>
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
