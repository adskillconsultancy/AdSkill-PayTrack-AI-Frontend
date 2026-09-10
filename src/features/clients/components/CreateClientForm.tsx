"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createClientSchema,
  type CreateClientFormValues,
} from "@/validations/client.schema";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ClientItem, ClientStatus } from "../types";
import { addMockClient, getMockClients } from "../mockData";
import { MOCK_USERS } from "@/features/users";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Users,
  Search,
  UserCheck,
  X,
  Link2,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  User,
  CheckCircle2,
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Percent,
  Info,
  ExternalLink,
  Sparkles,
  DollarSign,
  Calendar,
  Globe,
  Clock,
  Check,
  FileText,
} from "lucide-react";

// Predefined official AdSkill Service Catalog
interface ServiceCatalogItem {
  id: string;
  title: string;
  subCategory: string;
  defaultFee: number;
  country: string;
  countryCode: string;
}

const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: "eb2_niw",
    title: "EB-2 NIW",
    subCategory: "National Interest Waiver",
    defaultFee: 6500,
    country: "United States",
    countryCode: "US",
  },
  {
    id: "eb1a",
    title: "EB-1A",
    subCategory: "Extraordinary Ability",
    defaultFee: 8000,
    country: "United States",
    countryCode: "US",
  },
  {
    id: "eb3",
    title: "EB-3",
    subCategory: "Skilled / Professional Worker",
    defaultFee: 5500,
    country: "United States",
    countryCode: "US",
  },
  {
    id: "e2",
    title: "E-2 Treaty Investor",
    subCategory: "Principal Investor Visa",
    defaultFee: 7500,
    country: "United States",
    countryCode: "US",
  },
  {
    id: "l1",
    title: "L-1 Intracompany Transferee",
    subCategory: "Executive & Managerial (L-1A)",
    defaultFee: 6000,
    country: "United States",
    countryCode: "US",
  },
  {
    id: "ee_fsw",
    title: "Canada Express Entry",
    subCategory: "Federal Skilled Worker (FSW)",
    defaultFee: 4500,
    country: "Canada",
    countryCode: "CA",
  },
  {
    id: "ca_pnp",
    title: "Canada PNP",
    subCategory: "Provincial Nominee Program",
    defaultFee: 5200,
    country: "Canada",
    countryCode: "CA",
  },
  {
    id: "uk_skilled",
    title: "UK Skilled Worker",
    subCategory: "Shortage Occupation Route",
    defaultFee: 4200,
    country: "United Kingdom",
    countryCode: "GB",
  },
  {
    id: "au_gti",
    title: "Australia GTI",
    subCategory: "Global Talent Independent (Subclass 858)",
    defaultFee: 4800,
    country: "Australia",
    countryCode: "AU",
  },
  {
    id: "student_visa",
    title: "Student Visa",
    subCategory: "Higher Education / University",
    defaultFee: 3200,
    country: "Canada",
    countryCode: "CA",
  },
  {
    id: "family_sponsorship",
    title: "Family Sponsorship",
    subCategory: "Spousal & Dependent Route",
    defaultFee: 3500,
    country: "Canada",
    countryCode: "CA",
  },
  {
    id: "business_formation",
    title: "Business Formation",
    subCategory: "US Corporate Setup & EIN",
    defaultFee: 3800,
    country: "United States",
    countryCode: "US",
  },
  {
    id: "consultation",
    title: "Consultation & Advisory",
    subCategory: "Comprehensive Legal Strategy",
    defaultFee: 1500,
    country: "United States",
    countryCode: "US",
  },
];

const CONSULTANTS = [
  { name: "Sarah K.", role: "Senior Immigration Specialist", initials: "SK" },
  { name: "Michael B.", role: "Senior Case Manager", initials: "MB" },
  { name: "Elena Rostova", role: "Lead Legal Counsel", initials: "ER" },
  { name: "Alex Patel", role: "Principal Consultant", initials: "AP" },
];

const COUNTRY_DIAL_CODES = [
  { code: "+1", label: "+1 (US & Canada)", flag: "🇺🇸" },
  { code: "+44", label: "+44 (United Kingdom)", flag: "🇬🇧" },
  { code: "+61", label: "+61 (Australia)", flag: "🇦🇺" },
  { code: "+49", label: "+49 (Germany)", flag: "🇩🇪" },
  { code: "+91", label: "+91 (India)", flag: "🇮🇳" },
  { code: "+971", label: "+971 (UAE)", flag: "🇦🇪" },
  { code: "+880", label: "+880 (Bangladesh)", flag: "🇧🇩" },
  { code: "+81", label: "+81 (Japan)", flag: "🇯🇵" },
  { code: "+33", label: "+33 (France)", flag: "🇫🇷" },
  { code: "+65", label: "+65 (Singapore)", flag: "🇸🇬" },
  { code: "+966", label: "+966 (Saudi Arabia)", flag: "🇸🇦" },
  { code: "+353", label: "+353 (Ireland)", flag: "🇮🇪" },
  { code: "+234", label: "+234 (Nigeria)", flag: "🇳🇬" },
  { code: "+27", label: "+27 (South Africa)", flag: "🇿🇦" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
];

function generateRandomCaseId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `#APP-2026-${rand}`;
}

