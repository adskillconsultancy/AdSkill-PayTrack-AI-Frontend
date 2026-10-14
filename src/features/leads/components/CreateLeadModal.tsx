"use client";

import * as React from "react";
import { X, UserPlus, Sparkles, Building, Phone, Mail, MapPin, Globe, Share2, UserCheck, Shield, Calendar } from "lucide-react";
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
    fullName: "",
    phone: "",
    email: "",
    address: "",
    country: "",
    serviceId: "",
    referralName: "",
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
      await createLead({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        country: formData.country.trim() || undefined,
        serviceId: formData.serviceId || undefined,
        referralName: formData.referralName.trim() || undefined,
        status: formData.status,
        assignedToId: formData.assignedToId || undefined,
        nextFollowUpDate: formData.nextFollowUpDate ? new Date(formData.nextFollowUpDate).toISOString() : undefined,
      }).unwrap();

      const createdName = formData.fullName.trim();

      // Reset & close
      setFormData({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        country: "",
        serviceId: "",
        referralName: "",
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
                Referral Name / Source
              </label>
              <input
                type="text"
                value={formData.referralName}
                onChange={(e) =>
                  setFormData({ ...formData, referralName: e.target.value })
                }
                placeholder="e.g. Facebook Ad, John Doe, WhatsApp"
                className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Row 5: Assign To Staff & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                <Shield className="h-3.5 w-3.5 text-amber-600" />
                Assign To Staff <span className="text-[10px] text-muted-foreground">(Optional / Can be null)</span>
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
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FOLLOW_UP">Follow-Up Needed</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
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
