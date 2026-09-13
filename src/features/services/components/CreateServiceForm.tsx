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
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Sparkles,
  Layers,
  Clock,
  Building2,
  Globe,
  ExternalLink,
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

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Portal & Intake options (matching /users/create options style)
  const [enablePortalIntake, setEnablePortalIntake] = React.useState(true);
  const [requireAttorneyReview, setRequireAttorneyReview] = React.useState(true);

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
      code: "SRV-2026-709",
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

  // Watched form values for live financial math and live preview
  const watchedTitle = watch("title") || "";
  const watchedCode = watch("code") || "SRV-2026-709";
  const watchedSubCategory = watch("subCategory") || "";
  const watchedCategory = watch("category") || "Employment Immigration";
  const watchedStatus = watch("status") || "Active";
  const watchedLeadTime = watch("estimatedLeadTime") || "4 - 8 Months";
  const watchedProfessionalFee = watch("professionalFee") || 0;
  const watchedPassThrough = watch("passThroughFees") || [];
  const watchedMilestones = watch("defaultMilestones") || [];
  const watchedCurrency = watch("currency");
  const watchedCountry = watch("destinationCountry");
  const watchedFlag = watch("destinationFlag") || "🇺🇸";
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

  const handleAddMilestone = () => {
    appendMilestone({
      name: `Phase ${milestoneFields.length + 1} — Completion`,
      percentage: 10,
      amount: Math.round(watchedProfessionalFee * 0.1),
      triggerEvent: "Stage verification and delivery",
    });
  };

  // Submit handler
  const onSubmit = (data: CreateServiceFormValues) => {
    if (!isMilestonesValid) {
      setErrorMessage(`Milestones total ${totalMilestonesPercentage}%. Default milestone schedule must allocate exactly 100% of the advisory fee.`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const newId = Date.now().toString();

    const newService: ServiceItem = {
      id: newId,
      code: data.code.trim().toUpperCase(),
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

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.SERVICES);
      }, 1200);
    }, 500);
  };

  return (
    <div className="space-y-6 w-full">
      {/* 🧭 1. TOP BREADCRUMB & PAGE HEADER (FULL WIDTH MATCHING /users/create EXACTLY) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] shadow-2xs">
            <Briefcase className="h-5 w-5 text-[#092244]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
              Add Service Offering
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Super Admin</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.SERVICES}
                className="hover:text-[#092244] transition-colors"
              >
                Service Catalog
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#092244] font-bold">Configure Service Offering</span>
            </div>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-10 px-4 rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <Link href={ROUTES.SERVICES}>
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Service Catalog</span>
          </Link>
        </Button>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#059669]/30 text-[#059669] flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-xs font-bold">
            Service offering published successfully! Redirecting to Service Catalog...
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="text-xs font-bold">{errorMessage}</div>
        </div>
      )}

      {/* 📋 2. FULL 2-COLUMN RESPONSIVE LAYOUT (FORM + LIVE DOSSIER PREVIEW) */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Details Column (2 Columns wide) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Service Identity & Jurisdictional Classification */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#092244]">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                    1. Service Identity &amp; Program Categorization
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Official service title, destination jurisdiction, and program categorization
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
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
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                    <span>Program Code *</span>
                    {errors.code && (
                      <span className="text-rose-500 font-bold normal-case text-[11px]">
                        {errors.code.message}
                      </span>
                    )}
                  </label>
                  <Input
                    {...register("code")}
                    placeholder="e.g. SRV-EB2-NIW"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Destination Country *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                    <select
                      value={watchedCountry}
                      onChange={handleCountryChange}
                      className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] cursor-pointer"
                    >
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.country}>
                          {c.flag} {c.country} ({c.defaultCurrency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Sub-Category Specialization *
                  </label>
                  <Input
                    {...register("subCategory")}
                    placeholder="e.g. Exceptional Ability"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Service Category *
                  </label>
                  <select
                    {...register("category")}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] cursor-pointer"
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
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-bold text-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Initial Catalog Status
                  </label>
                  <select
                    {...register("status")}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] cursor-pointer"
                  >
                    <option value="Active">Active (Intake Ready)</option>
                    <option value="Draft">Draft (Internal Review)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                    Program Scope &amp; Legal Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Describe the legal advisory scope, preparation milestones, petition support, and deliverables..."
                    className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Strict Fee Separation & Pricing Architecture */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                      2. Strict Fee Separation &amp; Pricing Architecture
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Separate AdSkill advisory revenue from third-party non-revenue pass-through costs
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-lg">
                  Regulatory Rule
                </span>
              </div>

              {/* Fee Separation Rule Callout Alert */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-start gap-3 text-xs">
                <Info className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-[#092244] block">
                    Mandatory Accounting Policy:
                  </span>
                  <p className="text-[#64748B] text-[11px] leading-relaxed">
                    AdSkill earned revenue must only encompass <strong>Professional Advisory Fees</strong>. Government statutory fees, external attorney retainers, or certified translation fees are pass-through expenses collected in escrow and do <strong>not</strong> count as AdSkill firm revenue.
                  </p>
                </div>
              </div>

              {/* Base Fee and Currency Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-[#065F46] flex items-center justify-between">
                    <span>AdSkill Advisory Fee *</span>
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
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] cursor-pointer"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pass-Through Line Item Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#092244] block">
                      Third-Party Pass-Through Expenses ({passThroughFields.length})
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      Itemize statutory and external fees collected in escrow
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPassThroughItem}
                    className="h-8 rounded-xl border-[#EAE6DF] text-xs font-bold gap-1.5 cursor-pointer"
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
                          className="h-9 text-xs bg-white font-bold rounded-lg border-[#EAE6DF]"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                          Category
                        </label>
                        <select
                          {...register(`passThroughFees.${idx}.category`)}
                          className="w-full h-9 px-2 rounded-lg bg-white border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none cursor-pointer"
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
                          placeholder="e.g. US Dept of Homeland Security"
                          className="h-9 text-xs bg-white rounded-lg border-[#EAE6DF]"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center gap-2 pt-2 sm:pt-0">
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
                            className="h-9 text-xs font-mono font-bold bg-white rounded-lg border-[#EAE6DF]"
                          />
                        </div>
                        {passThroughFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePassThrough(idx)}
                            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors mt-4 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Default Milestone Schedule Architecture */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE6]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5FF] text-[#7E22CE]">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                      3. Default Milestone Payment Schedule
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Configure default installment phases for client onboarding (must equal 100%)
                    </p>
                  </div>
                </div>

                {/* Math Validation Status Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border self-start sm:self-auto",
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
                    desc: "50% retainer + 50% final filing",
                  },
                  {
                    id: "deposit_3_monthly",
                    title: "Deposit + 3 Installments",
                    desc: "34% intake + 33% monthly retainers",
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
                      "p-3 rounded-2xl border text-left transition-all cursor-pointer",
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
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#092244]">
                    Payment Phases ({milestoneFields.length})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMilestone}
                    className="h-8 rounded-xl border-[#EAE6DF] text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#092244]" />
                    <span>Add Phase</span>
                  </Button>
                </div>

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
                        className="h-9 text-xs bg-white font-bold rounded-lg border-[#EAE6DF]"
                      />
                    </div>

                    <div className="sm:col-span-4 space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                        Trigger Event Requirement
                      </label>
                      <Input
                        {...register(`defaultMilestones.${idx}.triggerEvent`)}
                        placeholder="e.g. Dossier assembled & approved"
                        className="h-9 text-xs bg-white rounded-lg border-[#EAE6DF]"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-center gap-2 pt-2 sm:pt-0">
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
                            className="h-9 text-xs font-mono font-bold bg-white rounded-lg border-[#EAE6DF] pr-6"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B]">
                            %
                          </span>
                        </div>
                      </div>
                      {milestoneFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors mt-4 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Operational Guidance & Internal Notes */}
            <div className="p-6 sm:p-7 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#092244]">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                    4. Operational Notes &amp; Internal Guidelines
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
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
                  className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] placeholder:text-[#94A3B8]/60 placeholder:font-normal"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar Column (Sticky Live Catalog Preview & Actions) */}
          <div className="lg:sticky lg:top-20 space-y-6 self-start">
            {/* Live Service Offering Preview Card */}
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#F3A712]" />
                  <span>Live Catalog Preview</span>
                </h4>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-md",
                    watchedStatus === "Active"
                      ? "text-[#059669] bg-[#ECFDF5]"
                      : "text-[#D97706] bg-[#FEF3C7]"
                  )}
                >
                  {watchedStatus}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#092244]/10 text-2xl border-2 border-[#FAF8F5] shadow-xs">
                  {watchedFlag}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="text-base font-black text-[#092244] truncate" title={watchedTitle || "New Service Offering"}>
                    {watchedTitle.trim() || "New Service Offering"}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#F0F9FF] text-[#0284C7] border border-[#0284C7]/20">
                      {watchedCode}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF]">
                      {watchedCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Subcard */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>AdSkill Advisory Fee:</span>
                  <span className="font-bold text-[#059669]">
                    {currencySymbol}{watchedProfessionalFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#64748B]">
                  <span>Pass-Through Expenses:</span>
                  <span className="font-bold text-[#0284C7]">
                    {currencySymbol}{totalPassThrough.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#64748B] pt-1 border-t border-[#EAE6DF]">
                  <span className="font-bold text-[#092244]">Total Client Investment:</span>
                  <span className="font-black font-mono text-sm text-[#092244]">
                    {currencySymbol}{totalClientCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#64748B] pt-1 border-t border-[#EAE6DF]">
                  <span>Destination / Lead:</span>
                  <span className="font-bold text-[#092244]">
                    {watchedCountry} &bull; {watchedLeadTime}
                  </span>
                </div>
              </div>

              {/* Milestone Phases Visualizer */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                  <span>Schedule Breakdown:</span>
                  <span className={cn(
                    "font-mono font-bold text-[10px] px-1.5 py-0.2 rounded",
                    isMilestonesValid ? "text-[#059669] bg-[#ECFDF5]" : "text-[#E11D48] bg-[#FFF1F2]"
                  )}>
                    {totalMilestonesPercentage}% Allocated
                  </span>
                </div>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {watchedMilestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-[#092244] truncate max-w-[150px]">
                        {m.name || `Phase ${idx + 1}`}
                      </span>
                      <span className="font-mono font-bold text-[#0284C7] shrink-0 text-[11px]">
                        {m.percentage}% ({currencySymbol}{Math.round((watchedProfessionalFee * (Number(m.percentage) || 0)) / 100).toLocaleString()})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intake & Portal Settings */}
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#0284C7]" />
                <span>Intake &amp; Portal Settings</span>
              </h4>

              <div className="space-y-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                  <input
                    type="checkbox"
                    checked={enablePortalIntake}
                    onChange={(e) => setEnablePortalIntake(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#092244] focus:ring-[#092244] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#092244] block">
                      Enable Client Portal Intake
                    </span>
                    <span className="text-[#64748B] text-[11px] leading-tight block mt-0.5">
                      Prospective clients can view this program and initiate intake questionnaires
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                  <input
                    type="checkbox"
                    checked={requireAttorneyReview}
                    onChange={(e) => setRequireAttorneyReview(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#092244] focus:ring-[#092244] cursor-pointer"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[#092244] block">
                      Require Attorney Review
                    </span>
                    <span className="text-[#64748B] text-[11px] leading-tight block mt-0.5">
                      Case requires formal attorney verification prior to invoice issuance
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Bar (Prominent Submit & Cancel Buttons) */}
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting || !isMilestonesValid}
                className="w-full h-12 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-sm font-bold shadow-md cursor-pointer gap-2 disabled:opacity-50"
              >
                <Briefcase className="h-4.5 w-4.5 text-[#F3A712]" />
                <span>{isSubmitting ? "Publishing Service..." : "Publish Service Offering"}</span>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-10 rounded-xl text-xs font-bold"
              >
                <Link href={ROUTES.SERVICES}>Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
