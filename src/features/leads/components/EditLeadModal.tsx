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
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useUpdateLeadMutation } from "@/services/api/leads/leadsApi";
import type { BackendLead, LeadStatus } from "../types";

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
  const [updateLead, { isLoading }] = useUpdateLeadMutation();

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
  });

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Sync initial form data when opened
  React.useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        fullName: lead.fullName || "",
        phone: lead.phone || "",
        email: lead.email || "",
        address: lead.address || "",
        country: lead.country || "",
        serviceId: lead.serviceId || "",
        referralName: lead.referralName || "",
        status: lead.status || "NEW",
        assignedToId: lead.assignedToId || "",
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
      await updateLead({
        id: lead.id,
        data: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim() ? formData.email.trim() : null,
          address: formData.address.trim() ? formData.address.trim() : null,
          country: formData.country.trim() ? formData.country.trim() : null,
          serviceId: formData.serviceId ? formData.serviceId : null,
          referralName: formData.referralName.trim()
            ? formData.referralName.trim()
            : null,
          status: formData.status,
          assignedToId: formData.assignedToId ? formData.assignedToId : null,
        },
      }).unwrap();

      onSuccess?.();
      onClose();
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
                  <span>Referral Source / Channel</span>
                </label>
                <input
                  type="text"
                  value={formData.referralName}
                  onChange={(e) =>
                    setFormData({ ...formData, referralName: e.target.value })
                  }
                  placeholder="e.g. Google Ads, WhatsApp, Partner"
                  className="w-full h-11 px-3.5 rounded-2xl border border-[#EAE6DF] bg-white text-xs font-semibold text-[#0a0a0a] placeholder:text-slate-400 focus:outline-none focus:border-[#0a0a0a] transition-colors"
                />
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
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="FOLLOW_UP">Follow-Up Needed</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="LOST">Lost</option>
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
