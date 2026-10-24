"use client";

import * as React from "react";
import { X, UserPlus, Sparkles, Building, Phone, Mail, MapPin, Globe, Share2, UserCheck, Shield, Calendar, Flame, FileText, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useCreateLeadMutation } from "@/services/api/leads/leadsApi";
import type { LeadStatus } from "../types";
import { useAuth } from "@/hooks/useAuth";
import { useConfirm } from "@/hooks/useConfirm";

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

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicesList: { id: string; name: string }[];
  staffList: { id: string; name: string; email: string }[];
  onSuccess?: () => void;
}

export function CreateLeadModal({
  isOpen,
  onClose,
  servicesList = [],
  staffList = [],
  onSuccess,
}: CreateLeadModalProps) {
  const { user } = useAuth();
  const { alert } = useConfirm();
  const [createLead, { isLoading }] = useCreateLeadMutation();

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
    resumeUrl: "",
    whatClientWants: "",
    status: "NEW" as LeadStatus,
    assignedToId: "",
    nextFollowUpDate: getPresetIsoString(3),
  });

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

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
      await createLead({
        clientCode: formData.clientCode.trim() || undefined,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        country: formData.country.trim() || undefined,
        serviceId: formData.serviceId || undefined,
        referralName: formData.referralName.trim() || undefined,
        leadSource: formData.leadSource || undefined,
        priority: formData.priority || "MEDIUM",
        profileAssessment: formData.profileAssessment || undefined,
        meetingScheduled: hasMeeting ? "Yes" : (formData.meetingScheduled || undefined),
        meetingDateTime: formData.meetingDateTime ? new Date(formData.meetingDateTime).toISOString() : undefined,
        meetingDateTimeStr: formData.meetingDateTimeStr.trim() || undefined,
        resumeUrl: formData.resumeUrl.trim() || undefined,
        whatClientWants: formData.whatClientWants.trim() || undefined,
        status: formData.status,
        assignedToId: formData.assignedToId || undefined,
        nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString() : undefined,
      }).unwrap();

      const createdName = formData.fullName.trim();

      // Reset & close
      setFormData({
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
        resumeUrl: "",
        whatClientWants: "",
        status: "NEW",
        assignedToId: "",
        nextFollowUpDate: getPresetIsoString(3),
      });
      onSuccess?.();
      onClose();

      await alert({
        title: "Lead Created Successfully",
        message: `Prospective lead "${createdName}" has been added to the CRM pipeline.`,
        variant: "success",
      });
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || err?.message || "Failed to create lead. Please check your inputs.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border/80 bg-card p-6 shadow-2xl z-10 animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Create New Lead
              </h2>
              <p className="text-xs text-muted-foreground">
                Capture prospective client information, select service, and assign to staff.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Row 1: Full Name & Phone/WhatsApp (Required) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="e.g. Alex Johnson"
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                Phone / WhatsApp Number <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="e.g. +1 (555) 000-1234"
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Row 2: Email & Country */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                Email Address <span className="text-[10px] text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="alex.johnson@example.com"
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Country <span className="text-[10px] text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="e.g. United States, Bangladesh, Canada"
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Row 3: Street Address */}
          <div>
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              Physical Address <span className="text-[10px] text-muted-foreground">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="e.g. 742 Evergreen Terrace, Springfield"
              className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Row 4: Service Interested In & Referral Source */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Building className="h-3.5 w-3.5 text-primary" />
                Service Interested In
              </label>
              <select
                value={formData.serviceId}
                onChange={(e) =>
                  setFormData({ ...formData, serviceId: e.target.value })
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden">
                <option value="">-- Select Service Offering --</option>
                {servicesList.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                Lead Channel / Source
              </label>
              <select
                value={formData.leadSource}
                onChange={(e) =>
                  setFormData({ ...formData, leadSource: e.target.value })
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden">
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

          {/* Row 4.5: Priority & Assessment */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Flame className="h-3.5 w-3.5 text-rose-600" />
                Priority (Morning Queue)
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden">
                <option value="HIGH">High Priority (Urgent Morning Call)</option>
                <option value="MEDIUM">Medium Priority (Standard Follow-up)</option>
                <option value="LOW">Low Priority (General / Inactive)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Profile Assessment
              </label>
              <select
                value={formData.profileAssessment}
                onChange={(e) =>
                  setFormData({ ...formData, profileAssessment: e.target.value })
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden">
                <option value="Strong - Eligible">Strong - Eligible</option>
                <option value="Moderate - Needs More Documentation">Moderate - Needs More Documentation</option>
                <option value="Weak - Not Currently Eligible">Weak - Not Currently Eligible</option>
                <option value="Needs Further Review">Needs Further Review</option>
                <option value="Pending Evaluation">Pending Evaluation</option>
              </select>
            </div>
          </div>

          {/* Row 4.6: Google Drive Link & Consultation Meeting */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-600" />
                Google Drive Resume / Portfolio Link
              </label>
              <input
                type="url"
                value={formData.resumeUrl}
                onChange={(e) =>
                  setFormData({ ...formData, resumeUrl: e.target.value })
                }
                placeholder="https://drive.google.com/..."
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Meeting Date & Time Picker */}
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-sky-600" />
                  <span>Meeting Date & Time</span>
                  <span className="text-[10px] font-normal text-muted-foreground">(Scheduled Consultation)</span>
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
              <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                <span className="text-[11px] font-medium text-muted-foreground mr-0.5">Quick Pick:</span>
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
                  className="rounded-lg border border-border/70 bg-background hover:bg-sky-500/10 hover:border-sky-500/40 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
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
                  className="rounded-lg border border-border/70 bg-background hover:bg-sky-500/10 hover:border-sky-500/40 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
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
                  className="rounded-lg border border-border/70 bg-background hover:bg-sky-500/10 hover:border-sky-500/40 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
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
                  className="rounded-lg border border-border/70 bg-background hover:bg-sky-500/10 hover:border-sky-500/40 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
                  In 4 Days 3 PM
                </button>
              </div>

              {/* Date & Time Picker Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                    className="w-full rounded-xl border border-border/80 bg-background pl-10 pr-3.5 py-2 text-xs font-semibold text-foreground focus:border-primary focus:outline-hidden cursor-pointer hover:border-sky-500/50 transition-colors"
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
                  className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Staff will automatically receive automated 4-day & day-of meeting reminders for scheduled consultations.
              </p>
            </div>
          </div>

          {/* Row 5: Assign To Staff & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-600" />
                Assign To Staff <span className="text-[10px] text-muted-foreground">(Optional)</span>
              </label>
              <select
                value={formData.assignedToId}
                onChange={(e) =>
                  setFormData({ ...formData, assignedToId: e.target.value })
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden">
                <option value="">-- Leave Unassigned --</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Initial Lead Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as LeadStatus,
                  })
                }
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden">
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
          </div>

          {/* Row 5.5: What Client Wants */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              What Client Wants
            </label>
            <textarea
              rows={2}
              value={formData.whatClientWants}
              onChange={(e) =>
                setFormData({ ...formData, whatClientWants: e.target.value })
              }
              placeholder="Brief summary of client's goal or inquiry..."
              className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          {/* Row 6: Automated Follow-Up Reminder & Quick Presets */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Next Follow-Up Reminder
                <span className="text-[10px] text-muted-foreground font-normal">
                  (Auto-reminds assigned staff)
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
                  className="rounded-lg border border-border/80 bg-background hover:bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
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
                  className="rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary transition-colors cursor-pointer">
                  +3 Days (Default)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      nextFollowUpDate: getPresetIsoString(7),
                    })
                  }
                  className="rounded-lg border border-border/80 bg-background hover:bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors cursor-pointer">
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById(
                      "create-lead-followup-input",
                    ) as HTMLInputElement;
                    if (input) {
                      input.focus();
                      input.showPicker?.();
                    }
                  }}
                  className="rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary hover:text-white px-2 py-0.5 text-[11px] font-bold text-primary transition-colors cursor-pointer flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5" />
                  Custom Date
                </button>
                {formData.nextFollowUpDate && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, nextFollowUpDate: "" })
                    }
                    className="rounded-lg border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-destructive cursor-pointer">
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex items-center">
              <Calendar className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="create-lead-followup-input"
                type="datetime-local"
                value={formData.nextFollowUpDate}
                onClick={(e) => (e.target as any).showPicker?.()}
                onChange={(e) =>
                  setFormData({ ...formData, nextFollowUpDate: e.target.value })
                }
                className="w-full rounded-xl border border-border/80 bg-background pl-10 pr-3.5 py-2 text-xs font-medium text-foreground focus:border-primary focus:outline-hidden cursor-pointer hover:border-primary/50 transition-colors"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Staff will receive an automatic in-app notification and lead will appear in the Follow-Up Queue.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl px-5">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold shadow-md">
              {isLoading ? "Saving Lead..." : "Save Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
