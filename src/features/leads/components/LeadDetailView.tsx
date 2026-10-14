"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  Globe,
  Share2,
  Mail,
  UserCheck,
  Send,
  Trash2,
  Copy,
  ChevronRight,
  Shield,
  Loader2,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  useGetLeadByIdQuery,
  useAddLeadActivityMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
} from "@/services/api/leads/leadsApi";
import { useGetUsersQuery } from "@/services/api/users/usersApi";
import { useGetServicesQuery } from "@/services/api/services/servicesApi";
import { useAuth } from "@/hooks/useAuth";
import { LeadDetailSkeleton } from "./LeadDetailSkeleton";
import { EditLeadModal } from "./EditLeadModal";
import type {
  CallOutcome,
  LeadActivityType,
  LeadStatus,
} from "../types";
import { cn, formatExplicitDate, formatExplicitDateTime } from "@/lib/utils";

interface LeadDetailViewProps {
  leadId: string;
}

const statusClass: Record<LeadStatus, string> = {
  NEW: "bg-[#EBF8FF] text-[#0284C7]",
  CONTACTED: "bg-[#F3E8FF] text-[#9333EA]",
  IN_PROGRESS: "bg-[#E0E7FF] text-[#4338CA]",
  FOLLOW_UP: "bg-[#FEF3C7] text-[#B45309]",
  QUALIFIED: "bg-[#CCFBF1] text-[#0F766E]",
  CONVERTED: "bg-[#ECFDF5] text-[#059669]",
  LOST: "bg-[#FFF1F2] text-[#E11D48]",
};

const statusLabel: Record<LeadStatus, string> = {
  NEW: "New Lead",
  CONTACTED: "Contacted",
  IN_PROGRESS: "In Progress",
  FOLLOW_UP: "Follow-Up",
  QUALIFIED: "Qualified",
  CONVERTED: "Converted",
  LOST: "Lost",
};

