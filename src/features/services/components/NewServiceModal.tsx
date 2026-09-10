"use client";

import * as React from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ServiceItem, ServiceCategory, ServiceStatus } from "../types";
import { X, Briefcase, Plus } from "lucide-react";

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (service: ServiceItem) => void;
}

export function NewServiceModal({
  isOpen,
  onClose,
  onSubmit,
}: NewServiceModalProps) {
  const [code, setCode] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [subCategory, setSubCategory] = React.useState("");
  const [category, setCategory] = React.useState<ServiceCategory>("Employment Immigration");
  const [country, setCountry] = React.useState("United States");
  const [countryCode, setCountryCode] = React.useState("US");
  const [flag, setFlag] = React.useState("🇺🇸");
  const [professionalFee, setProfessionalFee] = React.useState("5000");
  const [passThroughEstimate, setPassThroughEstimate] = React.useState("1000");
  const [status, setStatus] = React.useState<ServiceStatus>("Active");

  if (!isOpen) return null;

  const handleCountryChange = (c: string) => {
    setCountry(c);
    if (c === "Canada") {
      setCountryCode("CA");
      setFlag("🇨🇦");
    } else if (c === "United Kingdom") {
      setCountryCode("GB");
      setFlag("🇬🇧");
    } else if (c === "Australia") {
      setCountryCode("AU");
      setFlag("🇦🇺");
    } else if (c === "United States") {
      setCountryCode("US");
      setFlag("🇺🇸");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    const baseFeeNum = Number(professionalFee) || 5000;
    const ptNum = Number(passThroughEstimate) || 1000;

    const newService: ServiceItem = {
      id: Date.now().toString(),
      code: code.trim().toUpperCase(),
      title: title.trim(),
      subCategory: subCategory.trim() || "General Processing",
      category: category,
      description: `Official AdSkill legal advisory program for ${title.trim()} (${country}).`,
      destination: {
        code: countryCode,
        country: country,
        flag: flag,
      },
      professionalFee: baseFeeNum,
      passThroughFees: [
        {
          id: `pt-${Date.now()}-1`,
          name: "Government Statutory Filing Fee",
          category: "USCIS & Government",
          amount: ptNum,
          isMandatory: true,
          payableTo: "Department of Immigration / Government",
        },
      ],
      totalClientCost: baseFeeNum + ptNum,
      currency: countryCode === "CA" ? "CAD" : countryCode === "GB" ? "GBP" : countryCode === "AU" ? "AUD" : "USD",
      schedulePreset: "deposit_2_milestones",
      defaultMilestones: [
        {
          id: "m1",
          name: "Intake & Retainer Setup",
          percentage: 50,
          amount: Math.round(baseFeeNum * 0.5),
          triggerEvent: "Upon contract execution",
        },
        {
          id: "m2",
          name: "Final Case Submission",
          percentage: 50,
          amount: baseFeeNum - Math.round(baseFeeNum * 0.5),
          triggerEvent: "Dispatched to government authorities",
        },
      ],
      activeCasesCount: 0,
      status: status,
      eligibilityChecklist: [
        "Verified applicant credential eligibility",
        "Signed retainer agreement and compliance consent",
      ],
      estimatedLeadTime: "4 - 8 Months",
      createdAt: "Just now",
      updatedAt: "Just now",
    };

    onSubmit(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-[#EAE6DF] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0ECE6] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#092244] text-[#F3A712] shadow-2xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#092244] tracking-tight">
                Add New Service Offering
              </h3>
              <p className="text-xs text-[#64748B]">
                Create a catalog program with fee separation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#94A3B8] hover:text-[#092244] hover:bg-white border border-transparent hover:border-[#EAE6DF] transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#092244]">
                Program Code *
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SRV-EB2-NIW"
                required
                className="h-10 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#092244]">
                Destination Country *
              </label>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="United States">🇺🇸 United States</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="United Kingdom">🇬🇧 United Kingdom</option>
                <option value="Australia">🇦🇺 Australia</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#092244]">
              Service Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. EB-2 NIW (National Interest Waiver)"
              required
              className="h-10 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#092244]">
                Sub-Category *
              </label>
              <Input
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Exceptional Ability"
                required
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#092244]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-10 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="Employment Immigration">Employment Immigration</option>
                <option value="Priority & Talent">Priority & Talent</option>
                <option value="Permanent Residency">Permanent Residency</option>
                <option value="Investor & Corporate">Investor & Corporate</option>
                <option value="Corporate Advisory">Corporate Advisory</option>
                <option value="Family & Dependent">Family & Dependent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#065F46]">
                AdSkill Advisory Fee ($) *
              </label>
              <Input
                type="number"
                value={professionalFee}
                onChange={(e) => setProfessionalFee(e.target.value)}
                placeholder="6500"
                required
                className="h-10 text-xs font-mono font-bold bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
              />
              <span className="text-[10px] text-[#059669] font-medium block">
                Recognized firm revenue
              </span>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#1E40AF]">
                Pass-Through Cost ($)
              </label>
              <Input
                type="number"
                value={passThroughEstimate}
                onChange={(e) => setPassThroughEstimate(e.target.value)}
                placeholder="1000"
                className="h-10 text-xs font-mono font-bold bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]"
              />
              <span className="text-[10px] text-[#2563EB] font-medium block">
                Third-party non-revenue
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F0ECE6]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-5 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#092244]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold gap-2"
            >
              <Plus className="h-4 w-4 text-[#F3A712]" />
              <span>Save Service</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
