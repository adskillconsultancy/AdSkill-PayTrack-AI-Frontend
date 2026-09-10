"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createServiceSchema,
  type CreateServiceFormValues,
} from "@/validations/service.schema";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ServiceItem, PassThroughFeeCategory, ServiceStatus } from "../types";
import { addMockService } from "../mockData";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Info,
  Sparkles,
  DollarSign,
  Clock,
  Layers,
  Building2,
  FileText,
} from "lucide-react";

const COUNTRY_OPTIONS = [
  { code: "US", country: "United States", flag: "🇺🇸", defaultCurrency: "USD" },
  { code: "CA", country: "Canada", flag: "🇨🇦", defaultCurrency: "CAD" },
  { code: "GB", country: "United Kingdom", flag: "🇬🇧", defaultCurrency: "GBP" },
  { code: "AU", country: "Australia", flag: "🇦🇺", defaultCurrency: "AUD" },
  { code: "DE", country: "Germany", flag: "🇩🇪", defaultCurrency: "EUR" },
  { code: "GLOBAL", country: "Global / Multi-Jurisdiction", flag: "🌐", defaultCurrency: "USD" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
];

const PASS_THROUGH_CATEGORIES: PassThroughFeeCategory[] = [
  "USCIS & Government",
  "Attorney Representation",
  "Business Plan Drafting",
  "Credential Evaluation",
  "Certified Translation",
  "Corporate & State Filing",
  "Other Expense",
];

function generateRandomServiceCode(): string {
  const rand = Math.floor(100 + Math.random() * 900);
  return `SRV-2026-${rand}`;
}

export function CreateServiceForm() {
  const router = useRouter();

  // Generated Service Code Reference (SSR safe)
  const [serviceCode, setServiceCode] = React.useState<string>("");

  React.useEffect(() => {
    setServiceCode(generateRandomServiceCode());
  }, []);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdServiceId, setCreatedServiceId] = React.useState<string | null>(null);

  // Initialize React Hook Form with Zod schema validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      code: "SRV-NEW-01",
      title: "",
      subCategory: "",
      category: "Employment Immigration",
      description: "",
      destinationCountry: "United States",
      destinationCode: "US",
      destinationFlag: "🇺🇸",
      professionalFee: 5000,
      currency: "USD",
      schedulePreset: "deposit_2_milestones",
      passThroughFees: [
        {
          name: "Government Statutory Filing Fee",
          category: "USCIS & Government",
          amount: 715,
          isMandatory: true,
          payableTo: "Department of Homeland Security / Immigration Agency",
          description: "Mandatory statutory agency fee.",
        },
      ],
      defaultMilestones: [
        {
          name: "Initial Retainer & Setup",
          percentage: 50,
          amount: 2500,
          triggerEvent: "Upon contract execution",
        },
        {
          name: "Final Case Filing",
          percentage: 50,
          amount: 2500,
          triggerEvent: "Dispatched to government authorities",
        },
      ],
      status: "Active",
      estimatedLeadTime: "4 - 8 Months",
      internalNotes: "",
    },
  });

  // Dynamic field arrays for pass-through fees and milestones
  const {
    fields: passThroughFields,
    append: appendPassThrough,
    remove: removePassThrough,
  } = useFieldArray({
    control,
    name: "passThroughFees",
  });

  const {
    fields: milestoneFields,
    replace: replaceMilestones,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    control,
    name: "defaultMilestones",
  });

  // Watched form values for live financial math
  const watchedProfessionalFee = watch("professionalFee") || 0;
  const watchedPassThrough = watch("passThroughFees") || [];
  const watchedMilestones = watch("defaultMilestones") || [];
  const watchedCurrency = watch("currency");
  const watchedCountry = watch("destinationCountry");
  const watchedSchedulePreset = watch("schedulePreset");

  // Currency symbol lookup
  const currencySymbol =
    CURRENCIES.find((c) => c.code === watchedCurrency)?.symbol || "$";

  // Calculate live totals
  const totalPassThrough = watchedPassThrough.reduce(
    (acc, f) => acc + (Number(f.amount) || 0),
    0
  );
  const totalClientCost = watchedProfessionalFee + totalPassThrough;

  // Milestone percentage validation
  const totalMilestonesPercentage = watchedMilestones.reduce(
    (acc, m) => acc + (Number(m.percentage) || 0),
    0
  );
  const isMilestonesValid = Math.abs(totalMilestonesPercentage - 100) < 0.1;

  // Handle country select
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COUNTRY_OPTIONS.find((c) => c.country === e.target.value);
    if (selected) {
      setValue("destinationCountry", selected.country);
      setValue("destinationCode", selected.code);
      setValue("destinationFlag", selected.flag);
      setValue("currency", selected.defaultCurrency);
    }
  };

  // Handle schedule preset change
  const handleSchedulePresetChange = (preset: CreateServiceFormValues["schedulePreset"]) => {
    setValue("schedulePreset", preset);
    const fee = watchedProfessionalFee;

    if (preset === "single") {
      replaceMilestones([
        {
          name: "Full Retainer Execution",
          percentage: 100,
          amount: fee,
          triggerEvent: "Upon contract execution",
        },
      ]);
    } else if (preset === "deposit_2_milestones") {
      const half = Math.round(fee * 0.5);
      replaceMilestones([
        {
          name: "Initial Retainer Phase",
          percentage: 50,
          amount: half,
          triggerEvent: "Upon contract execution & attorney onboarding",
        },
        {
          name: "Final Case Filing Phase",
          percentage: 50,
          amount: fee - half,
          triggerEvent: "Dispatched to government authorities",
        },
      ]);
    } else if (preset === "deposit_3_monthly") {
      const p1 = Math.round(fee * 0.34);
      const p2 = Math.round(fee * 0.33);
      replaceMilestones([
        {
          name: "Month 1 — Intake & Case Setup",
          percentage: 34,
          amount: p1,
          triggerEvent: "Month 1 Retainer",
        },
        {
          name: "Month 2 — Evidence Assembled",
          percentage: 33,
          amount: p2,
          triggerEvent: "Month 2 Retainer",
        },
        {
          name: "Month 3 — Final Submission",
          percentage: 33,
          amount: fee - p1 - p2,
          triggerEvent: "Month 3 Retainer",
        },
      ]);
    }
  };

  const handleAddPassThroughItem = () => {
    appendPassThrough({
      name: "New Pass-Through Item",
      category: "Other Expense",
      amount: 500,
      isMandatory: true,
      payableTo: "External Provider / Government",
      description: "",
    });
  };

  // Submit handler
  const onSubmit = (data: CreateServiceFormValues) => {
    setIsSubmitting(true);

    const newId = Date.now().toString();

    const newService: ServiceItem = {
      id: newId,
      code: (serviceCode || data.code).trim().toUpperCase(),
      title: data.title.trim(),
      subCategory: data.subCategory.trim(),
      category: data.category,
      description: data.description.trim(),
      destination: {
        code: data.destinationCode,
        country: data.destinationCountry,
        flag: data.destinationFlag,
      },
      professionalFee: data.professionalFee,
      passThroughFees: data.passThroughFees.map((pt, i) => ({
        id: `pt-${newId}-${i + 1}`,
        name: pt.name,
        category: pt.category,
        amount: Number(pt.amount) || 0,
        isMandatory: pt.isMandatory,
        description: pt.description,
        payableTo: pt.payableTo,
      })),
      totalClientCost: data.professionalFee + totalPassThrough,
      currency: data.currency,
      schedulePreset: data.schedulePreset,
      defaultMilestones: data.defaultMilestones.map((ms, i) => ({
        id: `ms-${newId}-${i + 1}`,
        name: ms.name,
        percentage: Number(ms.percentage) || 0,
        amount: Math.round((data.professionalFee * (Number(ms.percentage) || 0)) / 100),
        triggerEvent: ms.triggerEvent,
      })),
      activeCasesCount: 0,
      status: data.status as ServiceStatus,
      eligibilityChecklist: data.eligibilityChecklist || [
        "Verified applicant credentials meeting program criteria",
        "Completed intake questionnaire and retainer documentation",
      ],
      estimatedLeadTime: data.estimatedLeadTime,
      internalNotes: data.internalNotes?.trim() || undefined,
      createdAt: "Just now",
      updatedAt: "Just now",
    };

    addMockService(newService);
    setCreatedServiceId(newId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.SERVICES);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748B]">
            <Link
              href={ROUTES.DASHBOARD}
              className="hover:text-[#092244] transition-colors"
            >
              Management
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
            <Link
              href={ROUTES.SERVICES}
              className="hover:text-[#092244] transition-colors"
            >
              Service Catalog
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8]" />
            <span className="text-[#092244] font-bold">
              Configure Service Offering
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#092244]">
              Add Service Offering
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              FEE SEPARATION ARCHITECTURE
            </span>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Service Code ID Card */}
          <div className="flex items-center gap-2.5 bg-white border border-[#EAE6DF] px-4 py-2 rounded-2xl shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] block leading-none">
                Program Code
              </span>
              <span
                suppressHydrationWarning
                className="font-mono font-black text-sm text-[#092244] mt-0.5 block"
              >
                {serviceCode || "SRV-2026-••••"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setServiceCode(generateRandomServiceCode())}
              title="Generate new Code"
              className="p-1.5 rounded-xl hover:bg-[#FAF8F5] text-[#64748B] hover:text-[#092244] transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quick Back to Directory Button */}
          <Button
            asChild
            variant="outline"
            className="h-11 px-4 rounded-2xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] shadow-2xs text-xs font-bold gap-2 cursor-pointer"
          >
            <Link href={ROUTES.SERVICES}>
              <FileText className="h-4 w-4 text-[#64748B]" />
              <span className="hidden sm:inline">View Catalog</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="p-5 rounded-3xl bg-[#ECFDF5] border border-[#059669]/30 text-[#059669] flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-black text-[#065F46]">
                Service Offering Successfully Published!
              </div>
              <p className="text-xs text-[#047857] mt-0.5">
                Service {serviceCode} saved to catalog with strict fee separation architecture. Redirecting to catalog...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE6]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] px-3.5 py-1.5 rounded-xl shadow-2xs">
              CATALOG CONFIGURATION
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              Deterministic Fee Separation &amp; Milestone Schedule Architecture
            </span>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1: SERVICE IDENTITY */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] shadow-2xs">
                <Briefcase className="h-4.5 w-4.5 text-[#092244]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                  1. Service Identity &amp; Program Categorization
                </h3>
                <p className="text-xs text-[#64748B]">
                  Official service title, destination jurisdiction, and program category
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Service Title *</span>
                  {errors.title && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.title.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("title")}
                  placeholder="e.g. EB-2 NIW (National Interest Waiver)"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Sub-Category Specialization *
                </label>
                <Input
                  {...register("subCategory")}
                  placeholder="e.g. Exceptional Ability"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Destination Country *
                </label>
                <select
                  value={watchedCountry}
                  onChange={handleCountryChange}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.country}>
                      {c.flag} {c.country} ({c.defaultCurrency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Service Category *
                </label>
                <select
                  {...register("category")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  <option value="Employment Immigration">Employment Immigration</option>
                  <option value="Priority & Talent">Priority & Talent</option>
                  <option value="Permanent Residency">Permanent Residency</option>
                  <option value="Investor & Corporate">Investor & Corporate</option>
                  <option value="Corporate Advisory">Corporate Advisory</option>
                  <option value="Family & Dependent">Family & Dependent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Estimated Case Lead Time
                </label>
                <Input
                  {...register("estimatedLeadTime")}
                  placeholder="e.g. 4 - 8 Months"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Initial Catalog Status
                </label>
                <select
                  {...register("status")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  <option value="Active">Active (Intake Ready)</option>
                  <option value="Draft">Draft (Internal Review)</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Program Scope &amp; Legal Description *
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Describe the legal advisory scope, preparation milestones, petition support, and deliverables..."
                className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          {/* SECTION 2: STRICT FEE SEPARATION ARCHITECTURE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                    2. Strict Fee Separation &amp; Pricing Architecture
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Separate AdSkill advisory revenue from third-party non-revenue pass-through costs
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-lg">
                Section 5 Regulatory Rule
              </span>
            </div>

            {/* Fee Separation Rule Callout Alert */}
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#F3A712]/30 flex items-start gap-3 text-xs">
              <Info className="h-4 w-4 text-[#B47B00] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-[#092244] block">
                  Mandatory Accounting Policy (Section 5 Spec):
                </span>
                <p className="text-[#64748B] leading-relaxed">
                  AdSkill earned revenue must only encompass <strong>Professional Advisory Fees</strong>. Any government filing fees, attorney representation, business plans, or certified translations are pass-through expenses collected on behalf of external agencies and do <strong>not</strong> count as AdSkill company revenue.
                </p>
              </div>
            </div>

            {/* Base Fee and Currency Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#065F46] flex items-center justify-between">
                  <span>AdSkill Professional Advisory Fee *</span>
                  <span className="text-[10px] font-bold text-[#059669]">
                    Recognized Firm Revenue
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#065F46]">
                    {currencySymbol}
                  </span>
                  <Input
                    type="number"
                    {...register("professionalFee", { valueAsNumber: true })}
                    placeholder="6500"
                    className="h-11 pl-8 rounded-xl bg-[#ECFDF5] border-[#A7F3D0] text-sm font-mono font-bold text-[#065F46]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Billing Currency *
                </label>
                <select
                  {...register("currency")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Cost Calculation Card */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                  Total Contracted Price
                </span>
                <span className="text-base font-black text-[#092244] font-mono block">
                  {currencySymbol}
                  {totalClientCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-[#64748B] block">
                  Advisory + Pass-Through
                </span>
              </div>
            </div>

            {/* Pass-Through Line Item Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-black uppercase tracking-wider text-[#092244] block">
                    Third-Party Pass-Through Expenses ({passThroughFields.length})
                  </span>
                  <span className="text-xs text-[#64748B]">
                    Itemize statutory and external fees collected in escrow
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPassThroughItem}
                  className="rounded-xl border-[#EAE6DF] text-xs font-bold gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#092244]" />
                  <span>Add Line Item</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {passThroughFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                  >
                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        Fee Name
                      </label>
                      <Input
                        {...register(`passThroughFees.${idx}.name`)}
                        placeholder="e.g. USCIS Form I-140 Fee"
                        className="h-9 text-xs bg-white"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        Category
                      </label>
                      <select
                        {...register(`passThroughFees.${idx}.category`)}
                        className="w-full h-9 px-2 rounded-xl bg-white border border-[#EAE6DF] text-xs font-bold text-[#092244]"
                      >
                        {PASS_THROUGH_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        Payable To
                      </label>
                      <Input
                        {...register(`passThroughFees.${idx}.payableTo`)}
                        placeholder="e.g. US Department of Homeland Security"
                        className="h-9 text-xs bg-white"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2 pt-4 sm:pt-0">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                          Amount
                        </label>
                        <Input
                          type="number"
                          {...register(`passThroughFees.${idx}.amount`, {
                            valueAsNumber: true,
                          })}
                          placeholder="715"
                          className="h-9 text-xs font-mono font-bold bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePassThrough(idx)}
                        className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors mt-4 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: DEFAULT MILESTONE SCHEDULE ARCHITECTURE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] shadow-2xs">
                  <Layers className="h-4.5 w-4.5 text-[#092244]" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                    3. Default Milestone Schedule Architecture
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Configure default installment phases for client onboarding
                  </p>
                </div>
              </div>

              {/* Math Validation Status Indicator */}
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-extrabold border self-start sm:self-auto",
                  isMilestonesValid
                    ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]"
                    : "bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]"
                )}
              >
                {isMilestonesValid ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Allocated 100% of Advisory Fee</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>
                      Allocated {totalMilestonesPercentage}% (Must equal 100%)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Schedule Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "deposit_2_milestones",
                  title: "Deposit + 2 Milestones",
                  desc: "50% retainer + 50% final dispatch",
                },
                {
                  id: "deposit_3_monthly",
                  title: "Deposit + 3 Installments",
                  desc: "34% kickoff + 33% monthly retainers",
                },
                {
                  id: "single",
                  title: "Single Lump Sum",
                  desc: "100% full retainer upon contract",
                },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    handleSchedulePresetChange(
                      p.id as CreateServiceFormValues["schedulePreset"]
                    )
                  }
                  className={cn(
                    "p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                    watchedSchedulePreset === p.id
                      ? "border-[#092244] bg-[#FAF8F5] ring-1 ring-[#092244]"
                      : "border-[#EAE6DF] bg-white hover:bg-[#FAF8F5]"
                  )}
                >
                  <span className="text-xs font-bold text-[#092244] block">
                    {p.title}
                  </span>
                  <span className="text-[11px] text-[#64748B] mt-0.5 block">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>

            {/* Milestone Phase Fields */}
            <div className="space-y-2.5 pt-2">
              {milestoneFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Phase {idx + 1} Title
                    </label>
                    <Input
                      {...register(`defaultMilestones.${idx}.name`)}
                      placeholder="e.g. Milestone 1 — Draft Approval"
                      className="h-9 text-xs bg-white font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                      Trigger Event Requirement
                    </label>
                    <Input
                      {...register(`defaultMilestones.${idx}.triggerEvent`)}
                      placeholder="e.g. Dossier assembled & approved"
                      className="h-9 text-xs bg-white"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        Allocation %
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          {...register(`defaultMilestones.${idx}.percentage`, {
                            valueAsNumber: true,
                          })}
                          placeholder="50"
                          className="h-9 text-xs font-mono font-bold bg-white pr-7"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                          %
                        </span>
                      </div>
                    </div>
                    {milestoneFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="p-2 rounded-xl text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors mt-4 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: OPERATIONAL GUIDANCE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] shadow-2xs">
                <Clock className="h-4.5 w-4.5 text-[#092244]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                  4. Operational Notes &amp; Internal Guidelines
                </h3>
                <p className="text-xs text-[#64748B]">
                  Confidential administrative instructions and compliance guidelines
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Internal Staff Processing Notes
              </label>
              <textarea
                {...register("internalNotes")}
                rows={3}
                placeholder="e.g. Attorney of record review required prior to Milestone 2 disbursement. Third-party fee collected in advance."
                className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          {/* Bottom Actions Toolbar */}
          <div className="pt-6 border-t border-[#F0ECE6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-[#64748B]">
              <ShieldCheck className="h-4.5 w-4.5 text-[#059669]" />
              <span>
                AdSkill Advisory:{" "}
                <strong className="text-[#065F46]">
                  {currencySymbol}
                  {watchedProfessionalFee.toLocaleString()}
                </strong>{" "}
                &bull; Pass-Through:{" "}
                <strong className="text-[#2563EB]">
                  {currencySymbol}
                  {totalPassThrough.toLocaleString()}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 rounded-2xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Link href={ROUTES.SERVICES}>Cancel &amp; Return</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !isMilestonesValid}
                className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#092244] text-white hover:bg-[#071933] shadow-[0_4px_16px_rgba(9,34,68,0.2)] text-xs font-bold cursor-pointer gap-2 transition-all disabled:opacity-50"
              >
                <Briefcase className="h-4 w-4 text-[#F3A712]" />
                <span>
                  {isSubmitting ? "Publishing Service..." : "Publish Service Offering"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
