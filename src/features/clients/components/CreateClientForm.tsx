"use client";

import { Button as CommonButton } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useGetServicesQuery } from "@/services/api/services/servicesApi";
import { useGetUsersQuery } from "@/services/api/users/usersApi";
import { useCreateClientCaseMutation, useUpdateClientCaseMutation } from "@/services/api/clients/clientCasesApi";
import { useCreatePaymentPlanMutation } from "@/services/api/payment-plans/paymentPlansApi";
import {
  createClientSchema,
  type CreateClientFormValues,
} from "@/validations/client.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  FileText,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
  Users,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";

const COUNTRY_DIAL_CODES = [
  { code: "+1", label: "+1 (US & Canada)" },
  { code: "+44", label: "+44 (United Kingdom)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+91", label: "+91 (India)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+880", label: "+880 (Bangladesh)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+966", label: "+966 (Saudi Arabia)" },
  { code: "+353", label: "+353 (Ireland)" },
  { code: "+234", label: "+234 (Nigeria)" },
  { code: "+27", label: "+27 (South Africa)" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "CAD", symbol: "C$", label: "CAD (C$)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "AUD", symbol: "A$", label: "AUD (A$)" },
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

  // Unified existing users list with Live usersApi integration
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
        `New case opened for registered portal client ${user.name} (${user.existingCaseRef || user.email}).`,
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
          name: "Milestone 1 - Document Submission",
          dueDate: m1Date,
          amount: halfRemaining,
        },
        {
          id: "m2",
          name: "Milestone 2 - Final Case Adjudication",
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
          name: "Installment #1 - Month 1 Retainer",
          dueDate: m1Date,
          amount: perMonth,
        },
        {
          id: "m2",
          name: "Installment #2 - Month 2 Retainer",
          dueDate: m2Date,
          amount: perMonth,
        },
        {
          id: "m3",
          name: "Installment #3 - Month 3 Retainer",
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
          name: `Milestone ${i} - Phase Deliverable`,
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
    if (c === "Canada") setValue("destinationCode", "CA");
    else if (c === "United Kingdom") setValue("destinationCode", "GB");
    else if (c === "Australia") setValue("destinationCode", "AU");
    else if (c === "Germany") setValue("destinationCode", "DE");
    else setValue("destinationCode", "US");
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
        name: `Milestone ${nextIdx} - Custom Phase`,
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
    `Hello ${watchedName || "Valued Client"}, welcome to AdSkill Consultancy. Your new case is being opened.`,
  )}`;

  // Submit Handler
  const onSubmit = async (data: CreateClientFormValues) => {
    if (!data.serviceId) {
      setErrorNotice("Please select an active service from the catalog before proceeding.");
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
            title: "Initial Retainer / Deposit",
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
            title: "Full Contracted Fee",
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

  return (
    <div className="space-y-6 w-full">
      {/* 1. TOP BREADCRUMB & PAGE TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <CommonButton
            asChild
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-2xl bg-white border border-[#EAE6DF] text-[#0a0a0a] hover:bg-[#FAF8F5] shadow-2xs shrink-0 cursor-pointer">
            <Link href={ROUTES.CLIENTS}>
              <ArrowLeft className="h-5 w-5 text-[#0a0a0a]" />
              <span className="sr-only">Back to Client Directory</span>
            </Link>
          </CommonButton>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] tracking-tight">
                Onboard New Client Case
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF8FF] text-[#0284C7] text-xs font-bold border border-[#BAE6FD]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0284C7]" />
                Live Database Connected
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <Link
                href={ROUTES.CLIENTS}
                className="hover:text-[#0a0a0a] transition-colors">
                Visa Applications
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.CLIENTS}
                className="hover:text-[#0a0a0a] transition-colors">
                Application List
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#0a0a0a] font-bold">
                Create Client Case
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Header Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2.5 bg-white border border-[#EAE6DF] px-4 py-2 rounded-2xl shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] block leading-none">
                Case Reference
              </span>
              <span
                suppressHydrationWarning
                className="font-mono font-black text-sm text-[#0a0a0a] mt-0.5 block">
                {caseIdentifier || "Generated after save"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {errorNotice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Database / Submission Error
            </h4>
            <p className="text-xs text-rose-700">{errorNotice}</p>
          </div>
        </div>
      )}

      {/* 2. SUCCESS NOTICE */}
      {isSuccess && (
        <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-[#059669] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-[#065F46]">
                Client Case Successfully Onboarded!
              </h4>
              <p className="text-xs text-[#047857]">
                Assigned Case Reference:{" "}
                <span className="font-mono font-bold">{caseIdentifier}</span>. Redirecting to dossier...
              </p>
            </div>
          </div>
          {createdClientId && (
            <Link
              href={`/clients/${createdClientId}`}
              className="text-xs font-bold text-[#065F46] underline hover:text-[#047857] px-3 py-1.5 rounded-xl bg-white/60">
              Open Dossier Immediately &rarr;
            </Link>
          )}
        </div>
      )}

      {/* 3. MAIN FORM CONTAINER */}
      <div className="rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white p-6 sm:p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-8">
        {/* Table Top Header Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE6]">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold tracking-wider uppercase bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF] px-3.5 py-1.5 rounded-xl shadow-2xs">
              {selectedExistingUser
                ? "EXISTING CLIENT DOSSIER"
                : intakeMode === "existing"
                  ? "EXISTING USER LOOKUP"
                  : "NEW APPLICANT DOSSIER"}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">
              {selectedExistingUser
                ? `Opening new case for ${selectedExistingUser.name} (${selectedExistingUser.existingCaseRef})`
                : ""}
            </span>
          </div>
        </div>

        {/* THE FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* SECTION 1: APPLICANT PERSONAL IDENTITY */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF] shadow-2xs">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#0a0a0a]">
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
                      ? "bg-[#0a0a0a] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0a0a0a]",
                  )}>
                  <UserPlus className="h-3.5 w-3.5" />
                  New Applicant
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchIntakeMode("existing")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    intakeMode === "existing"
                      ? "bg-[#0a0a0a] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#0a0a0a]",
                  )}>
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a] block">
                            Select Existing User or Client Record
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#059669] text-[10px] font-bold border border-[#A7F3D0]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            Live Database Users ({existingUserOptions.length})
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          Search among registered clients to open a new case without re-entering data.
                        </p>
                      </div>
                    </div>

                    {/* Filter Category Tabs & Search input */}
                    <div className="relative">
                      <Search className="h-4 w-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                      <Input
                        value={existingSearchQuery}
                        onChange={(e) => setExistingSearchQuery(e.target.value)}
                        placeholder="Search by name, email, phone, or reference ID..."
                        className="h-11 pl-10 pr-9 rounded-xl bg-white border-[#EAE6DF] text-xs font-medium text-[#0a0a0a]"
                      />
                      {existingSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setExistingSearchQuery("")}
                          className="absolute right-3 top-3 p-0.5 rounded-lg hover:bg-[#FAF8F5] text-[#94A3B8] hover:text-[#0a0a0a]">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Users list */}
                    {isUsersLoading ? (
                      <div className="p-6 text-center text-xs text-[#64748B]">
                        Loading registered users from database...
                      </div>
                    ) : filteredExistingUsers.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#64748B] bg-white rounded-xl border border-dashed border-[#EAE6DF]">
                        No registered users found matching your search.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                        {filteredExistingUsers.map((user) => (
                          <div
                            key={user.id}
                            onClick={() => handleSelectExistingUser(user)}
                            className="p-3.5 rounded-xl bg-white border border-[#EAE6DF] hover:border-[#0a0a0a] hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 group">
                            <div className="h-9 w-9 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-center justify-center font-bold text-xs text-[#0a0a0a] shrink-0 group-hover:bg-[#0a0a0a] group-hover:text-white transition-colors">
                              {user.initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-[#0a0a0a] truncate block">
                                  {user.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold text-[#64748B] shrink-0">
                                  {user.role}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#64748B] truncate block">
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="text-[10px] text-[#94A3B8] block">
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#0a0a0a] shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center font-bold text-sm">
                        {selectedExistingUser.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#0a0a0a]">
                            {selectedExistingUser.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE6DF] text-[10px] font-bold text-[#64748B]">
                            {selectedExistingUser.role}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B]">
                          {selectedExistingUser.email}
                          {selectedExistingUser.phone && ` • ${selectedExistingUser.phone}`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearExistingUser}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors">
                      Change Selection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Applicant Details Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
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
                  placeholder="e.g. Eleanor Vance"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Preferred Name
                </label>
                <Input
                  {...register("preferredName")}
                  placeholder="e.g. Ellie"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Email Address *</span>
                  {errors.email && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.email.message}
                    </span>
                  )}
                </label>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="e.g. eleanor.vance@example.com"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Primary Phone
                </label>
                <Input
                  {...register("phone")}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Passport / Gov ID Number
                </label>
                <Input
                  {...register("passportNumber")}
                  placeholder="e.g. A9281940"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Country of Origin
                </label>
                <Input
                  {...register("countryOfOrigin")}
                  placeholder="e.g. United Kingdom"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
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
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0a0a0a]">
                  2. WhatsApp Communication Channel
                </h3>
                <p className="text-xs text-[#64748B]">
                  Direct client messaging channel &amp; automated notification dispatch
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Country Dial Code
                </label>
                <select
                  {...register("countryCode")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]">
                  {COUNTRY_DIAL_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>WhatsApp Mobile Number *</span>
                  {errors.whatsappNumber && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.whatsappNumber.message}
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <Input
                    {...register("whatsappNumber")}
                    placeholder="e.g. 5551234567"
                    className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a] flex-1"
                  />
                  {watchedWhatsapp && (
                    <a
                      href={whatsappPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#128C7E] hover:bg-[#25D366]/20 flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Test Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: SERVICE CATALOG & CASE JURISDICTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#EBF8FF] text-[#0284C7] border border-[#BAE6FD] shadow-2xs">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0a0a0a]">
                  3. Service Selection &amp; Case Jurisdiction
                </h3>
                <p className="text-xs text-[#64748B]">
                  Select an active offering from the service catalog to populate legal category and standard pricing
                </p>
              </div>
            </div>

            {/* SERVICE SELECTION DROPDOWN */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a] flex items-center justify-between">
                <span>Select Offering from Active Service Catalog *</span>
                {errors.serviceId && (
                  <span className="text-rose-500 font-bold normal-case text-[11px]">
                    {errors.serviceId.message}
                  </span>
                )}
              </label>
              {isServicesLoading ? (
                <div className="text-xs text-[#64748B] py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#0a0a0a]" />
                  Loading active services from database...
                </div>
              ) : (
                <select
                  value={watchedServiceId}
                  onChange={(e) => handleServiceSelect(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-white border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a] shadow-2xs cursor-pointer">
                  <option value="">-- Choose a Service Offering from Database --</option>
                  {services.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {`${s.name} (${s.code}) • Base Fee: $${Number(s.baseFee || 0).toLocaleString()} ${s.currency || "USD"}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Destination Country *
                </label>
                <select
                  value={watchedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]">
                  <option value="United States">United States (US)</option>
                  <option value="Canada">Canada (CA)</option>
                  <option value="United Kingdom">United Kingdom (GB)</option>
                  <option value="Australia">Australia (AU)</option>
                  <option value="Germany">Germany (DE)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Visa Category / Service Name *</span>
                  {errors.visaCategory && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.visaCategory.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("visaCategory")}
                  placeholder="Auto-filled from service..."
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Sub-Category / Stream
                </label>
                <Input
                  {...register("subCategory")}
                  placeholder="e.g. IMMIGRATION"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Initial Case Status
                </label>
                <select
                  {...register("status")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]">
                  <option value="INTAKE">Intake (Initial review)</option>
                  <option value="ACTIVE">Active (In progress)</option>
                  <option value="ON_HOLD">On hold (Action required)</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Assigned Consultant / Staff Member
                </label>
                <select
                  value={watch("assignedConsultantId") || ""}
                  onChange={(e) => handleConsultantChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]">
                  <option value="">-- Unassigned --</option>
                  {staffConsultants.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {`${staff.name} (${staff.role?.name || "Staff"}) - ${staff.email}`}
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
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: FINANCIAL SETUP & PAYMENT MILESTONES */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] shadow-2xs">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0a0a0a]">
                  4. Professional Fees &amp; Milestone Payment Plan
                </h3>
                <p className="text-xs text-[#64748B]">
                  Base fee, approved discount deductions, upfront deposit, and milestone payment schedules
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Currency
                </label>
                <select
                  {...register("currency")}
                  className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]">
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Base Professional Fee ({currencySymbol}) *
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("baseFee", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Upfront Retainer / Deposit ({currencySymbol})
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("depositAmount", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>
            </div>

            {/* Discount Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Discount Amount ({currencySymbol})</span>
                  {errors.discountAmount && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.discountAmount.message}
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register("discountAmount", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                  <span>Discount Reason / Justification</span>
                  {errors.discountReason && (
                    <span className="text-rose-500 font-bold normal-case text-[11px]">
                      {errors.discountReason.message}
                    </span>
                  )}
                </label>
                <Input
                  {...register("discountReason")}
                  placeholder="Mandatory if discount is applied"
                  className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a]"
                />
              </div>
            </div>

            {/* Schedule Type Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] block">
                Payment Schedule Structure
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { id: "single", title: "Single Payment", desc: "100% upfront deposit" },
                  { id: "deposit_2_milestones", title: "Deposit + 2 Milestones", desc: "40% deposit, 2 equal phases" },
                  { id: "deposit_3_monthly", title: "Deposit + 3 Monthly", desc: "34% deposit, 3 monthly payments" },
                  { id: "custom", title: "Custom Milestones", desc: "Manually customized" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleScheduleTypeChange(st.id as any)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer",
                      watchedScheduleType === st.id
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-xs"
                        : "bg-[#FAF8F5] text-[#0a0a0a] border-[#EAE6DF] hover:border-[#0a0a0a]",
                    )}>
                    <span className="text-xs font-bold block">{st.title}</span>
                    <span
                      className={cn(
                        "text-[10px] mt-0.5 block",
                        watchedScheduleType === st.id ? "text-white/70" : "text-[#64748B]",
                      )}>
                      {st.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Milestones Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#0a0a0a]">
                  Subsequent Installment Milestones
                </span>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] hover:bg-[#EAE6DF] transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  Add Milestone
                </button>
              </div>

              {fields.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-dashed border-[#EAE6DF] text-center text-xs text-[#64748B]">
                  No separate milestones added (100% upfront deposit).
                </div>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-white border border-[#EAE6DF] flex items-center justify-center font-bold text-xs text-[#0a0a0a] shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <Input
                          {...register(`milestones.${idx}.name` as const)}
                          placeholder="Milestone title"
                          className="h-9 rounded-lg bg-white border-[#EAE6DF] text-xs font-semibold"
                        />
                      </div>
                      <div className="w-full sm:w-36">
                        <Input
                          type="date"
                          {...register(`milestones.${idx}.dueDate` as const)}
                          className="h-9 rounded-lg bg-white border-[#EAE6DF] text-xs font-semibold"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <Input
                          type="number"
                          step="any"
                          {...register(`milestones.${idx}.amount` as const, {
                            valueAsNumber: true,
                          })}
                          placeholder="0.00"
                          className="h-9 rounded-lg bg-white border-[#EAE6DF] text-xs font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="p-2 rounded-lg text-[#94A3B8] hover:text-rose-600 hover:bg-rose-50 transition-colors self-end sm:self-center">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Health & Integrity Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase tracking-wider">
                    Contracted Fee
                  </span>
                  <span className="text-sm font-black text-[#0a0a0a]">
                    {currencySymbol}{computedContractedFee.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase tracking-wider">
                    Deposit
                  </span>
                  <span className="text-sm font-black text-[#0a0a0a]">
                    {currencySymbol}{watchedDeposit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase tracking-wider">
                    Milestones Total
                  </span>
                  <span className="text-sm font-black text-[#0a0a0a]">
                    {currencySymbol}{totalMilestonesSum.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block text-[10px] font-bold uppercase tracking-wider">
                    Total Allocated
                  </span>
                  <span className="text-sm font-black text-[#0a0a0a]">
                    {currencySymbol}{totalAllocated.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isMathValid ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#059669] text-xs font-bold border border-[#A7F3D0]">
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    Perfect Balance ($0 discrepancy)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Difference: {currencySymbol}{Math.abs(financialDiscrepancy).toLocaleString()} ({financialDiscrepancy > 0 ? "Under-allocated" : "Over-allocated"})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: INTERNAL NOTES */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#F0ECE6]">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF] shadow-2xs">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0a0a0a]">
                  5. Internal Case Notes
                </h3>
                <p className="text-xs text-[#64748B]">
                  Staff records, intake background, and special client instructions
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Confidential Case Notes (Staff &amp; Client Viewable)
              </label>
              <textarea
                {...register("internalNotes")}
                rows={3}
                placeholder="Add intake observations, documentation status, or specific instructions..."
                className="w-full p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
              />
            </div>
          </div>

          {/* SUBMISSION FOOTER */}
          <div className="pt-4 border-t border-[#F0ECE6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#64748B]">
              Ready to onboard case into active registry and configure ledger schedules.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <CommonButton
                asChild
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none h-12 px-6 rounded-2xl border border-[#EAE6DF] text-[#0a0a0a] hover:bg-[#FAF8F5] text-xs font-bold">
                <Link href={ROUTES.CLIENTS}>Cancel</Link>
              </CommonButton>

              <CommonButton
                type="submit"
                disabled={isSubmitting || !isMathValid}
                className="flex-1 sm:flex-none h-12 px-8 rounded-2xl bg-[#0a0a0a] text-white hover:bg-[#262626] text-xs font-bold shadow-md cursor-pointer disabled:opacity-50">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Creating Case &amp; Schedules...
                  </span>
                ) : (
                  "Onboard & Authorize Payment Plan"
                )}
              </CommonButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
