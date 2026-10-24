"use client";

import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";
import { cn, formatExplicitDate, formatExplicitDateTime } from "@/lib/utils";
import {
  useAddLeadActivityMutation,
  useDeleteLeadActivityMutation,
  useDeleteLeadMutation,
  useGetLeadByIdQuery,
  useUpdateLeadActivityMutation,
  useUpdateLeadMutation,
  useUploadLeadDocumentsMutation,
  useDeleteLeadDocumentMutation,
} from "@/services/api/leads/leadsApi";
import { useGetServicesQuery } from "@/services/api/services/servicesApi";
import { useGetUsersQuery } from "@/services/api/users/usersApi";
import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  RefreshCw,
  Share2,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { CallOutcome, LeadActivityType, LeadStatus } from "../types";
import { EditLeadModal } from "./EditLeadModal";
import { LeadDetailSkeleton } from "./LeadDetailSkeleton";

const getPresetIsoString = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface LeadDetailViewProps {
  leadId: string;
}

const statusClass: Record<LeadStatus, string> = {
  NEW: "bg-[#EBF8FF] text-[#0284C7] border border-[#BAE6FD]",
  CONTACTED: "bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]",
  IN_PROGRESS: "bg-[#E0E7FF] text-[#4338CA] border border-[#C7D2FE]",
  FOLLOW_UP: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
  DOCUMENTS_PENDING: "bg-[#FEF9C3] text-[#A16207] border border-[#FDE047]",
  MEETING_SCHEDULED: "bg-[#E0F2FE] text-[#0369A1] border border-[#7DD3FC]",
  QUALIFIED: "bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]",
  ENGAGED: "bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]",
  CONVERTED: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
  LOST: "bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]",
  NOT_INTERESTED: "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]",
};

const statusLabel: Record<LeadStatus, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In Discussion",
  FOLLOW_UP: "Follow-Up Required",
  DOCUMENTS_PENDING: "Documents Pending",
  MEETING_SCHEDULED: "Meeting Scheduled",
  QUALIFIED: "Qualified",
  ENGAGED: "Converted - Engaged",
  CONVERTED: "Closed - Won",
  LOST: "Closed - Lost",
  NOT_INTERESTED: "Not Interested",
};

