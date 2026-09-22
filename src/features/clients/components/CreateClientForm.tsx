"use client";

import { Button as CommonButton } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Skeleton } from "@/components/common/Skeleton";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useGetServicesQuery } from "@/services/api/services/servicesApi";
import { useGetUsersQuery, useCreateUserMutation } from "@/services/api/users/usersApi";
import {
  useCreateClientCaseMutation,
  useUpdateClientCaseMutation,
} from "@/services/api/clients/clientCasesApi";
import { useCreatePaymentPlanMutation } from "@/services/api/payment-plans/paymentPlansApi";
import { useCreatePaymentMutation } from "@/services/api/payments/paymentsApi";
import { useUploadCaseDocumentsMutation } from "@/services/api/documents/documentsApi";
import {
  createClientSchema,
  type CreateClientFormValues,
} from "@/validations/client.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { usePermissions } from "@/hooks/usePermissions";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Lock,
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

const parseSafeIsoDate = (d?: string) => {
  if (!d) return new Date().toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const DEFAULT_FORM_VALUES: CreateClientFormValues = {
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
  scheduleType: "service_default",
  milestones: [],
  remindersEnabled: true,
  sendEmailInvitation: true,
  clientVisibleNotes: "",
  internalNotes: "",
  superAdminNotes: "",
};

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
  const [createUser] = useCreateUserMutation();
  const [createPayment] = useCreatePaymentMutation();
  const [uploadDocuments] = useUploadCaseDocumentsMutation();

  // Upfront Deposit Collection State
  const [recordDepositNow, setRecordDepositNow] = React.useState<boolean>(false);
  const [depositPaymentMethod, setDepositPaymentMethod] = React.useState<string>("BANK_TRANSFER");
  const [depositReference, setDepositReference] = React.useState<string>("");
  const [depositNotes, setDepositNotes] = React.useState<string>("");
  const [depositProofFile, setDepositProofFile] = React.useState<File | null>(null);

  const handleDepositProofChange = (file: File | null) => {
    setDepositProofFile(file);
  };

  // Reset all form fields to completely empty defaults
  const handleResetForm = () => {
    reset(DEFAULT_FORM_VALUES);
    replace([]);
    setSelectedExistingUser(null);
    setIntakeMode("new");
    setExistingSearchQuery("");
    setDepositProofFile(null);
    setRecordDepositNow(false);
    setDepositReference("");
    setDepositNotes("");
    setErrorNotice("");
    setActiveTab("service");
  };

  // Start new case onboarding: clear all form values and reset success view
  const handleStartNewCase = () => {
    handleResetForm();
    setCaseIdentifier("");
    setCreatedClientId(null);
    setCreatedClientEmail("");
    setCreatedClientName("");
    setCreatedClientPhone("");
    setCreatedClientBizId("");
    setHasCopiedCredentials(false);
    setIsSuccess(false);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


  const [caseIdentifier, setCaseIdentifier] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [createdClientId, setCreatedClientId] = React.useState<string | null>(null);
  const [errorNotice, setErrorNotice] = React.useState<string>("");

  // Client Credentials & Handover State
  const [customPassword, setCustomPassword] = React.useState<string>("PassWord@2026!");
  const [createdClientEmail, setCreatedClientEmail] = React.useState<string>("");
  const [createdClientName, setCreatedClientName] = React.useState<string>("");
  const [createdClientPhone, setCreatedClientPhone] = React.useState<string>("");
  const [createdClientBizId, setCreatedClientBizId] = React.useState<string>("");
  const [hasCopiedCredentials, setHasCopiedCredentials] = React.useState<boolean>(false);
  const { isSuperAdmin } = usePermissions();
  const [activeTab, setActiveTab] = React.useState<"service" | "identity" | "finance" | "notes">("service");
  const [notesScope, setNotesScope] = React.useState<"client" | "staff" | "superAdmin">("client");

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
    reset,
    formState: { errors },
  } = useForm<CreateClientFormValues>({
    resolver: zodResolver(createClientSchema),
    defaultValues: DEFAULT_FORM_VALUES,
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
  const watchedClientNotes = watch("clientVisibleNotes") || "";
  const watchedInternalNotes = watch("internalNotes") || "";
  const watchedSuperAdminNotes = watch("superAdminNotes") || "";

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
      setValue("scheduleType", "service_default");

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

  // WhatsApp & Handover formatted messages
  const cleanPhone = (watchedCountryCode + watchedWhatsapp).replace(
    /[^\d+]/g,
    "",
  );
  const handoverLoginUrl = "https://ad-skill-pay-track-ai-frontend.vercel.app/login";

  const handoverMessageText = `Hello ${createdClientName || watchedName || "Client"},

Welcome to AdSkill Consultancy! Your client portal account has been created.

Access your case dossier, payment plan, invoices, and receipts online:

🌐 Portal Login: ${handoverLoginUrl}
📧 Login Email: ${createdClientEmail || watchedEmail}
🔑 Temporary Password: ${customPassword}
📁 Client ID: ${createdClientBizId || "Pending"}
📑 Case Code: ${caseIdentifier || "Pending"}

Please log in and update your password upon your first visit. If you have any questions, our team is here to assist you.`;

  const cleanHandoverPhone = (createdClientPhone || cleanPhone).replace(/[^\d+]/g, "");
  const handoverWhatsAppUrl = `https://wa.me/${cleanHandoverPhone.replace("+", "")}?text=${encodeURIComponent(handoverMessageText)}`;
  const handoverMailtoUrl = `mailto:${encodeURIComponent(createdClientEmail || watchedEmail)}?subject=${encodeURIComponent("Your AdSkill Client Portal Account Credentials")}&body=${encodeURIComponent(handoverMessageText)}`;

  const handleCopyHandoverMessage = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(handoverMessageText);
      setHasCopiedCredentials(true);
      setTimeout(() => setHasCopiedCredentials(false), 3000);
    }
  };

  const whatsappPreviewUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Hello ${watchedName || "Valued Client"}, welcome to AdSkill Consultancy. Your case onboarding has been initiated. Log in at ${handoverLoginUrl}`,
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
      let targetUserId = "";
      const emailClean = data.email.toLowerCase().trim();

      if (intakeMode === "existing") {
        if (!selectedExistingUser?.userId) {
          setErrorNotice("Please select an existing registered client account from the list.");
          setActiveTab("identity");
          setIsSubmitting(false);
          return;
        }
        targetUserId = selectedExistingUser.userId;
      } else {
        // NEW APPLICANT: Create user account first in backend with auto-generated clientId
        if (!data.name?.trim() || !emailClean) {
          setErrorNotice("Please provide the applicant's legal full name and email address.");
          setActiveTab("identity");
          setIsSubmitting(false);
          return;
        }

        const dialCode = data.countryCode || "+1";
        const cleanPhone = data.phone?.trim() ? `${dialCode} ${data.phone.trim()}` : undefined;
        const cleanWhatsapp = data.whatsappNumber?.trim() ? `${dialCode} ${data.whatsappNumber.trim()}` : cleanPhone;
        const passToSet = customPassword.trim() || `PassWord@${new Date().getFullYear()}!`;

        // Check if user with this email already exists in the registered users list
        const existingMatch = existingUserOptions.find(
          (u) => u.email?.toLowerCase().trim() === emailClean
        );

        if (existingMatch?.userId) {
          targetUserId = existingMatch.userId;
          setCreatedClientBizId(existingMatch.existingCaseRef || "N/A");
          setCreatedClientEmail(emailClean);
          setCreatedClientName(existingMatch.name || data.name.trim());
          setCreatedClientPhone(existingMatch.phone || "");
        } else {
          const newUserRes = await createUser({
            name: data.name.trim(),
            preferredName: data.preferredName?.trim() || undefined,
            email: emailClean,
            password: passToSet,
            phone: cleanPhone,
            whatsapp: cleanWhatsapp,
            country: data.countryOfOrigin?.trim() || data.destinationCountry || undefined,
            city: data.city?.trim() || undefined,
            roleName: "CLIENT",
          }).unwrap();

          if (!newUserRes?.data?.id) {
            throw new Error("Failed to resolve client user account.");
          }
          targetUserId = newUserRes.data.id;
          setCreatedClientBizId(newUserRes.data.clientId || "N/A");
          setCreatedClientEmail(emailClean);
          setCreatedClientName(data.name.trim());
          setCreatedClientPhone(cleanWhatsapp || cleanPhone || "");
        }
      }

      // 1. Create client case in backend attached to the resolved target client (atomic creation)
      const created = await createClientCase({
        userId: targetUserId,
        serviceId: data.serviceId,
        destinationCountry: data.destinationCountry?.trim() || undefined,
        caseCategory: data.visaCategory?.trim() || undefined,
        caseSubcategory: data.subCategory?.trim() || undefined,
        assignedConsultantId: data.assignedConsultantId?.trim() ? data.assignedConsultantId.trim() : undefined,
        caseStatus: data.status || "INTAKE",
        clientVisibleNotes: data.clientVisibleNotes?.trim() || undefined,
        internalNotes: data.internalNotes?.trim() || undefined,
        superAdminNotes: isSuperAdmin ? (data.superAdminNotes?.trim() || undefined) : undefined,
      }).unwrap();

      const createdCase = created.data;
      setCaseIdentifier(createdCase.caseCode);
      setCreatedClientId(createdCase.id);

      // Safe date formatting helper for ISO milestone dates
      const parseSafeIsoDate = (d?: string) => {
        if (!d) return new Date().toISOString();
        const parsed = new Date(d);
        return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      };

      // 2. Create Payment Plan with exact installment amounts
      if (isMathValid && data.contractedFee > 0) {
        try {
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
                dueDate: parseSafeIsoDate(m.dueDate),
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

          const planRes = await createPaymentPlan({
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

          // 3. Record Upfront Deposit into Payment Ledger if collected at onboarding
          if (recordDepositNow && data.depositAmount > 0) {
            try {
              let uploadedDocIds: string[] = [];
              if (depositProofFile) {
                const uploadRes = await uploadDocuments({
                  caseId: createdCase.id,
                  files: [depositProofFile],
                  documentType: "PAYMENT_PROOF",
                }).unwrap();
                if (uploadRes.data?.length) {
                  uploadedDocIds = uploadRes.data.map((d: any) => d.id);
                }
              }

              const depositInstallment = planRes?.data?.installments?.find(
                (i: any) => i.sequenceNumber === 1
              );

              await createPayment({
                caseId: createdCase.id,
                installmentId: depositInstallment?.id || undefined,
                amount: Number(data.depositAmount),
                currency: data.currency,
                paymentDate: new Date().toISOString(),
                paymentMethod: depositPaymentMethod,
                externalReference: depositReference.trim() || undefined,
                operationalNotes: depositNotes.trim() || "Initial Retainer / Upfront Deposit recorded at client onboarding",
                proofDocumentIds: uploadedDocIds.length > 0 ? uploadedDocIds : undefined,
                status: "PENDING",
              }).unwrap();
            } catch (payErr) {
              console.warn("Could not auto-record upfront deposit payment:", payErr);
            }
          }
        } catch (planErr: any) {
          console.warn("Could not auto-create payment plan during onboarding:", planErr);
        }
      }

      setIsSuccess(true);
      handleResetForm();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error: any) {
      const validationDetail = error?.data?.errorSources?.map((e: any) => `${e.path}: ${e.message}`).join(", ");
      const msg =
        validationDetail ||
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred while creating the client case. Please verify the fields and try again.";
      console.warn("Client case onboarding error:", msg, error);
      setErrorNotice(msg);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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
            <CommonButton
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetForm}
              className="h-10 px-3.5 rounded-2xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold cursor-pointer gap-1.5 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
              Reset to Empty
            </CommonButton>
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
              id: "service",
              step: "1",
              label: "Case & Jurisdiction",
              icon: MapPin,
              valid: Boolean(watchedServiceId && watchedCountry),
            },
            {
              id: "identity",
              step: "2",
              label: "Applicant Identity",
              icon: User,
              valid: Boolean(watchedName && watchedEmail && watchedWhatsapp),
            },
            {
              id: "finance",
              step: "3",
              label: "Financial Ledger",
              icon: CreditCard,
              valid: Boolean(computedContractedFee > 0 && isMathValid),
            },
            {
              id: "notes",
              step: "4",
              label: "Case Directives & Notes",
              icon: FileText,
              valid: true,
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

      {/* SUCCESS & ACCOUNT HANDOVER CREDENTIALS */}
      {isSuccess ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Case Successfully Created &amp; Scheduled!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Case Code: <span className="font-mono font-bold">{caseIdentifier}</span>.
                  {recordDepositNow
                    ? " Initial Retainer / Upfront Deposit has been posted to the Payments Ledger (Pending Verification)."
                    : " Client account is ready for handover."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!recordDepositNow && watchedDeposit > 0 && createdClientId && (
                <Link
                  href={`/payments/record?caseId=${createdClientId}`}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3.5 py-2 rounded-xl border border-amber-300 transition-colors">
                  <CreditCard className="h-3.5 w-3.5 text-amber-700" />
                  Record Deposit ({currencySymbol}{watchedDeposit.toLocaleString()}) &rarr;
                </Link>
              )}
              {createdClientId && (
                <Link
                  href={`/clients/${createdClientId}`}
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-xl shadow-xs hover:bg-slate-800 transition-colors">
                  Open Case Dossier &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* CLIENT ACCOUNT HANDOVER CARD */}
          <div className="p-6 rounded-3xl bg-white border-2 border-indigo-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Client Portal Account Handover Credentials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide these credentials to the client for their self-service portal access
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyHandoverMessage}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer">
                  {hasCopiedCredentials ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-indigo-600" />
                      Copy Welcome Message
                    </>
                  )}
                </button>

                {cleanHandoverPhone && (
                  <a
                    href={handoverWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl transition-all shadow-xs">
                    <MessageCircle className="h-3.5 w-3.5" />
                    Send via WhatsApp
                  </a>
                )}

                {(createdClientEmail || watchedEmail) && (
                  <a
                    href={handoverMailtoUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all border border-slate-200">
                    <Mail className="h-3.5 w-3.5" />
                    Send Email
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Portal Login URL</span>
                <a
                  href={handoverLoginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-extrabold text-blue-600 hover:underline mt-1 block truncate">
                  ad-skill-pay-track...vercel.app/login &rarr;
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Login Email</span>
                <span className="text-xs font-extrabold text-slate-900 mt-1 block truncate">
                  {createdClientEmail || watchedEmail || "—"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Temporary Password</span>
                <span className="text-xs font-mono font-black text-amber-700 mt-1 block select-all">
                  {customPassword}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Client ID &amp; Case</span>
                <span className="text-xs font-mono font-extrabold text-slate-900 mt-1 block">
                  {createdClientBizId || "Pending"} • {caseIdentifier}
                </span>
              </div>
            </div>
          </div>

          {/* POST-CREATION ACTION BAR: ONBOARD ANOTHER CLIENT OR OPEN DOSSIER */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs">
            <CommonButton
              type="button"
              onClick={handleStartNewCase}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Plus className="h-4 w-4" />
              + Onboard Another Client (New Empty Form)
            </CommonButton>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <CommonButton
                asChild
                variant="outline"
                className="h-12 px-5 rounded-2xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold">
                <Link href={ROUTES.CLIENTS}>View All Clients</Link>
              </CommonButton>

              {createdClientId && (
                <CommonButton
                  asChild
                  className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold gap-2 shadow-xs">
                  <Link href={`/clients/${createdClientId}`}>
                    Open Client Dossier &rarr;
                  </Link>
                </CommonButton>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 2. MAIN TWO-COLUMN WORKSPACE (CLEAN LIGHT THEME) */
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: FORM SECTIONS (8 OF 12 COLS) */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION 1: CASE SCOPE & JURISDICTION */}
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
                    1. Service Scope &amp; Case Jurisdiction
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
                    <div className="py-1">
                      <Skeleton className="h-12 w-full rounded-xl" />
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

            {/* SECTION 2: APPLICANT IDENTITY & COMMUNICATION */}
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
                      2. Applicant Dossier &amp; Contact
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-1">
                          <Skeleton className="h-16 rounded-xl" />
                          <Skeleton className="h-16 rounded-xl" />
                          <Skeleton className="h-16 rounded-xl" />
                          <Skeleton className="h-16 rounded-xl" />
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

                  {intakeMode === "new" && (
                    <div className="space-y-1.5 sm:col-span-2 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-indigo-600" />
                          Initial Portal Password for Client Handover
                        </label>
                        <button
                          type="button"
                          onClick={() => setCustomPassword(`PassWord@${Math.floor(1000 + Math.random() * 9000)}!`)}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          Generate Random
                        </button>
                      </div>
                      <Input
                        type="text"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        className="h-11 rounded-xl bg-white border-indigo-200 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                      <p className="text-[10px] text-slate-500">
                        Default: <code className="font-bold text-slate-700">PassWord@2026!</code>. The client will use this to sign in at <span className="font-semibold text-blue-600">https://ad-skill-pay-track-ai-frontend.vercel.app/login</span>.
                      </p>
                    </div>
                  )}
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
                      <span>Allocated: <b className="text-slate-900">{totalAllocated.toLocaleString()} ({allocationPercent}%)</b></span>
                    </div>
                  </div>
                </div>

                {/* UPFRONT DEPOSIT COLLECTION AT INTAKE */}
                {watchedDeposit > 0 && (
                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-2xs shrink-0">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-2">
                            Initial Retainer / Upfront Deposit ({currencySymbol}{watchedDeposit.toLocaleString()})
                          </h4>
                          <p className="text-[11px] text-amber-800/80">
                            Record deposit transaction directly into the Payments Ledger upon case submission
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                        <input
                          type="checkbox"
                          checked={recordDepositNow}
                          onChange={(e) => setRecordDepositNow(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                        <span className="ml-2.5 text-xs font-bold text-slate-800">
                          {recordDepositNow ? "Collect Now" : "Collect Later"}
                        </span>
                      </label>
                    </div>

                    {recordDepositNow && (
                      <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 rounded-xl bg-amber-100/70 border border-amber-300/80 text-[11px] font-semibold text-amber-900 flex items-center gap-2">
                          <Clock3 className="h-4 w-4 shrink-0 text-amber-700" />
                          <span>
                            An official payment entry for <b>{currencySymbol}{watchedDeposit.toLocaleString()}</b> will be posted to the <b>Payments Ledger</b> with status <b>PENDING VERIFICATION</b> for the Manager to verify.
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Deposit Payment Method *
                            </label>
                            <select
                              value={depositPaymentMethod}
                              onChange={(e) => setDepositPaymentMethod(e.target.value)}
                              className="w-full h-11 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                            >
                              <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
                              <option value="CASH">Cash in Office</option>
                              <option value="CARD">Credit / Debit Card</option>
                              <option value="ZELLE">Zelle / Instant Transfer</option>
                              <option value="CHECK">Paper Check / Cheque</option>
                              <option value="OTHER">Other Offline Transfer</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Bank Reference / Slip ID (Optional)
                            </label>
                            <Input
                              value={depositReference}
                              onChange={(e) => setDepositReference(e.target.value)}
                              placeholder="e.g. WT-984321 / Cash Receipt #04"
                              className="h-11 rounded-xl bg-white border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Operational Notes / Memo
                            </label>
                            <Input
                              value={depositNotes}
                              onChange={(e) => setDepositNotes(e.target.value)}
                              placeholder="Deposit received during onboarding consultation"
                              className="h-11 rounded-xl bg-white border-slate-300 text-xs text-slate-800"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700">
                              Attach Payment Slip / Proof (Optional)
                            </label>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleDepositProofChange(e.target.files?.[0] || null)}
                              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                            />
                            {depositProofFile && (
                              <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                                Attached: {depositProofFile.name} ({(depositProofFile.size / 1024).toFixed(1)} KB)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: CASE DIRECTIVES & COLLABORATIVE NOTES */}
            <div
              id="section-notes"
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Case Directives &amp; Multi-Tier Notes</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        Rich Text
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Attach scoped directives with role-isolated visibility (Client Portal, Staff Internal, Super Admin Confidential)
                    </p>
                  </div>
                </div>
              </div>

              {/* Scoped Notes Tab Switcher */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setNotesScope("client")}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      notesScope === "client"
                        ? "bg-white text-blue-900 shadow-xs border border-blue-200/60"
                        : "text-slate-600 hover:text-slate-900",
                    )}>
                    <Globe className="h-3.5 w-3.5 text-blue-600" />
                    <span>Client-Visible Note</span>
                    {watchedClientNotes.trim() && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setNotesScope("staff")}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      notesScope === "staff"
                        ? "bg-white text-amber-900 shadow-xs border border-amber-200/60"
                        : "text-slate-600 hover:text-slate-900",
                    )}>
                    <Shield className="h-3.5 w-3.5 text-amber-600" />
                    <span>Staff-Only Directive</span>
                    {watchedInternalNotes.trim() && (
                      <span className="h-2 w-2 rounded-full bg-amber-600" />
                    )}
                  </button>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setNotesScope("superAdmin")}
                      className={cn(
                        "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        notesScope === "superAdmin"
                          ? "bg-white text-purple-900 shadow-xs border border-purple-200/60"
                          : "text-slate-600 hover:text-slate-900",
                      )}>
                      <Lock className="h-3.5 w-3.5 text-purple-600" />
                      <span>Super Admin Confidential</span>
                      {watchedSuperAdminNotes.trim() && (
                        <span className="h-2 w-2 rounded-full bg-purple-600" />
                      )}
                    </button>
                  )}
                </div>

                {/* Note Editor Area by Scope */}
                {notesScope === "client" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                        <Globe className="h-3.5 w-3.5" />
                        <span>Visible to the applicant on their Client Portal dashboard</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">WYSIWYG Formatted</span>
                    </div>
                    <RichTextEditor
                      value={watch("clientVisibleNotes") || ""}
                      onChange={(val) => setValue("clientVisibleNotes", val, { shouldDirty: true })}
                      placeholder="Enter instructions, welcome notes, or onboarding directives visible to the client..."
                      minHeight="140px"
                    />
                  </div>
                )}

                {notesScope === "staff" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Visible to all caseworkers, consultants, and management (Hidden from client)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">WYSIWYG Formatted</span>
                    </div>
                    <RichTextEditor
                      value={watch("internalNotes") || ""}
                      onChange={(val) => setValue("internalNotes", val, { shouldDirty: true })}
                      placeholder="Enter internal casework directives, processing notes, or communication history..."
                      minHeight="140px"
                    />
                  </div>
                )}

                {notesScope === "superAdmin" && isSuperAdmin && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-purple-800 font-semibold">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Confidential Executive Note (Strictly hidden from clients, consultants, and managers)</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">WYSIWYG Formatted</span>
                    </div>
                    <RichTextEditor
                      value={watch("superAdminNotes") || ""}
                      onChange={(val) => setValue("superAdminNotes", val, { shouldDirty: true })}
                      placeholder="Enter confidential executive commentary, compliance risk flags, or sensitive financial notes..."
                      minHeight="140px"
                    />
                  </div>
                )}
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

              {/* Case Directives Status */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Directives Attached
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {watchedClientNotes?.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      <Globe className="h-2.5 w-2.5" /> Client Note
                    </span>
                  ) : null}
                  {watchedInternalNotes?.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                      <Shield className="h-2.5 w-2.5" /> Staff Note
                    </span>
                  ) : null}
                  {isSuperAdmin && watchedSuperAdminNotes?.trim() ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                      <Lock className="h-2.5 w-2.5" /> Super Admin
                    </span>
                  ) : null}
                  {!watchedClientNotes?.trim() && !watchedInternalNotes?.trim() && (!isSuperAdmin || !watchedSuperAdminNotes?.trim()) ? (
                    <span className="text-[11px] text-slate-400 italic">No notes attached</span>
                  ) : null}
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
                  type="button"
                  variant="outline"
                  onClick={handleResetForm}
                  className="w-full h-10 rounded-2xl border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-colors cursor-pointer gap-2">
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear Form / Reset to Empty
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
      )}
    </div>
  );
}
