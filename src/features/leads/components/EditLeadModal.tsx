"use client";

import * as React from "react";
import {
  X,
  Pencil,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Share2,
  UserCheck,
  Shield,
  Loader2,
  Calendar,
  Flame,
  FileText,
  CheckCircle2,
  Clock,
  Upload,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useUpdateLeadMutation, useUploadLeadDocumentsMutation } from "@/services/api/leads/leadsApi";
import { useConfirm } from "@/hooks/useConfirm";
import type { BackendLead, LeadStatus } from "../types";

const getPresetIsoString = (daysAhead: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const getMeetingPreset = (daysAhead: number, hour = 14) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatMeetingDisplay = (isoLocalStr: string) => {
  if (!isoLocalStr) return "";
  try {
    const d = new Date(isoLocalStr);
    if (isNaN(d.getTime())) return isoLocalStr;
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoLocalStr;
  }
};

const formatInitialDate = (isoStr?: string | null) => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
};

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: BackendLead;
  servicesList: { id: string; name: string }[];
  staffList: { id: string; name: string; email: string }[];
  onSuccess?: () => void;
}

export function EditLeadModal({
  isOpen,
  onClose,
  lead,
  servicesList = [],
  staffList = [],
  onSuccess,
}: EditLeadModalProps) {
  const { alert } = useConfirm();
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const [uploadLeadDocs] = useUploadLeadDocumentsMutation();

  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);

  const [formData, setFormData] = React.useState({
    clientCode: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    serviceId: "",
    referralName: "",
    leadSource: "WhatsApp",
    priority: "MEDIUM",
    profileAssessment: "Pending Evaluation",
    meetingScheduled: "No",
    meetingDateTime: "",
    meetingDateTimeStr: "",
    whatClientWants: "",
    evaluationNotes: "",
    remarks: "",
    status: "NEW" as LeadStatus,
    assignedToId: "",
    nextFollowUpDate: "",
  });

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync initial form data when opened
  React.useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        clientCode: lead.clientCode || "",
        fullName: lead.fullName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        address: lead.address || "",
        country: lead.country || "",
        serviceId: lead.serviceId || "",
        referralName: lead.referralName || "",
        leadSource: lead.leadSource || "WhatsApp",
        priority: lead.priority || "MEDIUM",
        profileAssessment: lead.profileAssessment || "Pending Evaluation",
        meetingScheduled: lead.meetingScheduled || (lead.meetingDateTime || lead.meetingDateTimeStr ? "Yes" : "No"),
        meetingDateTime: formatInitialDate(lead.meetingDateTime),
        meetingDateTimeStr: lead.meetingDateTimeStr || "",
        whatClientWants: lead.whatClientWants || "",
        evaluationNotes: lead.evaluationNotes || "",
        remarks: lead.remarks || "",
        status: lead.status || "NEW",
        assignedToId: lead.assignedToId || "",
        nextFollowUpDate: formatInitialDate(lead.nextFollowUpDate),
      });
      setErrorMessage(null);
    }
  }, [lead, isOpen]);

  // Handle escape key
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Phone / WhatsApp number is required.");
      return;
    }

    try {
      const hasMeeting = Boolean(formData.meetingDateTime || formData.meetingDateTimeStr.trim());
      await updateLead({
        id: lead.id,
        data: {
          clientCode: formData.clientCode.trim() ? formData.clientCode.trim() : null,
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() ? formData.email.trim() : null,
          address: formData.address.trim() ? formData.address.trim() : null,
          country: formData.country.trim() ? formData.country.trim() : null,
          serviceId: formData.serviceId ? formData.serviceId : null,
          referralName: formData.referralName.trim()
            ? formData.referralName.trim()
            : null,
          leadSource: formData.leadSource || null,
          priority: formData.priority || "MEDIUM",
          profileAssessment: formData.profileAssessment || null,
          meetingScheduled: hasMeeting ? "Yes" : (formData.meetingScheduled || null),
          meetingDateTime: formData.meetingDateTime ? new Date(formData.meetingDateTime).toISOString() : null,
          meetingDateTimeStr: formData.meetingDateTimeStr.trim() ? formData.meetingDateTimeStr.trim() : null,
          whatClientWants: formData.whatClientWants.trim() ? formData.whatClientWants.trim() : null,
          evaluationNotes: formData.evaluationNotes.trim() ? formData.evaluationNotes.trim() : null,
          remarks: formData.remarks.trim() ? formData.remarks.trim() : null,
          assignedToId: formData.assignedToId ? formData.assignedToId : null,
          nextFollowUpDate: formData.nextFollowUpDate
            ? new Date(formData.nextFollowUpDate).toISOString()
            : null,
        },
      }).unwrap();

      // If additional files selected, upload them to the lead
      if (selectedFiles.length > 0) {
        try {
          const fd = new FormData();
          selectedFiles.forEach((file) => fd.append("files", file));
          fd.append("documentType", "SUPPORTING");
          await uploadLeadDocs({ leadId: lead.id, formData: fd }).unwrap();
        } catch (uploadErr) {
          console.error("Document upload after lead update failed:", uploadErr);
        }
      }

      setSelectedFiles([]);
      onSuccess?.();
      onClose();

      await alert({
        title: "Lead Updated Successfully",
        message: `Lead details for "${formData.fullName.trim()}" have been saved.`,
        variant: "success",
      });
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Failed to update lead information.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-[#EAE6DF] overflow-hidden z-10 my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F0ECE6] px-6 py-5 bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0a0a0a] text-white shadow-xs">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0a0a0a]">
                Edit Lead Information
              </h2>
              <p className="text-xs text-[#64748B]">
                Update contact dossier, service interest, and workflow tags.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl p-2 text-slate-400 hover:bg-[#F1ECE4] hover:text-[#0a0a0a] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
            {errorMessage && (
              <div className="rounded-2xl bg-[#FEF2F2] border border-[#FECACA] p-4 text-xs font-semibold text-[#B91C1C]">
                {errorMessage}
              </div>
            )}

            {/* 1. Full Name & Phone (Required) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g. Johnathan Doe"
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Phone / WhatsApp Number</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a] transition-colors font-mono"
                />
              </div>
            </div>

            {/* 2. Email & Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john.doe@example.com"
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>Country</span>
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g. United Kingdom"
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a] transition-colors"
                />
              </div>
            </div>

            {/* 3. Address */}
            <div>
              <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Physical Address / City</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="e.g. 124 Oxford St, London, W1D 1LT"
                className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a] transition-colors"
              />
            </div>

            {/* 4. Service Selection & Referral */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <span>Interested Service</span>
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceId: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                >
                  <option value="">-- None / General Inquiry --</option>
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Lead Channel / Source</span>
                </label>
                <select
                  value={formData.leadSource}
                  onChange={(e) =>
                    setFormData({ ...formData, leadSource: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Facebook/Instagram Ads">Facebook/Instagram Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Cold Email Campaign">Cold Email Campaign</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Website">Website</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Priority & Assessment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0ECE6]">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-rose-600" />
                  <span>Priority Level</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-bold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                >
                  <option value="HIGH">High Priority (Urgent Morning Call)</option>
                  <option value="MEDIUM">Medium Priority (Standard Follow-up)</option>
                  <option value="LOW">Low Priority (General / Inactive)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Profile Assessment (Eligibility)</span>
                </label>
                <select
                  value={formData.profileAssessment}
                  onChange={(e) =>
                    setFormData({ ...formData, profileAssessment: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                >
                  <option value="Strong - Eligible">Strong - Eligible</option>
                  <option value="Moderate - Needs More Documentation">Moderate - Needs More Documentation</option>
                  <option value="Weak - Not Currently Eligible">Weak - Not Currently Eligible</option>
                  <option value="Needs Further Review">Needs Further Review</option>
                  <option value="Pending Evaluation">Pending Evaluation</option>
                </select>
              </div>
            </div>

            {/* Meeting Date & Time Picker */}
            <div className="grid grid-cols-1 gap-4 pt-2 border-t border-[#F0ECE6]">
              {/* Meeting Date & Time Picker */}
              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-[#0a0a0a] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky-600" />
                    <span>Meeting Date & Time</span>
                    <span className="text-[10px] font-normal text-slate-500">(Scheduled Consultation)</span>
                  </label>
                  {(formData.meetingDateTime || formData.meetingDateTimeStr) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          meetingDateTime: "",
                          meetingDateTimeStr: "",
                          meetingScheduled: "No",
                        })
                      }
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer">
                      Clear Meeting
                    </button>
                  )}
                </div>

                {/* Quick Pick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="text-[11px] font-medium text-slate-500 mr-0.5">Quick Pick:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const dt = getMeetingPreset(0, 16);
                      setFormData({
                        ...formData,
                        meetingDateTime: dt,
                        meetingDateTimeStr: formatMeetingDisplay(dt),
                        meetingScheduled: "Yes",
                      });
                    }}
                    className="rounded-xl border border-[#EAE6DF] bg-white hover:bg-sky-100 hover:border-sky-300 px-2.5 py-1 text-[11px] font-semibold text-[#0a0a0a] transition-colors cursor-pointer">
                    Today 4 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dt = getMeetingPreset(1, 14);
                      setFormData({
                        ...formData,
                        meetingDateTime: dt,
                        meetingDateTimeStr: formatMeetingDisplay(dt),
                        meetingScheduled: "Yes",
                      });
                    }}
                    className="rounded-xl border border-[#EAE6DF] bg-white hover:bg-sky-100 hover:border-sky-300 px-2.5 py-1 text-[11px] font-semibold text-[#0a0a0a] transition-colors cursor-pointer">
                    Tomorrow 2 PM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dt = getMeetingPreset(2, 11);
                      setFormData({
                        ...formData,
                        meetingDateTime: dt,
                        meetingDateTimeStr: formatMeetingDisplay(dt),
                        meetingScheduled: "Yes",
                      });
                    }}
                    className="rounded-xl border border-[#EAE6DF] bg-white hover:bg-sky-100 hover:border-sky-300 px-2.5 py-1 text-[11px] font-semibold text-[#0a0a0a] transition-colors cursor-pointer">
                    In 2 Days 11 AM
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dt = getMeetingPreset(4, 15);
                      setFormData({
                        ...formData,
                        meetingDateTime: dt,
                        meetingDateTimeStr: formatMeetingDisplay(dt),
                        meetingScheduled: "Yes",
                      });
                    }}
                    className="rounded-xl border border-[#EAE6DF] bg-white hover:bg-sky-100 hover:border-sky-300 px-2.5 py-1 text-[11px] font-semibold text-[#0a0a0a] transition-colors cursor-pointer">
                    In 4 Days 3 PM
                  </button>
                </div>

                {/* Date & Time Picker Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="relative flex items-center">
                    <Calendar className="absolute left-3.5 h-4 w-4 text-sky-600 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={formData.meetingDateTime}
                      onClick={(e) => (e.target as any).showPicker?.()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          meetingDateTime: val,
                          meetingDateTimeStr: val ? formatMeetingDisplay(val) : "",
                          meetingScheduled: val ? "Yes" : "No",
                        });
                      }}
                      className="w-full h-11 pl-10 pr-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-sky-500 cursor-pointer hover:border-sky-400 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.meetingDateTimeStr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        meetingDateTimeStr: e.target.value,
                        meetingScheduled: e.target.value.trim() ? "Yes" : (formData.meetingDateTime ? "Yes" : "No"),
                      })
                    }
                    placeholder="e.g. Saturday, 15 Aug 1:15 PM BST / Zoom"
                    className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a]"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Staff will automatically receive automated 4-day & day-of meeting reminders for scheduled consultations.
                </p>
              </div>
            </div>

            {/* 5. Status & Staff Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0ECE6]">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-slate-400" />
                  <span>Lead Pipeline Status</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as LeadStatus,
                    })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-bold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                >
                  <option value="NEW">New Lead</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="IN_PROGRESS">In Discussion</option>
                  <option value="FOLLOW_UP">Follow-Up Required</option>
                  <option value="DOCUMENTS_PENDING">Documents Pending</option>
                  <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
                  <option value="ENGAGED">Converted - Engaged</option>
                  <option value="CONVERTED">Closed - Won</option>
                  <option value="LOST">Closed - Lost</option>
                  <option value="NOT_INTERESTED">Not Interested</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Assigned Staff Member</span>
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedToId: e.target.value })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* What Client Wants */}
            <div className="pt-2 border-t border-[#F0ECE6]">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  What Client Wants
                </label>
                <textarea
                  rows={3}
                  value={formData.whatClientWants}
                  onChange={(e) =>
                    setFormData({ ...formData, whatClientWants: e.target.value })
                  }
                  placeholder="Inquiry notes..."
                  className="w-full p-3 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-medium text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>
            </div>

            {/* Attached Documents & Add More */}
            <div className="pt-2 border-t border-[#F0ECE6] space-y-2">
              <label className="text-xs font-bold text-[#0a0a0a] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span>Lead Documents ({lead?.documents?.length || 0})</span>
                </span>
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedFiles([])}
                    className="text-[10px] text-rose-500 hover:underline font-normal">
                    Clear Selection
                  </button>
                )}
              </label>

              {/* Existing documents if any */}
              {lead?.documents && lead.documents.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {lead.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs">
                      <span className="truncate max-w-[260px] font-medium text-[#0a0a0a]" title={doc.fileName}>
                        📄 {doc.fileName}
                      </span>
                      {doc.downloadUrl && (
                        <a
                          href={doc.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline font-bold shrink-0 ml-2">
                          View ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload additional files */}
              <div className="p-3 rounded-xl border border-dashed border-[#EAE6DF] bg-[#FAF8F5]/60 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Add New Document(s) to this Lead:
                </span>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setSelectedFiles(Array.from(e.target.files));
                    }
                  }}
                  className="w-full text-xs text-foreground file:mr-2.5 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedFiles.map((f, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-white border border-[#EAE6DF] px-2 py-0.5 rounded-md text-emerald-700 font-medium truncate max-w-[180px]">
                        + {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Evaluation Notes & Remarks */}
            <div className="space-y-3 pt-2 border-t border-[#F0ECE6]">
              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  Evaluation Summary / Draft Assessment
                </label>
                <textarea
                  rows={3}
                  value={formData.evaluationNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, evaluationNotes: e.target.value })
                  }
                  placeholder="Preliminary review findings, quotation details, proposed endeavor..."
                  className="w-full p-3 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-medium text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#0a0a0a] block mb-1.5">
                  Internal Remarks / Notes
                </label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  placeholder="Any internal office remarks..."
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a]"
                />
              </div>
            </div>

            {/* Next Follow-Up Reminder & Quick Presets */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5] p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-bold text-[#0a0a0a] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Next Follow-Up Reminder</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Auto-notifies assigned staff)
                  </span>
                </label>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        nextFollowUpDate: getPresetIsoString(1),
                      })
                    }
                    className="rounded-lg border border-[#EAE6DF] bg-white hover:bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer">
                    +1 Day
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        nextFollowUpDate: getPresetIsoString(3),
                      })
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 transition-colors cursor-pointer">
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        nextFollowUpDate: getPresetIsoString(7),
                      })
                    }
                    className="rounded-lg border border-[#EAE6DF] bg-white hover:bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer">
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        "edit-lead-followup-input",
                      ) as HTMLInputElement;
                      if (input) {
                        input.focus();
                        input.showPicker?.();
                      }
                    }}
                    className="rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-600 hover:text-white px-2 py-0.5 text-[11px] font-bold text-blue-700 transition-colors cursor-pointer flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" />
                    Custom Date
                  </button>
                  {formData.nextFollowUpDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, nextFollowUpDate: "" })
                      }
                      className="rounded-lg border border-[#EAE6DF] px-2 py-0.5 text-[10px] text-muted-foreground hover:text-red-600 cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 h-4 w-4 text-[#64748B] pointer-events-none" />
                <input
                  id="edit-lead-followup-input"
                  type="datetime-local"
                  value={formData.nextFollowUpDate}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  onChange={(e) =>
                    setFormData({ ...formData, nextFollowUpDate: e.target.value })
                  }
                  className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] transition-colors cursor-pointer hover:border-slate-400"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Rescheduling will automatically update the lead in your Follow-Up Queue.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-[#F0ECE6] px-6 py-4 bg-[#FAF8F5]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-2xl h-11 px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="rounded-2xl h-11 px-6 bg-[#0a0a0a] hover:bg-black text-white font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving Updates...
                </>
              ) : (
                "Update Lead"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditLeadModal;