export function LeadDetailView({ leadId }: LeadDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();

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

  // Form state
  const [activityType, setActivityType] =
    React.useState<LeadActivityType>("CALL");
  const [callOutcome, setCallOutcome] =
    React.useState<CallOutcome>("ANSWERED");
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

  // Controlled fields for Lead Status & Assigned Staff with explicit Save Changes button
  const [leadStatusValue, setLeadStatusValue] =
    React.useState<LeadStatus>("NEW");
  const [assignedStaffId, setAssignedStaffId] = React.useState<string>("");
  const [isSavingLeadDetails, setIsSavingLeadDetails] = React.useState(false);
  const [detailsSuccessMsg, setDetailsSuccessMsg] = React.useState<
    string | null
  >(null);
  const [detailsErrorMsg, setDetailsErrorMsg] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    if (lead) {
      setLeadStatusValue(lead.status);
      setAssignedStaffId(lead.assignedToId || "");
    }
  }, [lead?.status, lead?.assignedToId]);

  const hasLeadDetailsChanged =
    Boolean(lead) &&
    (leadStatusValue !== lead?.status ||
      assignedStaffId !== (lead?.assignedToId || ""));

  const handleSaveLeadDetails = async () => {
    if (!lead || !hasLeadDetailsChanged) return;
    setIsSavingLeadDetails(true);
    setDetailsSuccessMsg(null);
    setDetailsErrorMsg(null);

    try {
      await updateLead({
        id: leadId,
        data: {
          status: leadStatusValue,
          assignedToId: assignedStaffId || null,
        },
      }).unwrap();
      setDetailsSuccessMsg(
        "Lead status and assigned staff updated successfully!",
      );
      setTimeout(() => setDetailsSuccessMsg(null), 3500);
    } catch (err: any) {
      setDetailsErrorMsg(
        err?.data?.message || err?.message || "Failed to update lead details",
      );
    } finally {
      setIsSavingLeadDetails(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently remove lead "${lead.fullName}"?`,
      )
    ) {
      return;
    }
    try {
      await deleteLead(leadId).unwrap();
      router.push("/leads");
    } catch (err: any) {
      alert(err?.data?.message || "Failed to delete lead");
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
    } catch (err: any) {
      setFormError(
        err?.data?.message || err?.message || "Failed to save activity log",
      );
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
          The prospective client lead could not be located or may have been removed.
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
            <h1 className="text-xl sm:text-2xl font-black text-[#0a0a0a] mt-0.5">
              {lead.fullName}
            </h1>
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
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                  statusClass[lead.status] || "bg-slate-100 text-slate-700",
                )}>
                {statusLabel[lead.status] || lead.status}
              </span>
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

              {/* Referral */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#64748B] flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" /> Referral Source
                </span>
                <span className="font-semibold text-[#0a0a0a]">
                  {lead.referralName || "Direct / None"}
                </span>
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
            </div>

            {/* Status & Assignee Controls with Explicit Save Changes Button */}
            <div className="pt-3 border-t border-[#F0ECE6] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1">
                    Change Status
                  </label>
                  <select
                    value={leadStatusValue}
                    disabled={isSavingLeadDetails || isUpdatingLead}
                    onChange={(e) => {
                      setLeadStatusValue(e.target.value as LeadStatus);
                      setDetailsSuccessMsg(null);
                      setDetailsErrorMsg(null);
                    }}
                    className="w-full h-10 px-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-bold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    <option value="NEW">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FOLLOW_UP">Follow-Up Needed</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="LOST">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block mb-1">
                    Assign Staff
                  </label>
                  <select
                    value={assignedStaffId}
                    disabled={isSavingLeadDetails || isUpdatingLead}
                    onChange={(e) => {
                      setAssignedStaffId(e.target.value);
                      setDetailsSuccessMsg(null);
                      setDetailsErrorMsg(null);
                    }}
                    className="w-full h-10 px-2.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]">
                    <option value="">-- Unassigned --</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {detailsSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{detailsSuccessMsg}</span>
                </div>
              )}

              {detailsErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-in fade-in">
                  {detailsErrorMsg}
                </div>
              )}

              <Button
                type="button"
                size="sm"
                disabled={
                  !hasLeadDetailsChanged ||
                  isSavingLeadDetails ||
                  isUpdatingLead
                }
                onClick={handleSaveLeadDetails}
                className="w-full h-10 rounded-xl bg-[#0a0a0a] hover:bg-black text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                {isSavingLeadDetails || isUpdatingLead ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-white" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

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
                    { type: "WHATSAPP", label: "WhatsApp", icon: MessageSquare },
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
                  <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                    Next Follow-Up Date
                  </label>
                  <input
                    type="datetime-local"
                    value={nextFollowUp}
                    onChange={(e) => setNextFollowUp(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#EAE6DF] bg-white text-xs text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                  />
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
                  {isAddingActivity ? "Saving Activity..." : "Save Activity Log"}
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
                    {/* Top Row: Date & Time on left, Activity Badge on right */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F0ECE6]">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#EAE6DF] text-xs font-black text-[#0a0a0a] shadow-2xs font-mono">
                        <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span>{formatExplicitDateTime(act.createdAt)}</span>
                      </div>
                      <div>{getActivityBadge(act)}</div>
                    </div>

                    {/* Next Row: Acting Staff Attribution */}
                    <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                      <span>by</span>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0a0a0a] text-white text-[10px] font-bold shrink-0">
                        {(
                          act.performedByName ||
                          act.performedBy?.name ||
                          "S"
                        )[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-[#0a0a0a]">
                        {act.performedByName ||
                          act.performedBy?.name ||
                          "Staff"}
                      </span>
                    </div>

                    {/* Notes content */}
                    {act.notes && (
                      <p className="text-xs text-[#0a0a0a] leading-relaxed pt-0.5 whitespace-pre-wrap">
                        {act.notes}
                      </p>
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