function parsePhoneAndDialCode(rawPhoneOrWhatsapp?: string): { dialCode: string; number: string } {
  if (!rawPhoneOrWhatsapp) return { dialCode: "+1", number: "" };
  const cleaned = rawPhoneOrWhatsapp.trim();
  const sortedCodes = [...COUNTRY_DIAL_CODES].sort((a, b) => b.code.length - a.code.length);
  const matched = sortedCodes.find((c) => cleaned.startsWith(c.code));
  if (matched) {
    const num = cleaned.slice(matched.code.length).trim();
    return { dialCode: matched.code, number: num };
  }
  return { dialCode: "+1", number: cleaned };
}

interface ExistingUserOption {
  id: string;
  source: "client" | "user";
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  passportNumber?: string;
  countryOfOrigin?: string;
  city?: string;
  avatarUrl?: string;
  initials?: string;
  badgeLabel: string;
  existingCaseRef?: string;
  destinationCountry?: string;
  visaCategory?: string;
}

export function CreateClientForm() {
  const router = useRouter();

  // Generated Client Case Identifier
  const [caseIdentifier, setCaseIdentifier] = React.useState<string>("");

  React.useEffect(() => {
    setCaseIdentifier(generateRandomCaseId());
  }, []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdClientId, setCreatedClientId] = React.useState<string | null>(null);

  // Applicant Intake Mode: "new" = brand new applicant, "existing" = pick from registered users/clients
  const [intakeMode, setIntakeMode] = React.useState<"new" | "existing">("new");
  const [selectedExistingUser, setSelectedExistingUser] = React.useState<ExistingUserOption | null>(null);
  const [existingSearchQuery, setExistingSearchQuery] = React.useState<string>("");

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
      destinationCountry: "Canada",
      destinationCode: "CA",
      visaCategory: "Express Entry",
      subCategory: "Federal Skilled Worker",
      assignedConsultant: "Sarah K.",
      status: "Processing",
      currency: "USD",
      baseFee: 4500,
      discountAmount: 0,
      discountReason: "",
      contractedFee: 4500,
      depositAmount: 1500,
      scheduleType: "deposit_2_milestones",
      milestones: [
        {
          id: "m1",
          name: "Milestone 1 — Document Submission",
          dueDate: "2026-10-15",
          amount: 1500,
        },
        {
          id: "m2",
          name: "Milestone 2 — Final Case Adjudication",
          dueDate: "2026-12-01",
          amount: 1500,
        },
      ],
      remindersEnabled: true,
      sendEmailInvitation: true,
      internalNotes: "",
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "milestones",
  });

  // Unified existing users/clients list
  const existingUserOptions = React.useMemo<ExistingUserOption[]>(() => {
    const options: ExistingUserOption[] = [];
    const seenEmails = new Set<string>();

    // 1. From existing clients
    const mockClients = getMockClients();
    mockClients.forEach((c) => {
      if (c.email) seenEmails.add(c.email.toLowerCase());
      options.push({
        id: `client-${c.id}`,
        source: "client",
        name: c.name,
        email: c.email || "",
        phone: c.phone,
        whatsapp: c.whatsapp,
        passportNumber: c.passportNumber,
        countryOfOrigin: c.countryOfOrigin || c.destination?.country,
        city: c.city,
        avatarUrl: c.avatarUrl,
        initials: c.initials,
        badgeLabel: "Existing Client",
        existingCaseRef: c.clientId,
        destinationCountry: c.destination?.country,
        visaCategory: c.visaCategory?.title,
      });
    });

    // 2. From registered portal users
    MOCK_USERS.forEach((u) => {
      if (u.email && !seenEmails.has(u.email.toLowerCase())) {
        seenEmails.add(u.email.toLowerCase());
        options.push({
          id: `user-${u.id}`,
          source: "user",
          name: u.name,
          email: u.email,
          phone: u.phone,
          whatsapp: u.whatsapp,
          avatarUrl: u.avatarUrl,
          initials: u.initials,
          badgeLabel: `Portal User (${u.role})`,
          existingCaseRef: u.userId,
        });
      }
    });

    return options;
  }, []);

  // Filtered existing users based on search input
  const filteredExistingUsers = React.useMemo(() => {
    if (!existingSearchQuery.trim()) {
      return existingUserOptions.slice(0, 6);
    }
    const q = existingSearchQuery.toLowerCase();
    return existingUserOptions.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.whatsapp && u.whatsapp.toLowerCase().includes(q)) ||
        (u.existingCaseRef && u.existingCaseRef.toLowerCase().includes(q)) ||
        (u.passportNumber && u.passportNumber.toLowerCase().includes(q))
    );
  }, [existingUserOptions, existingSearchQuery]);

  const handleSelectExistingUser = (user: ExistingUserOption) => {
    setSelectedExistingUser(user);
    setValue("name", user.name, { shouldValidate: true });
    setValue("email", user.email, { shouldValidate: true });
    if (user.name) {
      const parts = user.name.split(" ");
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
    if (user.passportNumber) {
      setValue("passportNumber", user.passportNumber);
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
        `New case opened for existing client ${user.name} (${user.existingCaseRef || user.email}).`
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
  const watchedVisaCategory = watch("visaCategory");
  const watchedConsultant = watch("assignedConsultant");
  const watchedStatus = watch("status");
  const watchedCurrency = watch("currency");
  const watchedBaseFee = watch("baseFee") || 0;
  const watchedDiscount = watch("discountAmount") || 0;
  const watchedDeposit = watch("depositAmount") || 0;
  const watchedMilestones = watch("milestones") || [];
  const watchedScheduleType = watch("scheduleType");

  // Currency symbol lookup
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
    0
  );
  const totalAllocated = watchedDeposit + totalMilestonesSum;
  const financialDiscrepancy = computedContractedFee - totalAllocated;
  const isMathValid = Math.abs(financialDiscrepancy) < 0.05;

  // Handle schedule type preset selection
  const handleScheduleTypeChange = (type: CreateClientFormValues["scheduleType"]) => {
    setValue("scheduleType", type);
    const fee = computedContractedFee;

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
          name: "Milestone 1 — Document Submission",
          dueDate: "2026-10-15",
          amount: halfRemaining,
        },
        {
          id: "m2",
          name: "Milestone 2 — Final Case Adjudication",
          dueDate: "2026-12-01",
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
          name: "Installment #1 — Month 1 Retainer",
          dueDate: "2026-10-15",
          amount: perMonth,
        },
        {
          id: "m2",
          name: "Installment #2 — Month 2 Retainer",
          dueDate: "2026-11-15",
          amount: perMonth,
        },
        {
          id: "m3",
          name: "Installment #3 — Month 3 Retainer",
          dueDate: "2026-12-15",
          amount: fee - deposit - perMonth * 2,
        },
      ]);
    }
  };

  // Handle selection from official service catalog
  const handleCatalogSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SERVICE_CATALOG.find((s) => s.id === e.target.value);
    if (selected) {
      setValue("visaCategory", selected.title);
      setValue("subCategory", selected.subCategory);
      setValue("destinationCountry", selected.country);
      setValue("destinationCode", selected.countryCode);
      setValue("baseFee", selected.defaultFee);
      setValue("discountAmount", 0);
      setValue("discountReason", "");
      setValue("contractedFee", selected.defaultFee);

      // Re-initialize default milestone breakdown
      const deposit = Math.round(selected.defaultFee * 0.4);
      const remaining = selected.defaultFee - deposit;
      const half = Math.round(remaining / 2);
      setValue("depositAmount", deposit);
      replace([
        {
          id: "m1",
          name: "Milestone 1 — Document Submission",
          dueDate: "2026-10-15",
          amount: half,
        },
        {
          id: "m2",
          name: "Milestone 2 — Final Case Adjudication",
          dueDate: "2026-12-01",
          amount: remaining - half,
        },
      ]);
    }
  };

  // Handle destination country change
  const handleCountryChange = (c: string) => {
    setValue("destinationCountry", c);
    if (c === "Canada") setValue("destinationCode", "CA");
    else if (c === "United Kingdom") setValue("destinationCode", "GB");
    else if (c === "Australia") setValue("destinationCode", "AU");
    else if (c === "Germany") setValue("destinationCode", "DE");
    else if (c === "United States") setValue("destinationCode", "US");
  };

  // Add custom milestone
  const handleAddMilestone = () => {
    const nextIdx = fields.length + 1;
    replace([
      ...watchedMilestones,
      {
        id: `m_${Date.now()}`,
        name: `Milestone ${nextIdx} — Custom Phase`,
        dueDate: "2026-11-01",
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
  const cleanPhone = (watchedCountryCode + watchedWhatsapp).replace(/[^\d+]/g, "");
  const whatsappPreviewUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Hello ${watchedName || "Valued Client"}, welcome to AdSkill Consultancy! Your case ${caseIdentifier || "#APP-2026-••••"} has been opened.`
  )}`;

  // Form submit handler
  const onSubmit = (data: CreateClientFormValues) => {
    setIsSubmitting(true);

    const clientInitials = data.name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newId = Date.now().toString();

    const newClient: ClientItem = {
      id: newId,
      clientId: caseIdentifier || generateRandomCaseId(),
      name: data.name.trim(),
      preferredName: data.preferredName?.trim() || undefined,
      email: data.email.trim(),
      phone: data.phone?.trim() || undefined,
      whatsapp: `${data.countryCode} ${data.whatsappNumber.trim()}`,
      avatarUrl:
        selectedExistingUser?.avatarUrl ||
        `https://images.unsplash.com/photo-${1500000000000 + (parseInt(newId.slice(-4)) || 1000)}?w=150&auto=format&fit=crop&q=80`,
      initials: selectedExistingUser?.initials || clientInitials || "CL",
      destination: {
        code: data.destinationCode,
        country: data.destinationCountry,
      },
      visaCategory: {
        title: data.visaCategory,
        subCategory: data.subCategory,
      },
      submission: {
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        agentName: data.assignedConsultant,
      },
      status: data.status as ClientStatus,
      passportNumber: data.passportNumber?.trim() || undefined,
      city: data.city?.trim() || undefined,
      countryOfOrigin: data.countryOfOrigin?.trim() || undefined,
      currency: data.currency,
      totalFee: data.contractedFee,
      depositAmount: data.depositAmount,
      discountAmount: data.discountAmount,
      discountReason: data.discountReason,
      paidAmount: 0,
      dueAmount: data.contractedFee,
      remindersEnabled: data.remindersEnabled,
      milestones: data.milestones.map((m) => ({
        id: m.id,
        name: m.name,
        dueDate: m.dueDate,
        amount: Number(m.amount) || 0,
      })),
      notes: data.internalNotes?.trim() || undefined,
      activityLogs: [
        {
          id: `log-${Date.now()}-1`,
          action: selectedExistingUser
            ? `New Case Opened for Existing Client (${selectedExistingUser.existingCaseRef})`
            : "Client Case Dossier Initialized",
          target: `${data.visaCategory} (${data.destinationCountry})`,
          timestamp: "Just now",
          agentName: data.assignedConsultant,
        },
        ...(data.sendWelcomeWhatsApp
          ? [
              {
                id: `log-${Date.now()}-2`,
                action: "WhatsApp Welcome Notice Queued",
                target: `${data.countryCode} ${data.whatsappNumber}`,
                timestamp: "Just now",
                agentName: "System",
              },
            ]
          : []),
      ],
    };

    // Store in global mock and local storage
    addMockClient(newClient);
    setCreatedClientId(newId);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.CLIENTS);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6 w-full">
      {/* ── 1. TOP BREADCRUMB & PAGE TITLE BAR (MATCHING CLIENT LIST FULL PAGE HEADER) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#092244] hover:bg-[#FAF8F5] shadow-2xs shrink-0 cursor-pointer"
          >
            <Link href={ROUTES.CLIENTS}>
              <ArrowLeft className="h-5 w-5 text-[#092244]" />
              <span className="sr-only">Back to Client Directory</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
                Onboard New Client Case
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8FF] text-[#0284C7] text-xs font-bold border border-[#BAE6FD]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0284C7]" />
                Intake &amp; Accounting
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <Link
                href={ROUTES.CLIENTS}
                className="hover:text-[#092244] transition-colors"
              >
                Visa Applications
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.CLIENTS}
                className="hover:text-[#092244] transition-colors"
              >
                Application List
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#092244] font-bold">Create Client Case</span>
            </div>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Case Reference ID Card */}
          <div className="flex items-center gap-2.5 bg-white border border-[#EAE6DF] px-4 py-2 rounded-2xl shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] block leading-none">
                Case Reference
              </span>
              <span
                suppressHydrationWarning
                className="font-mono font-black text-sm text-[#092244] mt-0.5 block"
              >
                {caseIdentifier || "#APP-2026-••••"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCaseIdentifier(generateRandomCaseId())}
              title="Generate new Case ID"
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
            <Link href={ROUTES.CLIENTS}>
              <FileText className="h-4 w-4 text-[#64748B]" />
              <span className="hidden sm:inline">View Client List</span>
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
                Client Case Successfully Onboarded!
              </div>
              <p className="text-xs text-[#047857] mt-0.5">
                Case dossier {caseIdentifier} initialized with milestone schedule. Redirecting to Application List...
              </p>
            </div>
          </div>
          {createdClientId && (
            <Link
              href={`/clients/${createdClientId}`}
              className="text-xs font-bold text-[#065F46] underline hover:text-[#047857] px-3 py-1.5 rounded-xl bg-white/60"
            >
              Open Dossier Immediately &rarr;
            </Link>
          )}
        </div>
      )}

      {/* ── 3. MAIN FULL-WIDTH CONTAINER (MATCHING CLIENT LIST TABLE CONTAINER) ── */}
      <div className="rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-8">
        {/* Table Top Header Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE6]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] px-3.5 py-1.5 rounded-xl shadow-2xs">
              {selectedExistingUser
                ? "EXISTING CLIENT DOSSIER"
                : intakeMode === "existing"
                ? "EXISTING USER LOOKUP"
                : "NEW APPLICANT DOSSIER"}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              {selectedExistingUser
                ? `Opening new case for ${selectedExistingUser.name} (${selectedExistingUser.existingCaseRef})`
                : "Deterministic Case Profile & Financial Ledger Initialization"}
            </span>
          </div>

          {/* Quick Template Selector */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-extrabold text-[#64748B] hidden md:inline">
              Fast Catalog Fill:
            </span>
            <div className="relative">
              <select
                onChange={handleCatalogSelect}
                defaultValue=""
                className="h-10 pl-3 pr-8 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] shadow-2xs cursor-pointer"
              >
                <option value="" disabled>
                  Load Service Catalog Preset...
                </option>
                {SERVICE_CATALOG.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.country} — ${s.defaultFee.toLocaleString()})
                  </option>
                ))}
              </select>
              <Sparkles className="h-3.5 w-3.5 text-[#F3A712] absolute right-2.5 top-3.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* ── THE FORM ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1: APPLICANT PERSONAL IDENTITY */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] shadow-2xs">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                    1. Applicant Identity &amp; Credentials
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    Legal full identity, passport credentials, and contact details
                  </p>
                </div>
              </div>

              {/* Applicant Intake Source Toggle */}
              <div className="inline-flex rounded-2xl bg-[#FAF8F5] p-1 border border-[#EAE6DF] shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handleSwitchIntakeMode("new")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    intakeMode === "new"
                      ? "bg-[#092244] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#092244]"
                  )}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  New Applicant
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchIntakeMode("existing")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    intakeMode === "existing"
                      ? "bg-[#092244] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#092244]"
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  Existing User / Client
                </button>
              </div>
            </div>

            {/* EXISTING USER / CLIENT PICKER PANEL */}
            {intakeMode === "existing" && (
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {!selectedExistingUser ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#092244] block">
                          Select Existing User or Client Record
                        </span>
                        <p className="text-xs text-[#64748B]">
                          Search among registered portal clients and users to open a new case for them without re-entering their data.
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-[#64748B] bg-white border border-[#EAE6DF] px-2.5 py-1 rounded-xl self-start sm:self-auto">
                        {existingUserOptions.length} Existing Profiles Available
                      </span>
                    </div>

                    {/* Search input */}
                    <div className="relative">
                      <Search className="h-4 w-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                      <Input
                        value={existingSearchQuery}
                        onChange={(e) => setExistingSearchQuery(e.target.value)}
                        placeholder="Search by client name, email, phone, passport, or case ID (#APP-2026-...)"
                        className="h-11 pl-10 pr-4 rounded-xl bg-white border-[#EAE6DF] text-xs font-medium text-[#092244]"
                      />
                      {existingSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setExistingSearchQuery("")}
                          className="absolute right-3 top-3 p-0.5 rounded-lg hover:bg-[#FAF8F5] text-[#94A3B8] hover:text-[#092244]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Results list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {filteredExistingUsers.length > 0 ? (
                        filteredExistingUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleSelectExistingUser(user)}
                            className="p-3 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#092244] hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group"
                          >
                            <div className="h-9 w-9 rounded-xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF] font-extrabold text-xs flex items-center justify-center shrink-0 group-hover:bg-[#092244] group-hover:text-white transition-colors">
                              {user.initials || user.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-[#092244] truncate block">
                                  {user.name}
                                </span>
                                <span className="text-[10px] font-extrabold text-[#64748B] bg-[#FAF8F5] px-1.5 py-0.5 rounded-md shrink-0">
                                  {user.existingCaseRef || "Portal User"}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#64748B] truncate block">
                                {user.email || user.phone || "No contact info"}
                              </span>
                              {user.countryOfOrigin && (
                                <span className="text-[10px] text-[#94A3B8] font-medium block mt-0.5">
                                  Origin: {user.countryOfOrigin}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-6 text-center text-xs text-[#94A3B8] bg-white rounded-xl border border-dashed border-[#EAE6DF]">
                          No existing clients or users matched &ldquo;{existingSearchQuery}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Active Linked User Banner */
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#A7F3D0] shadow-2xs">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-black text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        <UserCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-[#092244]">
                            {selectedExistingUser.name}
                          </span>
                          <span className="text-[10px] font-extrabold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-md">
                            Existing Profile Linked
                          </span>
                          {selectedExistingUser.existingCaseRef && (
                            <span className="text-[10px] font-mono font-bold text-[#64748B] bg-[#FAF8F5] border border-[#EAE6DF] px-2 py-0.5 rounded-md">
                              Prior: {selectedExistingUser.existingCaseRef}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {selectedExistingUser.email}
                          {selectedExistingUser.phone && ` • ${selectedExistingUser.phone}`}
                          {selectedExistingUser.passportNumber && ` • Passport: ${selectedExistingUser.passportNumber}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearExistingUser}
                        className="h-9 px-3 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        Change User
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSwitchIntakeMode("new")}
                        className="h-9 px-3 rounded-xl border-[#EAE6DF] text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                      >
                        Detach / New Applicant
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Full Legal Name *</span>
                  {errors.name && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.name.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Maya Elizabeth Lin"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Preferred Name / Alias
                </label>
                <Input
                  {...register("preferredName")}
                  placeholder="e.g. Maya"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Passport Identifier
                </label>
                <Input
                  {...register("passportNumber")}
                  placeholder="e.g. M9821034"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#092244]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Primary Email Address *</span>
                  {errors.email && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.email.message}
                    </span>
                  )}
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="maya.lin@example.com"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Direct Telephone
                </label>
                <Input
                  {...register("phone")}
                  placeholder="+1 (416) 555-0188"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  City / Residence
                </label>
                <Input
                  {...register("city")}
                  placeholder="e.g. Toronto"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: WHATSAPP DIRECT CHANNEL */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] shadow-2xs">
                <MessageCircle className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                  2. WhatsApp Channel &amp; Country Code Selector
                </h3>
                <p className="text-xs text-[#64748B]">
                  Direct mobile line for automated payment reminders, milestone invoices, and document alerts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Country Dial Code *
                </label>
                <select
                  {...register("countryCode")}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  {COUNTRY_DIAL_CODES.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-7 space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>WhatsApp Mobile Number *</span>
                  {errors.whatsappNumber && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.whatsappNumber.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("whatsappNumber")}
                  placeholder="4165550188"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#059669]"
                />
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>
                    Formatted:{" "}
                    <strong className="text-[#092244]">
                      {watchedCountryCode} {watchedWhatsapp || "XXXXXXXXXX"}
                    </strong>
                  </span>
                  {watchedWhatsapp.length >= 6 && (
                    <a
                      href={whatsappPreviewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#059669] hover:underline font-bold flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Test wa.me link
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Live Message Dispatch Bubble */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageCircle className="h-4.5 w-4.5 fill-current" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#092244] block">
                    Welcome &amp; Case Opening Automated Template
                  </span>
                  <p className="text-xs text-[#065F46] font-medium font-mono mt-0.5">
                    "👋 Hello {watchedName || "[Client Name]"}, welcome to AdSkill! Your case has been registered under {caseIdentifier || "#APP-2026-••••"}."
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-extrabold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-xl shrink-0">
                Ready to Dispatch
              </span>
            </div>
          </div>

          {/* SECTION 3: IMMIGRATION CASE DETAILS */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EBF8FF] text-[#0284C7] border border-[#BAE6FD] shadow-2xs">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                  3. Case Jurisdiction &amp; Visa Destination
                </h3>
                <p className="text-xs text-[#64748B]">
                  Destination legal jurisdiction, visa stream, and assigned staff member
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Destination Country *
                </label>
                <select
                  value={watchedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  <option value="Canada">🇨🇦 Canada (CA)</option>
                  <option value="United States">🇺🇸 United States (US)</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom (GB)</option>
                  <option value="Australia">🇦🇺 Australia (AU)</option>
                  <option value="Germany">🇩🇪 Germany (DE)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Visa Category *</span>
                  {errors.visaCategory && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.visaCategory.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("visaCategory")}
                  placeholder="e.g. Express Entry, EB-2 NIW"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Sub-Category / Stream
                </label>
                <Input
                  {...register("subCategory")}
                  placeholder="e.g. Federal Skilled Worker"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Initial Case Status
                </label>
                <select
                  {...register("status")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  <option value="Processing">Processing (Initial Intake)</option>
                  <option value="Under Review">Under Review (Legal Audit)</option>
                  <option value="Missing Docs">Missing Docs (Action Required)</option>
                  <option value="Approved">Approved (Adjudicated)</option>
                  <option value="Delayed">Delayed (Embassy Backlog)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Assigned Consultant / Case Manager *
                </label>
                <select
                  {...register("assignedConsultant")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                >
                  {CONSULTANTS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} — {c.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Target Submission Date
                </label>
                <Input
                  type="date"
                  {...register("targetSubmissionDate")}
                  defaultValue="2026-10-30"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: FINANCIAL SETUP & PAYMENT MILESTONE SCHEDULE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] shadow-2xs">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                  4. Professional Fees &amp; Milestone Payment Plan (Section 6 &amp; 8)
                </h3>
                <p className="text-xs text-[#64748B]">
                  Contracted professional fees, discounts with required justification, and installment schedule
                </p>
              </div>
            </div>

            {/* Fee Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Currency
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

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Base Service Fee ({currencySymbol}) *
                </label>
                <Input
                  type="number"
                  {...register("baseFee", { valueAsNumber: true })}
                  placeholder="4500"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#092244]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Discount Amount ({currencySymbol})
                </label>
                <Input
                  type="number"
                  {...register("discountAmount", { valueAsNumber: true })}
                  placeholder="0"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#B45309]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#092244]">
                  Contracted Fee ({currencySymbol})
                </label>
                <div className="h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center font-mono font-black text-sm text-[#092244]">
                  {currencySymbol}
                  {computedContractedFee.toLocaleString()}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#059669]">
                  Retainer Deposit ({currencySymbol}) *
                </label>
                <Input
                  type="number"
                  {...register("depositAmount", { valueAsNumber: true })}
                  placeholder="1500"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#059669]"
                />
              </div>
            </div>

            {/* Mandatory Discount Rationale (shown when discount > 0) */}
            {watchedDiscount > 0 && (
              <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-black uppercase tracking-wider text-[#92400E] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Percent className="h-4 w-4" />
                    Mandatory Discount Justification *
                  </span>
                  {errors.discountReason && (
                    <span className="text-rose-600 font-bold normal-case text-xs">
                      {errors.discountReason.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("discountReason")}
                  placeholder="e.g. Partner referral promotion or family package concession"
                  className="h-10 rounded-xl bg-white border-[#FDE68A] text-xs font-semibold text-[#092244]"
                />
                <p className="text-[11px] text-[#92400E]">
                  Section 6 Governance: Every fee deduction requires a recorded rationale in the company audit trail.
                </p>
              </div>
            )}

            {/* Installment Milestone Schedule Setup */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#092244] block">
                    Installment Milestone Breakdown
                  </span>
                  <p className="text-[11px] text-[#64748B]">
                    Configure milestone dates and amounts totaling{" "}
                    <strong className="text-[#092244]">
                      {currencySymbol}
                      {computedContractedFee.toLocaleString()}
                    </strong>
                  </p>
                </div>

                {/* Preset Buttons */}
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#EAE6DF]">
                  <button
                    type="button"
                    onClick={() => handleScheduleTypeChange("deposit_2_milestones")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      watchedScheduleType === "deposit_2_milestones"
                        ? "bg-[#092244] text-white shadow-2xs"
                        : "text-[#64748B] hover:text-[#092244]"
                    }`}
                  >
                    Deposit + 2 Milestones
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScheduleTypeChange("deposit_3_monthly")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      watchedScheduleType === "deposit_3_monthly"
                        ? "bg-[#092244] text-white shadow-2xs"
                        : "text-[#64748B] hover:text-[#092244]"
                    }`}
                  >
                    Deposit + 3 Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScheduleTypeChange("single")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      watchedScheduleType === "single"
                        ? "bg-[#092244] text-white shadow-2xs"
                        : "text-[#64748B] hover:text-[#092244]"
                    }`}
                  >
                    100% Full Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("scheduleType", "custom")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      watchedScheduleType === "custom"
                        ? "bg-[#092244] text-white shadow-2xs"
                        : "text-[#64748B] hover:text-[#092244]"
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Milestone Items */}
              {fields.length > 0 && (
                <div className="space-y-2 border border-[#EAE6DF] rounded-2xl p-3 bg-[#FAF8F5]/60">
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-white p-3 rounded-xl border border-[#EAE6DF] shadow-2xs"
                    >
                      <div className="sm:col-span-1 text-center font-mono font-black text-xs text-[#94A3B8]">
                        #{idx + 1}
                      </div>
                      <div className="sm:col-span-6">
                        <input
                          {...register(`milestones.${idx}.name` as const)}
                          placeholder="Milestone title"
                          className="w-full h-10 px-3 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="date"
                          {...register(`milestones.${idx}.dueDate` as const)}
                          className="w-full h-10 px-3 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-xs text-[#94A3B8] font-mono">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            {...register(`milestones.${idx}.amount` as const, {
                              valueAsNumber: true,
                            })}
                            placeholder="Amount"
                            className="w-full h-10 pl-7 pr-3 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-mono font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="text-[#94A3B8] hover:text-rose-600 transition-colors p-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMilestone}
                    className="w-full h-10 rounded-xl border-dashed border-[#CBD5E1] text-xs font-bold text-[#092244] hover:bg-white gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Custom Milestone Installment
                  </Button>
                </div>
              )}

              {/* Mathematical Integrity Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold ${
                  isMathValid
                    ? "bg-[#ECFDF5] border-[#059669]/30 text-[#065F46]"
                    : "bg-[#FFF1F2] border-[#E11D48]/30 text-[#9F1239]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isMathValid ? (
                    <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[#E11D48] shrink-0" />
                  )}
                  <span>
                    {isMathValid
                      ? `Mathematical Integrity Verified: Deposit (${currencySymbol}${watchedDeposit.toLocaleString()}) + Milestones (${currencySymbol}${totalMilestonesSum.toLocaleString()}) = Contracted Fee (${currencySymbol}${computedContractedFee.toLocaleString()})`
                      : `Mathematical Discrepancy: Total scheduled is ${currencySymbol}${totalAllocated.toLocaleString()}, difference of ${currencySymbol}${Math.abs(financialDiscrepancy).toLocaleString()} from contracted fee (${currencySymbol}${computedContractedFee.toLocaleString()})`}
                  </span>
                </div>
                <span className="font-mono font-black px-2.5 py-1 rounded-lg bg-white/70 self-start sm:self-auto shrink-0">
                  {isMathValid ? "BALANCED ✓" : "UNBALANCED ⚠"}
                </span>
              </div>

              {/* Section 5 Disclaimer */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#64748B] flex items-start gap-3">
                <Info className="h-4.5 w-4.5 text-[#092244] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#092244]">Section 5 Accounting Separation Rule:</strong>{" "}
                  AdSkill professional fees cover dedicated casework, consulting, and application preparation. Third-party filing fees (e.g. USCIS, IRCC, UKVI) and certified translations are strictly separated and are not recognized as company revenue.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 5: ONBOARDING DISPATCH & INTERNAL NOTES */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF] shadow-2xs">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#092244]">
                  5. Onboarding Preferences &amp; Case Notes
                </h3>
                <p className="text-xs text-[#64748B]">
                  Client communication preferences and confidential internal intake notes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                <input
                  type="checkbox"
                  {...register("sendWelcomeWhatsApp")}
                  className="h-4 w-4 rounded text-[#092244] focus:ring-[#092244] mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#092244] block">
                    WhatsApp Welcome Notice
                  </span>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Dispatches Case ID and portal link to {watchedCountryCode} {watchedWhatsapp || "mobile"}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                <input
                  type="checkbox"
                  {...register("sendEmailInvitation")}
                  className="h-4 w-4 rounded text-[#092244] focus:ring-[#092244] mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#092244] block">
                    Email Portal Invitation
                  </span>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Sends private client login credential invitation to {watchedEmail || "email"}
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                <input
                  type="checkbox"
                  {...register("remindersEnabled")}
                  className="h-4 w-4 rounded text-[#092244] focus:ring-[#092244] mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-bold text-[#092244] block">
                    Automated Payment Reminders
                  </span>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Reminders 7 days and 3 days before due dates; halts instantly once paid
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                <span>Internal Staff Notes &amp; Legal Strategy</span>
                <span className="text-[10px] text-[#94A3B8] font-bold">
                  Confidential — Hidden from Client Portal
                </span>
              </label>
              <textarea
                {...register("internalNotes")}
                rows={3}
                placeholder="e.g. Client preparing academic credential evaluation from WES. Petition drafting assigned to Sarah K."
                className="w-full p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244] placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          {/* ── BOTTOM ACTIONS TOOLBAR (MATCHING MODAL & TABLE FOOTER) ── */}
          <div className="pt-6 border-t border-[#F0ECE6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
              <ShieldCheck className="h-4 w-4 text-[#059669]" />
              <span>
                Case {caseIdentifier || "#APP-2026-••••"} •{" "}
                <strong className="text-[#092244]">
                  {currencySymbol}
                  {computedContractedFee.toLocaleString()} Total Contracted
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 rounded-2xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Link href={ROUTES.CLIENTS}>Cancel &amp; Return</Link>
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || !isMathValid}
                className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-[#092244] text-white hover:bg-[#071933] shadow-[0_4px_16px_rgba(9,34,68,0.2)] text-xs font-bold cursor-pointer gap-2 transition-all disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4 text-[#F3A712]" />
                <span>
                  {isSubmitting
                    ? "Onboarding Client Case..."
                    : selectedExistingUser
                    ? "Add Case for Existing Client"
                    : "Save & Open Case"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
