"use client";

import { Button as CommonButton } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useGetServicesQuery } from "@/services/api/services/servicesApi";
import { useGetUsersQuery } from "@/services/api/users/usersApi";
import {
  useCreateClientCaseMutation,
  useUpdateClientCaseMutation,
} from "@/services/api/clients/clientCasesApi";
import { useCreatePaymentPlanMutation } from "@/services/api/payment-plans/paymentPlansApi";
import {
  createClientSchema,
  type CreateClientFormValues,
} from "@/validations/client.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Receipt,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";

const COUNTRY_DIAL_CODES = [
  { code: "+1", label: "+1 (US & Canada)", country: "US" },
  { code: "+44", label: "+44 (United Kingdom)", country: "GB" },
  { code: "+61", label: "+61 (Australia)", country: "AU" },
  { code: "+49", label: "+49 (Germany)", country: "DE" },
  { code: "+91", label: "+91 (India)", country: "IN" },
  { code: "+971", label: "+971 (UAE)", country: "AE" },
  { code: "+880", label: "+880 (Bangladesh)", country: "BD" },
  { code: "+81", label: "+81 (Japan)", country: "JP" },
  { code: "+33", label: "+33 (France)", country: "FR" },
  { code: "+65", label: "+65 (Singapore)", country: "SG" },
  { code: "+966", label: "+966 (Saudi Arabia)", country: "SA" },
  { code: "+353", label: "+353 (Ireland)", country: "IE" },
  { code: "+234", label: "+234 (Nigeria)", country: "NG" },
  { code: "+27", label: "+27 (South Africa)", country: "ZA" },
];