const assessmentBadgeClass = (assessment?: string | null) => {
  if (!assessment) return "bg-slate-100 text-slate-600 border-slate-200";
  if (assessment.includes("Strong"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (assessment.includes("Moderate"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (assessment.includes("Weak"))
    return "bg-rose-50 text-rose-700 border-rose-200";
  if (assessment.includes("Review"))
    return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-sky-50 text-sky-700 border-sky-200";
};

const priorityBadgeClass = (priority?: string | null) => {
  const p = (priority || "MEDIUM").toUpperCase();
  if (p === "HIGH") return "bg-red-50 text-red-700 border-red-200 font-bold";
  if (p === "LOW") return "bg-slate-50 text-slate-600 border-slate-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
};

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { confirm, alert } = useConfirm();

  // 1. Fetch full lead details with activities
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetLeadByIdQuery(leadId);
  const lead = response?.data;

  // 2. Fetch staff list for assignment & acting staff selector
  const { data: usersResponse } = useGetUsersQuery({
    limit: 100,
    excludeRoleName: "CLIENT",
  });
  const staffList = (usersResponse?.data || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));

  // 3. Fetch services list for edit modal
  const { data: servicesResponse } = useGetServicesQuery({
    limit: 100,
    isActive: true,
  });
  const servicesList = (servicesResponse?.data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
  }));

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const [addActivity, { isLoading: isAddingActivity }] =
    useAddLeadActivityMutation();
  const [updateLead, { isLoading: isUpdatingLead }] = useUpdateLeadMutation();
  const [deleteLead] = useDeleteLeadMutation();
  const [deleteLeadActivity] = useDeleteLeadActivityMutation();
  const [updateLeadActivity] = useUpdateLeadActivityMutation();
  const [uploadLeadDocs, { isLoading: isUploadingDocs }] = useUploadLeadDocumentsMutation();
  const [deleteLeadDoc, { isLoading: isDeletingDoc }] = useDeleteLeadDocumentMutation();

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }
      fd.append("documentType", "SUPPORTING");

      await uploadLeadDocs({
        leadId,
        formData: fd,
      }).unwrap();

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      alert({
        title: "Upload Failed",
        message: err?.data?.message || "Failed to upload lead document.",
        variant: "danger",
      });
    }
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    const confirmed = await confirm({
      title: "Delete Document",
      message: `Are you sure you want to permanently delete "${docName}" from this lead?`,
      confirmText: "Delete",
      variant: "danger",
    });

    if (confirmed) {
      try {
        await deleteLeadDoc({ documentId: docId, leadId }).unwrap();
      } catch (err: any) {
        alert({
          title: "Deletion Failed",
          message: err?.data?.message || "Failed to delete document.",
          variant: "danger",
        });
      }
    }
  };

  // Form state
  const [activityType, setActivityType] =
    React.useState<LeadActivityType>("CALL");
  const [callOutcome, setCallOutcome] = React.useState<CallOutcome>("ANSWERED");
  const [notes, setNotes] = React.useState("");
  const [nextFollowUp, setNextFollowUp] = React.useState("");
  const [statusUpdate, setStatusUpdate] = React.useState<LeadStatus | "">("");
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>("");
  const [customStaffName, setCustomStaffName] = React.useState<string>("");
  const [formError, setFormError] = React.useState<string | null>(null);

  // Initialize acting staff to current logged in user
  React.useEffect(() => {
    if (user?.id) {
      setSelectedStaffId(user.id);
      setCustomStaffName(user.name || "");
    }
  }, [user]);

  const handleStaffChange = (staffId: string) => {
    setSelectedStaffId(staffId);
    const found = staffList.find((s) => s.id === staffId);
    if (found) {
      setCustomStaffName(found.name);
    }
  };

  // Controlled field for Assigned Staff
  const [assignedStaffId, setAssignedStaffId] = React.useState<string>("");
  const [isSavingStaff, setIsSavingStaff] = React.useState(false);

  React.useEffect(() => {
    if (lead) {
      setAssignedStaffId(lead.assignedToId || "");
    }
  }, [lead?.assignedToId]);

  const hasStaffChanged =
    Boolean(lead) && assignedStaffId !== (lead?.assignedToId || "");

  const handleSaveStaffAssignment = async () => {
    if (!lead || !hasStaffChanged) return;

    const assignedStaffName =
      staffList.find((s) => s.id === assignedStaffId)?.name ||
      (assignedStaffId ? "Selected Staff" : "Unassigned");

    const isConfirmed = await confirm({
      title: "Confirm Staff Assignment",
      message: `Assign lead "${lead.fullName}" to ${assignedStaffName}?`,
      confirmText: "Yes, Assign Staff",
      cancelText: "Cancel",
      variant: "info",
    });
    if (!isConfirmed) return;

    setIsSavingStaff(true);

    try {
      await updateLead({
        id: leadId,
        data: {
          assignedToId: assignedStaffId || null,
        },
      }).unwrap();

      await alert({
        title: "Staff Assigned Successfully",
        message: `Lead has been assigned to ${assignedStaffName}.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Assignment Failed",
        message:
          err?.data?.message ||
          err?.message ||
          "Failed to update staff assignment",
        variant: "danger",
      });
    } finally {
      setIsSavingStaff(false);
    }
  };

  // Quick Status Change Handler
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  const handleQuickStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || newStatus === lead.status) return;

    setIsUpdatingStatus(true);
    try {
      await updateLead({
        id: leadId,
        data: {
          status: newStatus,
        },
      }).unwrap();

      await refetch();
    } catch (err: any) {
      await alert({
        title: "Status Update Failed",
        message:
          err?.data?.message ||
          err?.message ||
          "Failed to update lead status",
        variant: "danger",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    const isConfirmed = await confirm({
      title: "Delete Prospective Lead",
      message: `Are you sure you want to permanently remove lead "${lead.fullName}"? All interaction logs and CRM history will be erased.`,
      confirmText: "Yes, Delete Lead",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) return;

    try {
      await deleteLead(leadId).unwrap();
      await alert({
        title: "Lead Deleted",
        message: `Prospective lead "${lead.fullName}" has been permanently removed.`,
        variant: "success",
      });
      router.push("/leads");
    } catch (err: any) {
      await alert({
        title: "Delete Error",
        message: err?.data?.message || "Failed to delete lead",
        variant: "danger",
      });
    }
  };

  // Activity edit / delete state
  const [editingActivityId, setEditingActivityId] = React.useState<string | null>(null);
  const [editingNotes, setEditingNotes] = React.useState("");
  const [isUpdatingActivity, setIsUpdatingActivity] = React.useState(false);
  const [isDeletingActivityId, setIsDeletingActivityId] = React.useState<string | null>(null);

  const handleDeleteActivity = async (activityId: string) => {
    const isConfirmed = await confirm({
      title: "Delete Activity Log",
      message: "Are you sure you want to delete this interaction log? This action cannot be undone.",
      confirmText: "Yes, Delete Log",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!isConfirmed) return;

    setIsDeletingActivityId(activityId);
    try {
      await deleteLeadActivity({
        activityId,
        leadId,
      }).unwrap();

      await refetch();
      await alert({
        title: "Activity Deleted",
        message: "Interaction log has been removed from timeline.",
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err?.data?.message || err?.message || "Failed to delete activity log",
        variant: "danger",
      });
    } finally {
      setIsDeletingActivityId(null);
    }
  };

  const handleSaveEditedActivity = async () => {
    if (!editingActivityId) return;

    setIsUpdatingActivity(true);
    try {
      await updateLeadActivity({
        activityId: editingActivityId,
        leadId,
        data: {
          notes: editingNotes.trim(),
        },
      }).unwrap();

      setEditingActivityId(null);
      await refetch();
      await alert({
        title: "Note Updated",
        message: "Activity log has been updated successfully.",
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Update Failed",
        message: err?.data?.message || err?.message || "Failed to update activity notes",
        variant: "danger",
      });
    } finally {
      setIsUpdatingActivity(false);
    }
  };

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!notes.trim() && activityType !== "CALL") {
      setFormError("Please enter notes or summary of the interaction.");
      return;
    }

    try {
      await addActivity({
        leadId,
        data: {
          activityType,
          callOutcome: activityType === "CALL" ? callOutcome : undefined,
          notes: notes.trim() || `Recorded ${activityType} interaction`,
          nextFollowUp: nextFollowUp || undefined,
          statusUpdate: statusUpdate || undefined,
          performedById: selectedStaffId || undefined,
          performedByName: customStaffName || user?.name || undefined,
        },
      }).unwrap();

      // Reset interaction form fields
      setNotes("");
      setNextFollowUp("");
      setStatusUpdate("");

      await alert({
        title: "Activity Recorded Successfully",
        message: `New ${activityType.toLowerCase()} log added to "${lead?.fullName}" timeline.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Failed to Record Activity",
        message:
          err?.data?.message || err?.message || "Failed to save activity log",
        variant: "danger",
      });
    }
  };

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (isError || !lead) {
    return (
      <div className="rounded-3xl border border-[#FECACA] bg-white p-10 text-center space-y-3 max-w-lg mx-auto my-12">
        <p className="text-base font-bold text-[#B91C1C]">Lead not found</p>
        <p className="text-xs text-[#64748B]">
          The prospective client lead could not be located or may have been
          removed.
        </p>
        <div className="pt-2 flex justify-center gap-2">
          <Link href="/leads">
            <Button variant="outline" size="sm">
              Back to Leads
            </Button>
          </Link>
          <Button size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  const rawPhone = lead.phone || "";
  const cleanedPhone = rawPhone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(
    `Hello ${lead.fullName}, this is ${
      customStaffName || user?.name || "AdSkill"
    } from AdSkill Consultancy. I'm reaching out regarding your inquiry.`,
  )}`;

  const getActivityBadge = (act: any) => {
    switch (act.activityType) {
      case "CALL":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-semibold">
            <Phone className="h-3 w-3" />
            Call: {act.callOutcome || "Completed"}
          </span>
        );
      case "WHATSAPP":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
            <MessageSquare className="h-3 w-3" />
            WhatsApp
          </span>
        );
      case "STATUS_CHANGE":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 px-2 py-0.5 text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            Status Change
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-semibold">
            <FileText className="h-3 w-3" />
            Note
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BREADCRUMB & HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#EAE6DF]">
        <div className="flex items-center gap-3">
          <Link
            href="/leads"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] hover:bg-[#F1ECE4] transition-colors cursor-pointer text-[#0a0a0a]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link href="/leads" className="hover:underline">
                Leads Pipeline
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-bold text-[#0a0a0a]">{lead.fullName}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {lead.clientCode && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-900 text-white shadow-xs">
                  {lead.clientCode}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a]">
                {lead.fullName}
              </h1>
              {lead.priority && (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase border",
                    priorityBadgeClass(lead.priority),
                  )}>
                  {lead.priority} Priority
                </span>
              )}
              {lead.profileAssessment && (
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                    assessmentBadgeClass(lead.profileAssessment),
                  )}>
                  {lead.profileAssessment}
                </span>
              )}

              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                  statusClass[lead.status] || "bg-slate-100 text-slate-700",
                )}>
                {statusLabel[lead.status] || lead.status}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct WhatsApp Chat Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>Chat WhatsApp</span>
          </a>

          {/* Direct Phone Call Button */}
          <a
            href={`tel:${lead.phone}`}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F1ECE4] border border-[#EAE6DF] text-[#0a0a0a] text-xs sm:text-sm font-bold transition-colors">
            <Phone className="h-4 w-4 text-[#0a0a0a]" />
            <span>Call</span>
          </a>

          {/* Edit Lead Details Button */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F1ECE4] border border-[#EAE6DF] text-[#0a0a0a] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            title="Edit Lead Information">
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </button>

          {/* Delete Lead */}
          <button
            type="button"
            onClick={handleDelete}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FAF8F5] hover:bg-rose-50 border border-[#EAE6DF] hover:border-rose-200 text-slate-600 hover:text-rose-600 transition-colors"
            title="Delete Lead">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN LAYOUT: LEFT (DOSSIER & FORM) | RIGHT (ACTIVITY TIMELINE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 5 COLS */}
        <div className="lg:col-span-5 space-y-6">
          {/* A. Lead Profile Card */}
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  Lead Details
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FAF8F5] hover:bg-[#0a0a0a] border border-[#EAE6DF] hover:border-[#0a0a0a] text-[#64748B] hover:text-white transition-all cursor-pointer shadow-2xs group"
                  title="Edit Lead Information">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Quick Status Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={lead.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) =>
                    handleQuickStatusChange(e.target.value as LeadStatus)
                  }
                  className={cn(
                    "h-8 pl-3 pr-7 rounded-full text-xs font-bold border transition-all cursor-pointer appearance-none shadow-2xs hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-60",
                    statusClass[lead.status] || "bg-slate-100 text-slate-700",
                  )}>
                  {Object.entries(statusLabel).map(([key, label]) => (
                    <option
                      key={key}
                      value={key}
                      className="bg-white text-slate-900 font-semibold py-1">
                      {label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-70">
                  {isUpdatingStatus ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {/* Phone */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" /> Phone
                </span>
                <span className="font-bold text-[#0a0a0a] font-mono">
                  {lead.phone}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </span>
                <span className="font-semibold text-[#0a0a0a] truncate max-w-[200px]">
                  {lead.email || "Not provided"}
                </span>
              </div>

              {/* Country */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Country
                </span>
                <span className="font-semibold text-[#0a0a0a]">
                  {lead.country || "Not set"}
                </span>
              </div>

              {/* Address */}
              {lead.address && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Address
                  </span>
                  <span className="font-semibold text-[#0a0a0a] text-right truncate max-w-[200px]">
                    {lead.address}
                  </span>
                </div>
              )}

              {/* Service */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> Interested Service
                </span>
                <span className="font-bold text-[#0a0a0a] text-right">
                  {lead.service?.name || "Not specified"}
                </span>
              </div>

              {/* Lead Source */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Lead Source
                </span>
                <span className="font-semibold text-[#0a0a0a]">
                  {lead.leadSource || lead.referralName || "Direct Inquiry"}
                </span>
              </div>

              {/* Consultation Meeting */}
              {(lead.meetingDateTimeStr || lead.meetingScheduled === "Yes") && (
                <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-sky-700" /> Consultation
                      Meeting
                    </span>
                    <span className="bg-sky-200/80 px-2 py-0.5 rounded-full text-[10px]">
                      {lead.meetingScheduled || "Scheduled"}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-sky-800">
                    {lead.meetingDateTimeStr || "Date & Time Pending"}
                  </div>
                </div>
              )}

              {/* Lead Documents / Dossier Files */}
              <div className="pt-3 border-t border-[#F0ECE6] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0a0a0a] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Lead Documents ({lead.documents?.length || 0})</span>
                  </span>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                      className="hidden"
                      id="lead-doc-upload-input"
                    />
                    <button
                      type="button"
                      disabled={isUploadingDocs}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-xl transition-colors cursor-pointer">
                      {isUploadingDocs ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      <span>Upload Doc</span>
                    </button>
                  </div>
                </div>

                {lead.documents && lead.documents.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {lead.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] hover:border-[#D5CFC5] transition-colors group">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0a0a0a] truncate" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "File"} • {doc.documentType || "DOCUMENT"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {doc.downloadUrl ? (
                            <a
                              href={doc.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary/10 text-[#64748B] hover:text-primary transition-colors"
                              title="Download / Open">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          ) : (
                            <a
                              href={`/api/v1/leads/documents/${doc.id}/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-primary/10 text-[#64748B] hover:text-primary transition-colors"
                              title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button
                            type="button"
                            disabled={isDeletingDoc}
                            onClick={() => handleDeleteDocument(doc.id, doc.fileName)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-rose-50 text-[#64748B] hover:text-rose-600 transition-colors"
                            title="Delete file">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl border border-dashed border-[#EAE6DF] bg-[#FAF8F5]/50 text-center">
                    <p className="text-xs text-muted-foreground">No documents uploaded yet</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Click "Upload Doc" to add resume, passport, or forms.</p>
                  </div>
                )}
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F0ECE6]">
                <span className="text-xs font-semibold text-[#64748B]">
                  Date Created
                </span>
                <span className="text-xs font-bold text-[#0a0a0a]">
                  {formatExplicitDate(lead.createdAt)}
                </span>
              </div>

              {/* Updated Date */}
              {lead.updatedAt && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-[#64748B]">
                    Last Updated
                  </span>
                  <span className="text-xs font-bold text-[#0a0a0a]">
                    {formatExplicitDate(lead.updatedAt)}
                  </span>
                </div>
              )}

              {/* Next Scheduled Follow-Up */}
              <div className="flex items-center justify-between pt-1 border-t border-[#F0ECE6]">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Next
                  Follow-Up
                </span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    lead.nextFollowUpDate
                      ? "text-[#0a0a0a]"
                      : "text-muted-foreground italic",
                  )}>
                  {lead.nextFollowUpDate
                    ? formatExplicitDateTime(lead.nextFollowUpDate)
                    : "None scheduled"}
                </span>
              </div>
            </div>

            {/* Assigned Staff Member */}
            <div className="pt-3 border-t border-[#F0ECE6] space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                Assigned Staff Member
              </label>
              <div className="flex gap-2">
                <select
                  value={assignedStaffId}
                  disabled={isSavingStaff || isUpdatingLead}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="w-full h-10 px-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] focus:outline-hidden focus:border-[#0a0a0a]">
                  <option value="">Unassigned</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleSaveStaffAssignment}
                  disabled={isSavingStaff || isUpdatingLead || !hasStaffChanged}
                  className="rounded-2xl shrink-0">
                  {isSavingStaff ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* B. What Client Wants */}
          {lead.whatClientWants && (
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                <span className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  What Client Wants
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FAF8F5] hover:bg-[#0a0a0a] border border-[#EAE6DF] hover:border-[#0a0a0a] text-[#64748B] hover:text-white transition-all cursor-pointer shadow-2xs group"
                  title="Edit Client Goal">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-medium text-[#0a0a0a] leading-relaxed">
                {lead.whatClientWants}
              </div>
            </div>
          )}

          {/* C. Evaluation Summary & Legal Assessment Notes */}
          {(lead.evaluationNotes || lead.remarks) && (
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                    Profile Assessment & Evaluation
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#FAF8F5] hover:bg-[#0a0a0a] border border-[#EAE6DF] hover:border-[#0a0a0a] text-[#64748B] hover:text-white transition-all cursor-pointer shadow-2xs group"
                    title="Edit Profile Assessment">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                {lead.profileAssessment && (
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border",
                      assessmentBadgeClass(lead.profileAssessment),
                    )}>
                    {lead.profileAssessment}
                  </span>
                )}
              </div>

              {lead.remarks && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Internal Remarks
                  </span>
                  <p className="text-xs text-slate-800 font-medium bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    {lead.remarks}
                  </p>
                </div>
              )}

              {lead.evaluationNotes && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Preliminary Evaluation & Action Plan
                  </span>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[350px] overflow-y-auto">
                    {lead.evaluationNotes}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Record Interaction Form */}

          {/* B. Record Interaction Form */}
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <span className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                Record Interaction / Call
              </span>
              <span className="text-[11px] text-[#64748B]">
                Staff activity audit
              </span>
            </div>

            {formError && (
              <div className="rounded-xl bg-[#FEF2F2] border border-[#FECACA] p-3 text-xs font-medium text-[#B91C1C]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitActivity} className="space-y-3.5">
              {/* Acting Staff Selector */}
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  Acting Staff (Who performed this call / update?)
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => handleStaffChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interaction Type Selection Tabs */}
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  Interaction Type
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { type: "CALL", label: "Phone Call", icon: Phone },
                    {
                      type: "WHATSAPP",
                      label: "WhatsApp",
                      icon: MessageSquare,
                    },
                    { type: "NOTE", label: "Note", icon: FileText },
                    { type: "MEETING", label: "Meeting", icon: Users },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = activityType === item.type;
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() =>
                          setActivityType(item.type as LeadActivityType)
                        }
                        className={cn(
                          "flex flex-col items-center justify-center gap-1 rounded-2xl p-2.5 text-center text-xs font-bold border transition-all cursor-pointer",
                          isSelected
                            ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-xs"
                            : "border-[#EAE6DF] bg-[#FAF8F5] hover:bg-[#F1ECE4] text-[#64748B]",
                        )}>
                        <Icon className="h-4 w-4" />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Call Outcome */}
              {activityType === "CALL" && (
                <div>
                  <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                    Call Outcome
                  </label>
                  <select
                    value={callOutcome}
                    onChange={(e) =>
                      setCallOutcome(e.target.value as CallOutcome)
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    <option value="ANSWERED">Answered / Discussed</option>
                    <option value="NO_ANSWER">No Answer / Rang Out</option>
                    <option value="BUSY">Line Busy</option>
                    <option value="CALLBACK_REQUESTED">
                      Client Requested Callback
                    </option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                    <option value="WRONG_NUMBER">Wrong Number</option>
                  </select>
                </div>
              )}

              {/* Conversation Remarks / Notes */}
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  Notes / What did the lead say?
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Discussed pricing for EB-2 NIW. Client requested proposal via WhatsApp by Friday."
                  className="w-full rounded-2xl border border-[#EAE6DF] bg-white p-3 text-xs text-[#0a0a0a] placeholder:text-[#64748B]/60 focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>

              {/* Next Follow-Up Date & Status Transition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-xs font-bold text-[#0a0a0a] flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      Next Follow-Up Date
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setNextFollowUp(getPresetIsoString(1))}
                        className="rounded-md border border-[#EAE6DF] bg-[#FAF8F5] hover:bg-[#F1ECE4] px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 cursor-pointer">
                        +1d
                      </button>
                      <button
                        type="button"
                        onClick={() => setNextFollowUp(getPresetIsoString(3))}
                        className="rounded-md border border-amber-200 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 cursor-pointer">
                        +3d
                      </button>
                      <button
                        type="button"
                        onClick={() => setNextFollowUp(getPresetIsoString(7))}
                        className="rounded-md border border-[#EAE6DF] bg-[#FAF8F5] hover:bg-[#F1ECE4] px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 cursor-pointer">
                        +7d
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(
                            "detail-record-followup-input",
                          ) as HTMLInputElement;
                          if (input) {
                            input.focus();
                            input.showPicker?.();
                          }
                        }}
                        className="rounded-md border border-primary/30 bg-primary/10 hover:bg-primary hover:text-white px-1.5 py-0.5 text-[10px] font-bold text-primary cursor-pointer transition-colors flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        Custom Date
                      </button>
                      {nextFollowUp && (
                        <button
                          type="button"
                          onClick={() => setNextFollowUp("")}
                          className="text-[10px] text-muted-foreground hover:text-red-600 cursor-pointer ml-0.5">
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3 h-4 w-4 text-[#64748B] pointer-events-none" />
                    <input
                      id="detail-record-followup-input"
                      type="datetime-local"
                      value={nextFollowUp}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      onChange={(e) => setNextFollowUp(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-medium text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] cursor-pointer hover:border-slate-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                    Shift Status To
                  </label>
                  <select
                    value={statusUpdate}
                    onChange={(e) =>
                      setStatusUpdate(e.target.value as LeadStatus | "")
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    <option value="">Keep Current ({lead.status})</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="FOLLOW_UP">Follow-Up Needed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isAddingActivity}
                  className="w-full h-11 rounded-2xl bg-[#0a0a0a] hover:bg-[#262626] text-white text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(0,0,0,0.12)]">
                  {isAddingActivity
                    ? "Saving Activity..."
                    : "Save Activity Log"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: 7 COLS (FULL INTERACTION TIMELINE STREAM) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0a0a0a]">
                  Lead Activity & CRM Timeline
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-[10px] font-bold text-[#0a0a0a]">
                  {lead.activities?.length || 0}
                </span>
              </div>
              <span className="text-xs text-[#64748B]">
                Newest interactions first
              </span>
            </div>

            {/* Timeline Stream */}
            {lead.activities && lead.activities.length > 0 ? (
              <div className="space-y-3.5">
                {lead.activities.map((act) => (
                  <div
                    key={act.id}
                    className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5]/60 p-4 shadow-[0_2px_10px_rgb(0,0,0,0.01)] space-y-2.5 transition-all hover:bg-white hover:shadow-xs">
                    {/* Top Row: Date & Time on left, Activity Badge + Actions on right */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F0ECE6]">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#EAE6DF] text-xs font-black text-[#0a0a0a] shadow-2xs font-mono">
                        <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{formatExplicitDateTime(act.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {getActivityBadge(act)}

                        {/* Action buttons: Edit and Delete */}
                        <div className="flex items-center gap-1 pl-1 border-l border-[#EAE6DF]">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingActivityId(act.id);
                              setEditingNotes(act.notes || "");
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-slate-100 border border-[#EAE6DF] text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                            title="Edit Activity Notes">
                            <Pencil className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            disabled={isDeletingActivityId === act.id}
                            onClick={() => handleDeleteActivity(act.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white hover:bg-rose-50 border border-[#EAE6DF] hover:border-rose-200 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                            title="Delete Activity Log">
                            {isDeletingActivityId === act.id ? (
                              <Loader2 className="h-3 w-3 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Next Row: Acting Staff Attribution */}
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span>by</span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a0a0a] text-white text-[10px] font-bold shrink-0">
                        {(act.performedByName ||
                          act.performedBy?.name ||
                          "S")[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-[#0a0a0a]">
                        {act.performedByName ||
                          act.performedBy?.name ||
                          "Staff"}
                      </span>
                    </div>

                    {/* Notes content or Inline Edit Form */}
                    {editingActivityId === act.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          rows={4}
                          placeholder="Edit activity notes..."
                          className="w-full p-3 rounded-xl border border-[#EAE6DF] bg-white text-xs text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] leading-relaxed resize-y"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUpdatingActivity}
                            onClick={() => setEditingActivityId(null)}
                            className="h-8 rounded-xl text-xs">
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isUpdatingActivity}
                            onClick={handleSaveEditedActivity}
                            className="h-8 rounded-xl bg-[#0a0a0a] hover:bg-[#262626] text-white text-xs font-bold">
                            {isUpdatingActivity ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                            ) : null}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      act.notes && (
                        <p className="text-xs text-[#0a0a0a] leading-relaxed pt-0.5 whitespace-pre-wrap">
                          {act.notes}
                        </p>
                      )
                    )}

                    {/* Scheduled Follow-up */}
                    {act.nextFollowUp && (
                      <div className="flex items-center gap-1.5 pt-1 text-xs font-bold text-[#D97706]">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          Follow-up scheduled:{" "}
                          {formatExplicitDateTime(act.nextFollowUp)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#EAE6DF] p-10 text-center text-xs text-[#64748B] space-y-1">
                <p className="font-bold text-[#0a0a0a]">
                  No interaction records yet
                </p>
                <p>
                  Use the interaction form to record your first call, WhatsApp
                  message, or client consultation note.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      {isEditModalOpen && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lead={lead}
          servicesList={servicesList}
          staffList={staffList}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