const DESTINATIONS = [
  { name: "United States", code: "US", flag: "🇺🇸", sub: "USCIS & State Dept" },
  { name: "Canada", code: "CA", flag: "🇨🇦", sub: "IRCC Federal & Prov" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", sub: "UKVI Home Office" },
  { name: "Australia", code: "AU", flag: "🇦🇺", sub: "Home Affairs" },
  { name: "Germany", code: "DE", flag: "🇩🇪", sub: "BAMF Federal" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD" },
  { code: "CAD", symbol: "C$", label: "CAD" },
  { code: "GBP", symbol: "£", label: "GBP" },
  { code: "EUR", symbol: "€", label: "EUR" },
  { code: "AUD", symbol: "A$", label: "AUD" },
];

const SCHEDULE_PRESETS = [
  {
    id: "single",
    title: "100% Upfront Retainer",
    desc: "Single initial payment upon agreement",
    badge: "100%",
  },
  {
    id: "deposit_2_milestones",
    title: "40% Retainer + 2 Phases",
    desc: "40% deposit with 2 subsequent milestone releases",
    badge: "Popular",
  },
  {
    id: "deposit_3_monthly",
    title: "34% Retainer + 3 Monthly",
    desc: "Initial deposit followed by 3 monthly installments",
    badge: "Monthly",
  },
  {
    id: "custom",
    title: "Custom Schedule",
    desc: "Tailored installment breakdown and due dates",
    badge: "Custom",
  },
] as const;

const NOTE_TEMPLATES = [
  "Standard intake dossier opened following initial legal consultation.",
  "Priority fast-track processing requested by applicant.",
  "Corporate-sponsored relocation with direct employer billing authorization.",
  "Family-stream concurrent application with dependent documentation pending.",
];

function parsePhoneAndDialCode(rawPhoneOrWhatsapp?: string): {
  dialCode: string;
  number: string;
} {
  if (!rawPhoneOrWhatsapp) return { dialCode: "+1", number: "" };
  const cleaned = rawPhoneOrWhatsapp.trim();
  const sortedCodes = [...COUNTRY_DIAL_CODES].sort(
    (a, b) => b.code.length - a.code.length,
  );
  const matched = sortedCodes.find((c) => cleaned.startsWith(c.code));
  if (matched) {
    const num = cleaned.slice(matched.code.length).trim();
    return { dialCode: matched.code, number: num };
  }
  return { dialCode: "+1", number: cleaned };
}

interface ExistingUserOption {
  id: string;
  source: "user";
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  countryOfOrigin?: string;
  city?: string;
  initials?: string;
  badgeLabel: string;
  existingCaseRef?: string;
  role?: string;
  userId?: string;
  status?: string;
}

export function CreateClientForm() {
  const router = useRouter();
  const { data: servicesResponse, isLoading: isServicesLoading } = useGetServicesQuery({
    limit: 100,
    isActive: "true",
  });
  const services = servicesResponse?.data || [];

  const { data: usersApiResponse, isLoading: isUsersLoading } = useGetUsersQuery({
    limit: 100,
  });

  const [createClientCase] = useCreateClientCaseMutation();
  const [updateClientCase] = useUpdateClientCaseMutation();
  const [createPaymentPlan] = useCreatePaymentPlanMutation();

  const [caseIdentifier, setCaseIdentifier] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdClientId, setCreatedClientId] = React.useState<string | null>(null);
  const [errorNotice, setErrorNotice] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState<"identity" | "service" | "finance">("identity");

  // Applicant Intake Mode: "new" = brand new applicant, "existing" = pick from registered users
  const [intakeMode, setIntakeMode] = React.useState<"new" | "existing">("new");
  const [selectedExistingUser, setSelectedExistingUser] = React.useState<ExistingUserOption | null>(null);
  const [existingSearchQuery, setExistingSearchQuery] = React.useState<string>("");

  // Live Staff list for consultant assignment
  const staffConsultants = React.useMemo(() => {
    const users = usersApiResponse?.data || [];
    return users.filter(
      (u) => u.role?.name && u.role.name !== "CLIENT" && u.status === "ACTIVE",
    );
  }, [usersApiResponse]);

  // Unified existing users list
  const existingUserOptions = React.useMemo<ExistingUserOption[]>(() => {
    const options: ExistingUserOption[] = [];
    const backendUsers = usersApiResponse?.data;
    if (backendUsers && backendUsers.length > 0) {
      backendUsers.forEach((u) => {
        const initials = u.name
          ? u.name
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : "U";
        const roleName = u.role?.name || "CLIENT";
        options.push({
          id: `user-${u.id}`,
          source: "user",
          name: u.name,
          email: u.email,
          phone: u.phone || undefined,
          whatsapp: u.whatsapp || u.phone || undefined,
          countryOfOrigin: u.country || undefined,
          city: u.city || undefined,
          initials,
          badgeLabel: `Portal User (${roleName})`,
          existingCaseRef: u.clientId || `USR-${u.id.slice(0, 8).toUpperCase()}`,
          role: roleName,
          userId: u.id,
          status: u.status,
        });
      });
    }
    return options;
  }, [usersApiResponse]);

  // Filtered existing users based on search
  const filteredExistingUsers = React.useMemo(() => {
    if (!existingSearchQuery.trim()) {
      return existingUserOptions.slice(0, 10);
    }
    const q = existingSearchQuery.toLowerCase();
    return existingUserOptions.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.whatsapp && u.whatsapp.toLowerCase().includes(q)) ||
        (u.existingCaseRef && u.existingCaseRef.toLowerCase().includes(q)),
    );
  }, [existingUserOptions, existingSearchQuery]);

  // Initialize React Hook Form with Zod schema validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      preferredName: "",
      email: "",
      phone: "",
      passportNumber: "",
      countryOfOrigin: "",
      city: "",
      countryCode: "+1",
      whatsappNumber: "",
      sendWelcomeWhatsApp: true,
      serviceId: "",
      destinationCountry: "United States",
      destinationCode: "US",
      visaCategory: "",
      subCategory: "",
      assignedConsultant: "",
      assignedConsultantId: "",
      status: "INTAKE",
      currency: "USD",
      baseFee: 0,
      discountAmount: 0,
      discountReason: "",
      contractedFee: 0,
      depositAmount: 0,
      scheduleType: "deposit_2_milestones",
      milestones: [],
      remindersEnabled: true,
      sendEmailInvitation: true,
      internalNotes: "",
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "milestones",
  });

  const handleSelectExistingUser = (user: ExistingUserOption) => {
    setSelectedExistingUser(user);
    setValue("name", user.name, { shouldValidate: true });
    setValue("email", user.email, { shouldValidate: true });
    if (user.name) {
      const parts = user.name.trim().split(" ");
      setValue("preferredName", parts[0]);
    }
    if (user.phone) {
      setValue("phone", user.phone);
    }
    const parsed = parsePhoneAndDialCode(user.whatsapp || user.phone);
    if (parsed.dialCode) {
      setValue("countryCode", parsed.dialCode);
    }
    if (parsed.number) {
      setValue("whatsappNumber", parsed.number, { shouldValidate: true });
    }
    if (user.countryOfOrigin) {
      setValue("countryOfOrigin", user.countryOfOrigin);
    }
    if (user.city) {
      setValue("city", user.city);
    }
    const currentNotes = watch("internalNotes") || "";
    if (!currentNotes.trim()) {
      setValue(
        "internalNotes",
        `Case opened for registered portal client ${user.name} (${user.existingCaseRef || user.email}).`,
      );
    }
  };

  const handleClearExistingUser = () => {
    setSelectedExistingUser(null);
    setValue("name", "");
    setValue("preferredName", "");
    setValue("email", "");
    setValue("phone", "");
    setValue("whatsappNumber", "");
    setValue("passportNumber", "");
    setValue("countryOfOrigin", "");
    setValue("city", "");
  };

  const handleSwitchIntakeMode = (mode: "new" | "existing") => {
    setIntakeMode(mode);
    if (mode === "new" && selectedExistingUser) {
      handleClearExistingUser();
    }
  };

  // Watched form values for live reactive financial math & preview
  const watchedName = watch("name");
  const watchedEmail = watch("email");
  const watchedCountryCode = watch("countryCode");
  const watchedWhatsapp = watch("whatsappNumber");
  const watchedCountry = watch("destinationCountry");
  const watchedServiceId = watch("serviceId");
  const watchedVisaCategory = watch("visaCategory");
  const watchedAssignedConsultant = watch("assignedConsultant");
  const watchedAssignedConsultantId = watch("assignedConsultantId");
  const watchedStatus = watch("status");
  const watchedCurrency = watch("currency");
  const watchedBaseFee = watch("baseFee") || 0;
  const watchedDiscount = watch("discountAmount") || 0;
  const watchedDeposit = watch("depositAmount") || 0;
  const watchedMilestones = watch("milestones") || [];
  const watchedScheduleType = watch("scheduleType");

  const currencySymbol =
    CURRENCIES.find((c) => c.code === watchedCurrency)?.symbol || "$";

  // Re-calculate contracted fee when baseFee or discount changes
  const computedContractedFee = Math.max(0, watchedBaseFee - watchedDiscount);

  React.useEffect(() => {
    setValue("contractedFee", computedContractedFee, { shouldValidate: true });
  }, [computedContractedFee, setValue]);

  // Milestone sum and mathematical validation status
  const totalMilestonesSum = watchedMilestones.reduce(
    (acc, m) => acc + (Number(m.amount) || 0),
    0,
  );
  const totalAllocated = watchedDeposit + totalMilestonesSum;
  const financialDiscrepancy = computedContractedFee - totalAllocated;
  const isMathValid = Math.abs(financialDiscrepancy) < 0.05;

  // Handle schedule type preset selection
  const handleScheduleTypeChange = (
    type: CreateClientFormValues["scheduleType"],
  ) => {
    setValue("scheduleType", type);
    const fee = computedContractedFee;

    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const m1Date = nextMonth.toISOString().slice(0, 10);

    const monthTwo = new Date();
    monthTwo.setMonth(monthTwo.getMonth() + 2);
    const m2Date = monthTwo.toISOString().slice(0, 10);

    const monthThree = new Date();
    monthThree.setMonth(monthThree.getMonth() + 3);
    const m3Date = monthThree.toISOString().slice(0, 10);

    if (type === "single") {
      setValue("depositAmount", fee);
      replace([]);
    } else if (type === "deposit_2_milestones") {
      const deposit = Math.round(fee * 0.4);
      const halfRemaining = Math.round((fee - deposit) / 2);
      setValue("depositAmount", deposit);
      replace([
        {
          id: "m1",
          name: "Milestone 1 — Document & Dossier Filing",
          dueDate: m1Date,
          amount: halfRemaining,
        },
        {
          id: "m2",
          name: "Milestone 2 — Final Adjudication & Decision",
          dueDate: m2Date,
          amount: fee - deposit - halfRemaining,
        },
      ]);
    } else if (type === "deposit_3_monthly") {
      const deposit = Math.round(fee * 0.34);
      const perMonth = Math.round((fee - deposit) / 3);
      setValue("depositAmount", deposit);
      replace([
        {
          id: "m1",
          name: "Installment #1 — First Month Retainer",
          dueDate: m1Date,
          amount: perMonth,
        },
        {
          id: "m2",
          name: "Installment #2 — Second Month Retainer",
          dueDate: m2Date,
          amount: perMonth,
        },
        {
          id: "m3",
          name: "Installment #3 — Third Month Retainer",
          dueDate: m3Date,
          amount: fee - deposit - perMonth * 2,
        },
      ]);
    }
  };

  // Handle selection from live service catalog
  const handleServiceSelect = (serviceId: string) => {
    const selected = services.find((s) => s.id === serviceId);
    if (selected) {
      setValue("serviceId", selected.id, { shouldValidate: true });
      setValue("visaCategory", selected.name, { shouldValidate: true });
      setValue("subCategory", selected.category);
      setValue("currency", selected.currency || "USD");

      const fee = Number(selected.baseFee || 0);
      setValue("baseFee", fee);
      setValue("discountAmount", 0);
      setValue("discountReason", "");
      setValue("contractedFee", fee);

      const deposit = selected.defaultDeposit
        ? Number(selected.defaultDeposit)
        : Math.round(fee * 0.4);
      setValue("depositAmount", deposit);

      const remaining = fee - deposit;
      const installmentsCount = selected.defaultInstallments || 2;
      const instAmt = installmentsCount > 0 ? Math.round(remaining / installmentsCount) : 0;

      const newMilestones = [];
      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i);
        newMilestones.push({
          id: `m${i}`,
          name: `Phase ${i} — Deliverable Verification`,
          dueDate: dueDate.toISOString().slice(0, 10),
          amount:
            i === installmentsCount
              ? remaining - instAmt * (installmentsCount - 1)
              : instAmt,
        });
      }
      replace(newMilestones);
    } else {
      setValue("serviceId", "");
      setValue("visaCategory", "");
      setValue("baseFee", 0);
      setValue("contractedFee", 0);
      setValue("depositAmount", 0);
      replace([]);
    }
  };

  // Handle destination country change
  const handleCountryChange = (c: string) => {
    setValue("destinationCountry", c);
    const dest = DESTINATIONS.find((d) => d.name === c);
    setValue("destinationCode", dest?.code || "US");
  };

  // Handle Consultant Change
  const handleConsultantChange = (consultantId: string) => {
    const staff = staffConsultants.find((s) => s.id === consultantId);
    if (staff) {
      setValue("assignedConsultantId", staff.id);
      setValue("assignedConsultant", staff.name);
    } else {
      setValue("assignedConsultantId", "");
      setValue("assignedConsultant", "");
    }
  };

  // Add custom milestone
  const handleAddMilestone = () => {
    const nextIdx = fields.length + 1;
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + nextIdx);
    replace([
      ...watchedMilestones,
      {
        id: `m_${Date.now()}`,
        name: `Milestone ${nextIdx} — Custom Deliverable`,
        dueDate: defaultDate.toISOString().slice(0, 10),
        amount: Math.max(0, financialDiscrepancy),
      },
    ]);
  };

  // Remove milestone
  const handleRemoveMilestone = (index: number) => {
    const updated = [...watchedMilestones];
    updated.splice(index, 1);
    replace(updated);
  };

  // WhatsApp formatted link preview
  const cleanPhone = (watchedCountryCode + watchedWhatsapp).replace(
    /[^\d+]/g,
    "",
  );
  const whatsappPreviewUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Hello ${watchedName || "Valued Client"}, welcome to AdSkill Consultancy. Your case onboarding has been initiated.`,
  )}`;

  // Submit Handler
  const onSubmit = async (data: CreateClientFormValues) => {
    if (!data.serviceId) {
      setErrorNotice("Please select an active service from the catalog before proceeding.");
      setActiveTab("service");
      return;
    }
    setErrorNotice("");
    setIsSubmitting(true);

    try {
      // 1. Create client case in backend
      const created = await createClientCase({
        serviceId: data.serviceId,
        destinationCountry: data.destinationCountry,
        caseCategory: data.visaCategory,
        caseSubcategory: data.subCategory || undefined,
        clientVisibleNotes: data.internalNotes?.trim() || undefined,
      }).unwrap();

      const createdCase = created.data;
      setCaseIdentifier(createdCase.caseCode);
      setCreatedClientId(createdCase.id);

      // 2. Patch case with consultant / status if specified
      if (data.assignedConsultantId || data.status !== "INTAKE" || data.internalNotes) {
        try {
          await updateClientCase({
            id: createdCase.id,
            body: {
              assignedConsultantId: data.assignedConsultantId || undefined,
              caseStatus: data.status,
              internalNotes: data.internalNotes || undefined,
            },
          }).unwrap();
        } catch (updateErr) {
          console.warn("Could not set consultant assignment:", updateErr);
        }
      }

      // 3. Create Payment Plan with exact installment amounts
      if (isMathValid && data.contractedFee > 0) {
        const installmentsToSend: Array<{
          sequenceNumber: number;
          title: string;
          amount: number;
          dueDate: string;
        }> = [];

        // If deposit is configured, it is sequence 1 (Initial Retainer / Deposit)
        if (data.depositAmount > 0) {
          installmentsToSend.push({
            sequenceNumber: 1,
            title: "Initial Retainer / Upfront Deposit",
            amount: Number(data.depositAmount),
            dueDate: new Date().toISOString(),
          });
        }

        // Subsequent milestones follow sequence numbers
        data.milestones.forEach((m) => {
          if (Number(m.amount) > 0) {
            installmentsToSend.push({
              sequenceNumber: installmentsToSend.length + 1,
              title: m.name,
              amount: Number(m.amount),
              dueDate: new Date(m.dueDate).toISOString(),
            });
          }
        });

        // If single schedule with no separate milestones
        if (installmentsToSend.length === 0) {
          installmentsToSend.push({
            sequenceNumber: 1,
            title: "Full Contracted Retainer",
            amount: Number(data.contractedFee),
            dueDate: new Date().toISOString(),
          });
        }

        await createPaymentPlan({
          caseId: createdCase.id,
          body: {
            currency: data.currency,
            discountAmount: data.discountAmount || 0,
            discountReason: data.discountReason || undefined,
            depositAmount: data.depositAmount || 0,
            scheduleType: data.scheduleType,
            installments: installmentsToSend,
          },
        }).unwrap();
      }

      setIsSuccess(true);
      router.push(`/clients/${createdCase.id}`);
    } catch (error: any) {
      console.error("Failed to onboard client case:", error);
      const msg =
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred while creating the client case. Please verify the fields and try again.";
      setErrorNotice(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDestinationObj = DESTINATIONS.find(
    (d) => d.name === watchedCountry,
  ) || DESTINATIONS[0];

  const applicantDisplayName = watchedName || "Draft Applicant";
  const applicantInitials = watchedName
    ? watchedName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "NC";

  const selectedServiceName =
    services.find((s) => s.id === watchedServiceId)?.name || watchedVisaCategory || "No service selected";

  const allocationPercent =
    computedContractedFee > 0
      ? Math.min(100, Math.round((totalAllocated / computedContractedFee) * 100))
      : 100;

  return (
    <div className="w-full space-y-6 pb-20">
      {/* 1. TOP HEADER & BREADCRUMB BAR (CLEAN LIGHT DESIGN) */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <CommonButton
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-2xl bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shrink-0 transition-all">
              <Link href={ROUTES.CLIENTS}>
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Return to Client Directory</span>
              </Link>
            </CommonButton>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  Client Onboarding Studio
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Registry Connected
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
                Create Client Case &amp; Schedule
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Register applicant credentials, set destination jurisdiction, and establish milestone payment terms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                System Reference
              </span>
              <span className="font-mono font-bold text-sm text-slate-800">
                {caseIdentifier || "Auto-assigned on save"}
              </span>
            </div>
          </div>
        </div>

        {/* Stepper Navigation Pills (Clean Light Theme - 3 Steps) */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2 sm:gap-3">
          {[
            {
              id: "identity",
              step: "1",
              label: "Applicant Identity",
              icon: User,
              valid: Boolean(watchedName && watchedEmail && watchedWhatsapp),
            },
            {
              id: "service",
              step: "2",
              label: "Case & Jurisdiction",
              icon: MapPin,
              valid: Boolean(watchedServiceId && watchedCountry),
            },
            {
              id: "finance",
              step: "3",
              label: "Financial Ledger",
              icon: CreditCard,
              valid: Boolean(computedContractedFee > 0 && isMathValid),
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  const el = document.getElementById(`section-${tab.id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                  isActive
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}>
                <span
                  className={cn(
                    "flex h-4.5 w-4.5 items-center justify-center rounded-md text-[10px] font-black",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700",
                  )}>
                  {tab.step}
                </span>
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.valid && (
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 ml-0.5",
                      isActive ? "text-white" : "text-emerald-600",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ERROR NOTICE BANNER */}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Case Creation Discrepancy
            </h4>
            <p className="text-xs text-rose-700 font-medium">{errorNotice}</p>
          </div>
        </div>
      )}

      {/* SUCCESS NOTICE BANNER */}
      {isSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Case Successfully Created &amp; Scheduled!
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Case Code: <span className="font-mono font-bold">{caseIdentifier}</span>. Redirecting to workspace...
              </p>
            </div>
          </div>
          {createdClientId && (
            <Link
              href={`/clients/${createdClientId}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-950 bg-white px-4 py-2 rounded-xl shadow-xs border border-emerald-200 hover:bg-emerald-100 transition-colors">
              Open Case Dossier &rarr;
            </Link>
          )}
        </div>
      )}

      {/* 2. MAIN TWO-COLUMN WORKSPACE (CLEAN LIGHT THEME) */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: FORM SECTIONS (8 OF 12 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION 1: APPLICANT IDENTITY & COMMUNICATION */}
            <div
              id="section-identity"
              className={cn(
                "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs transition-all",
                activeTab === "identity" ? "ring-2 ring-amber-400/40" : "",
              )}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                      1. Applicant Dossier &amp; Contact
                    </h2>
                    <p className="text-xs text-slate-500">
                      Legal identity, verification credentials, and direct communication channels
                    </p>
                  </div>
                </div>

                {/* Intake Source Switcher */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleSwitchIntakeMode("new")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      intakeMode === "new"
                        ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900",
                    )}>
                    <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                    New Client
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchIntakeMode("existing")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      intakeMode === "existing"
                        ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80"
                        : "text-slate-600 hover:text-slate-900",
                    )}>
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    Registered Portal User
                  </button>
                </div>
              </div>

              {/* EXISTING USER LOOKUP DRAWER */}
              {intakeMode === "existing" && (
                <div className="mt-5 p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
                  {!selectedExistingUser ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                              Select Registered Portal Account
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              {existingUserOptions.length} Active Accounts
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Auto-populates contact and portal identity records instantly.
                          </p>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <Input
                          value={existingSearchQuery}
                          onChange={(e) => setExistingSearchQuery(e.target.value)}
                          className="h-11 pl-10 pr-9 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900"
                        />
                        {existingSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setExistingSearchQuery("")}
                            className="absolute right-3 top-3 p-0.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* User Items */}
                      {isUsersLoading ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2 text-slate-700" />
                          Fetching registered users...
                        </div>
                      ) : filteredExistingUsers.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                          No registered user records match your query.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                          {filteredExistingUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => handleSelectExistingUser(user)}
                              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-2xs transition-all cursor-pointer flex items-center gap-3 group">
                              <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs text-blue-700 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {user.initials}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-bold text-slate-900 truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold text-slate-500">
                                    {user.role}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 truncate block">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-blue-300 shadow-2xs">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {selectedExistingUser.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">
                              {selectedExistingUser.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 border border-blue-100">
                              {selectedExistingUser.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {selectedExistingUser.email}
                            {selectedExistingUser.phone && ` • ${selectedExistingUser.phone}`}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearExistingUser}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors">
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Applicant Fields Grid */}
              <div className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        Full Legal Name *
                      </span>
                      {errors.name && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.name.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("name")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                      Preferred / First Name
                    </label>
                    <Input
                      {...register("preferredName")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        Email Address *
                      </span>
                      {errors.email && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.email.message}
                        </span>
                      )}
                    </label>
                    <Input
                      type="email"
                      {...register("email")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      Primary Telephone
                    </label>
                    <Input
                      {...register("phone")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-slate-400" />
                      Passport or National ID
                    </label>
                    <Input
                      {...register("passportNumber")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-slate-400" />
                      Country of Origin / Citizenship
                    </label>
                    <Input
                      {...register("countryOfOrigin")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Direct Sub-card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                        <MessageCircle className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                          Direct WhatsApp Client Integration
                        </h3>
                        <p className="text-[11px] text-emerald-700">
                          Automates intake confirmation, payment reminder alerts, and document requests
                        </p>
                      </div>
                    </div>

                    {watchedWhatsapp && (
                      <a
                        href={whatsappPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs">
                        <ExternalLink className="h-3 w-3" />
                        Test Link
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-emerald-900">
                        Country Dial Code
                      </label>
                      <select
                        {...register("countryCode")}
                        className="w-full h-11 px-3 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        {COUNTRY_DIAL_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-emerald-900 flex items-center justify-between">
                        <span>WhatsApp Mobile Number *</span>
                        {errors.whatsappNumber && (
                          <span className="text-rose-600 font-medium text-[11px]">
                            {errors.whatsappNumber.message}
                          </span>
                        )}
                      </label>
                      <Input
                        {...register("whatsappNumber")}
                        className="h-11 rounded-xl bg-white border-emerald-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: CASE SCOPE & JURISDICTION */}
            <div
              id="section-service"
              className={cn(
                "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs transition-all",
                activeTab === "service" ? "ring-2 ring-amber-400/40" : "",
              )}>
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                    2. Service Scope &amp; Case Jurisdiction
                  </h2>
                  <p className="text-xs text-slate-500">
                    Catalog program, destination authority, and assigned caseworker
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Service Catalog Dropdown */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                      Select Service Offering from Live Catalog *
                    </span>
                    {errors.serviceId && (
                      <span className="text-rose-600 font-medium normal-case text-[11px]">
                        {errors.serviceId.message}
                      </span>
                    )}
                  </label>

                  {isServicesLoading ? (
                    <div className="text-xs text-slate-500 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-800" />
                      Loading active service programs...
                    </div>
                  ) : (
                    <select
                      value={watchedServiceId}
                      onChange={(e) => handleServiceSelect(e.target.value)}
                      className="w-full h-12 px-3.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs cursor-pointer">
                      <option value="">-- Choose active immigration or visa offering --</option>
                      {services.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {`${s.name} [${s.code}] • Category: ${s.category} • Base Fee: $${Number(s.baseFee || 0).toLocaleString()} ${s.currency || "USD"}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Destination Country Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Destination Jurisdiction Authority *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {DESTINATIONS.map((dest) => {
                      const isSelected = watchedCountry === dest.name;
                      return (
                        <button
                          key={dest.code}
                          type="button"
                          onClick={() => handleCountryChange(dest.name)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                            isSelected
                              ? "bg-blue-50 border-blue-600 text-blue-950 shadow-2xs ring-1 ring-blue-600/30"
                              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                          )}>
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{dest.flag}</span>
                            <span
                              className={cn(
                                "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                                isSelected ? "bg-blue-200 text-blue-900" : "bg-slate-100 text-slate-600",
                              )}>
                              {dest.code}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-extrabold block leading-tight">
                              {dest.name}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] block mt-0.5 leading-tight truncate",
                                isSelected ? "text-blue-700" : "text-slate-500",
                              )}>
                              {dest.sub}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Subcategory, Consultant, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Visa Category Title *</span>
                      {errors.visaCategory && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.visaCategory.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("visaCategory")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Subcategory / Stream
                    </label>
                    <Input
                      {...register("subCategory")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Assigned Case Consultant
                    </label>
                    <select
                      value={watchedAssignedConsultantId || ""}
                      onChange={(e) => handleConsultantChange(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600">
                      <option value="">-- Unassigned Caseworker --</option>
                      {staffConsultants.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {`${staff.name} (${staff.role?.name || "Consultant"})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Initial Case Status
                    </label>
                    <select
                      {...register("status")}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600">
                      <option value="INTAKE">Intake (Initial Review)</option>
                      <option value="ACTIVE">Active (In Preparation)</option>
                      <option value="ON_HOLD">On Hold (Pending Client)</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: FINANCIAL TERMS & PAYMENT MILESTONES */}
            <div
              id="section-finance"
              className={cn(
                "rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs transition-all",
                activeTab === "finance" ? "ring-2 ring-amber-400/40" : "",
              )}>
              <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs font-black">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold tracking-tight text-slate-900">
                    3. Professional Fees &amp; Milestone Plan
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standard pricing, authorized discount deductions, and scheduled installments
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {/* Currency & Base Fee Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Contract Billing Currency
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {CURRENCIES.map((c) => {
                        const isSelected = watchedCurrency === c.code;
                        return (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setValue("currency", c.code)}
                            className={cn(
                              "h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                              isSelected
                                ? "bg-amber-50 border-amber-500 text-amber-900 shadow-2xs font-extrabold"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",
                            )}>
                            {c.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Base Professional Fee ({currencySymbol}) *</span>
                      {errors.baseFee && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.baseFee.message}
                        </span>
                      )}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register("baseFee", { valueAsNumber: true })}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-extrabold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Upfront Retainer / Deposit ({currencySymbol})</span>
                      {errors.depositAmount && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.depositAmount.message}
                        </span>
                      )}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register("depositAmount", { valueAsNumber: true })}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-extrabold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Discount Deductions */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Approved Discount Amount ({currencySymbol})</span>
                      {errors.discountAmount && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.discountAmount.message}
                        </span>
                      )}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register("discountAmount", { valueAsNumber: true })}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Discount Justification</span>
                      {errors.discountReason && (
                        <span className="text-rose-600 font-medium text-[11px]">
                          {errors.discountReason.message}
                        </span>
                      )}
                    </label>
                    <Input
                      {...register("discountReason")}
                      className="h-11 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {/* Schedule Structure Presets */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Installment Schedule Structure Preset
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {SCHEDULE_PRESETS.map((preset) => {
                      const isSelected = watchedScheduleType === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleScheduleTypeChange(preset.id as any)}
                          className={cn(
                            "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5",
                            isSelected
                              ? "bg-amber-50/80 border-amber-400 text-amber-950 shadow-2xs ring-1 ring-amber-400/40"
                              : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50",
                          )}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold block">
                              {preset.title}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase",
                                isSelected ? "bg-amber-200 text-amber-900" : "bg-slate-100 text-slate-600",
                              )}>
                              {preset.badge}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] leading-tight block",
                              isSelected ? "text-amber-800" : "text-slate-500",
                            )}>
                              {preset.desc}
                            </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Milestones Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Scheduled Milestones &amp; Due Dates
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {fields.length} milestone installment{fields.length === 1 ? "" : "s"} configured
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
                      <Plus className="h-3.5 w-3.5 text-amber-600" />
                      Add Phase
                    </button>
                  </div>

                  {fields.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      100% upfront payment selected. No separate milestone installments required.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-slate-200 text-slate-800 border border-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                            #{idx + 1}
                          </div>
                          <div className="flex-1">
                            <Input
                              {...register(`milestones.${idx}.name` as const)}
                              className="h-10 rounded-xl bg-white border-slate-200 text-xs font-bold text-slate-900"
                            />
                          </div>
                          <div className="w-full sm:w-44">
                            <Input
                              type="date"
                              {...register(`milestones.${idx}.dueDate` as const)}
                              className="h-10 rounded-xl bg-white border-slate-200 text-xs font-semibold text-slate-900"
                            />
                          </div>
                          <div className="w-full sm:w-36">
                            <Input
                              type="number"
                              step="any"
                              {...register(`milestones.${idx}.amount` as const, {
                                valueAsNumber: true,
                              })}
                              className="h-10 rounded-xl bg-white border-slate-200 text-xs font-extrabold text-slate-900 text-right"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(idx)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mathematical Integrity Ledger Balance Bar (Light Theme) */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Ledger Balancing Engine
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        Deposit ({currencySymbol}{watchedDeposit.toLocaleString()}) + Milestones ({currencySymbol}{totalMilestonesSum.toLocaleString()})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isMathValid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <Check className="h-4 w-4 stroke-[3]" />
                          100% Perfect Balance
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Discrepancy: {currencySymbol}{Math.abs(financialDiscrepancy).toLocaleString()} ({financialDiscrepancy > 0 ? "Unallocated" : "Overallocated"})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          isMathValid
                            ? "bg-emerald-500"
                            : financialDiscrepancy > 0
                              ? "bg-amber-500"
                              : "bg-rose-500",
                        )}
                        style={{ width: `${Math.min(100, allocationPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Total Contracted: <b className="text-slate-900">{currencySymbol}{computedContractedFee.toLocaleString()}</b></span>
                      <span>Allocated: <b className="text-slate-900">{currencySymbol}{totalAllocated.toLocaleString()} ({allocationPercent}%)</b></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY LIVE DOSSIER TICKET (CLEAN LIGHT THEME) */}
          <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
            {/* Real-time Dossier Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Live Case Dossier Slip
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {watchedCountryCode}
                </span>
              </div>

              {/* Applicant Avatar Preview */}
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-base flex items-center justify-center shrink-0 shadow-2xs">
                  {applicantInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-slate-900 truncate">
                    {applicantDisplayName}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {watchedEmail || "No email assigned"}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-700 truncate mt-0.5">
                    {watchedWhatsapp ? `${watchedCountryCode} ${watchedWhatsapp}` : "No mobile assigned"}
                  </p>
                </div>
              </div>

              {/* Case Scope Badge */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Destination</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{selectedDestinationObj.flag}</span>
                    <span>{selectedDestinationObj.name}</span>
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Service</span>
                  <span className="font-bold text-slate-900 max-w-[180px] truncate text-right">
                    {selectedServiceName}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Consultant</span>
                  <span className="font-bold text-slate-900">
                    {watchedAssignedConsultant || "Unassigned"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {watchedStatus}
                  </span>
                </div>
              </div>

              {/* Financial Ledger Breakdown Slip (Light Theme) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">Base Professional Fee</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currencySymbol}{watchedBaseFee.toLocaleString()}
                  </span>
                </div>

                {watchedDiscount > 0 && (
                  <div className="flex justify-between items-center text-xs text-amber-700">
                    <span className="font-medium">Approved Discount</span>
                    <span className="font-mono font-bold">
                      -{currencySymbol}{watchedDiscount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Contracted Fee
                    </span>
                    <span className="font-mono font-black text-xl text-slate-900">
                      {currencySymbol}{computedContractedFee.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-200 text-slate-800">
                    {watchedCurrency}
                  </span>
                </div>

                {/* Retainer & Milestones mini list */}
                <div className="pt-2 border-t border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Upfront Retainer</span>
                    <span className="font-mono font-bold text-slate-900">
                      {currencySymbol}{watchedDeposit.toLocaleString()}
                    </span>
                  </div>

                  {watchedMilestones.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-slate-500 text-[11px]">
                      <span className="truncate max-w-[160px]">
                        #{idx + 1} {m.name || "Milestone"}
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">
                        {currencySymbol}{(Number(m.amount) || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Math check status */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Balance Integrity</span>
                  {isMathValid ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Balanced ($0 diff)
                    </span>
                  ) : (
                    <span className="text-amber-800 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                      {currencySymbol}{Math.abs(financialDiscrepancy).toLocaleString()} off
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <CommonButton
                  type="submit"
                  disabled={isSubmitting || !isMathValid}
                  className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authorizing Case &amp; Ledger...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Authorize &amp; Onboard Case
                    </span>
                  )}
                </CommonButton>

                <CommonButton
                  asChild
                  type="button"
                  variant="ghost"
                  className="w-full h-10 rounded-2xl text-slate-500 hover:text-slate-900 text-xs font-bold">
                  <Link href={ROUTES.CLIENTS}>Cancel and Return</Link>
                </CommonButton>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
