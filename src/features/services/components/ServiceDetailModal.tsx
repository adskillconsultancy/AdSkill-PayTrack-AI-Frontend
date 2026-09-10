"use client";

import * as React from "react";
import Link from "next/link";
import { ServiceItem } from "../types";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import {
  X,
  Briefcase,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  Users,
  Building,
  UserPlus,
  Info,
} from "lucide-react";

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailModal({
  service,
  isOpen,
  onClose,
}: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  const totalPassThrough = service.passThroughFees.reduce(
    (acc, f) => acc + f.amount,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-[#EAE6DF] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0ECE6] bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#092244] text-[#F3A712] shadow-2xs font-black text-sm">
              {service.destination.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#092244] tracking-tight">
                  {service.title}
                </h3>
                <span className="text-[10px] font-mono font-black text-[#64748B] bg-white px-2 py-0.5 rounded-md border border-[#EAE6DF]">
                  {service.code}
                </span>
                <span className="text-[10px] font-extrabold text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-md">
                  {service.status}
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                {service.subCategory} • {service.destination.country}
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

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Service Overview */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
              Program Scope & Overview
            </span>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE6DF]">
              {service.description}
            </p>
          </div>

          {/* Strict Fee Separation Architecture (Section 5 Spec) */}
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <Shield className="h-4.5 w-4.5 text-[#059669]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#092244]">
                  Regulatory Fee Separation Breakdown
                </span>
              </div>
              <span className="text-[10px] font-extrabold text-[#64748B] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">
                Specification Section 5
              </span>
            </div>

            {/* Fee summary pill cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#065F46] block">
                  AdSkill Advisory Fee
                </span>
                <span className="text-lg font-black text-[#065F46] mt-0.5 block">
                  ${service.professionalFee.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-[#059669]">
                    {service.currency}
                  </span>
                </span>
                <span className="text-[10px] text-[#059669] font-semibold mt-1 block">
                  ✓ Recognized Firm Revenue
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E40AF] block">
                  Pass-Through Third-Party
                </span>
                <span className="text-lg font-black text-[#1E40AF] mt-0.5 block">
                  ${totalPassThrough.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-[#2563EB]">
                    {service.currency}
                  </span>
                </span>
                <span className="text-[10px] text-[#2563EB] font-semibold mt-1 block">
                  * Zero AdSkill Margin (Escrow)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                  Total Client Cost
                </span>
                <span className="text-lg font-black text-[#092244] mt-0.5 block">
                  ${service.totalClientCost.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-[#64748B]">
                    {service.currency}
                  </span>
                </span>
                <span className="text-[10px] text-[#64748B] font-semibold mt-1 block">
                  Complete Contracted Package
                </span>
              </div>
            </div>

            {/* Itemized Pass-Through Fees List */}
            {service.passThroughFees.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                  Itemized Third-Party Pass-Through Costs
                </span>
                <div className="divide-y divide-[#F0ECE6] border border-[#EAE6DF] rounded-xl overflow-hidden">
                  {service.passThroughFees.map((pt) => (
                    <div
                      key={pt.id}
                      className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#092244]">
                            {pt.name}
                          </span>
                          <span className="text-[10px] font-semibold text-[#64748B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE6DF]">
                            {pt.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748B]">
                          Payable to: <strong>{pt.payableTo}</strong>
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-sm text-[#092244]">
                          ${pt.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] block text-[#64748B]">
                          {pt.isMandatory ? "Mandatory" : "Optional Add-on"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Default Milestone Phases Schedule */}
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#092244]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#092244]">
                  Default Milestone Schedule Architecture
                </span>
              </div>
              <span className="text-xs font-bold text-[#64748B]">
                Preset: {service.schedulePreset.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {service.defaultMilestones.map((ms, idx) => (
                <div
                  key={ms.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8]">
                      Phase {idx + 1} ({ms.percentage}%)
                    </span>
                    {ms.amount && (
                      <span className="text-xs font-mono font-black text-[#092244]">
                        ${ms.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#092244] block">
                    {ms.name}
                  </span>
                  <p className="text-[11px] text-[#64748B] leading-normal">
                    {ms.triggerEvent}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Program Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                Estimated Case Lead Time
              </span>
              <div className="flex items-center gap-2 text-sm font-black text-[#092244]">
                <Clock className="h-4 w-4 text-[#F3A712]" />
                <span>{service.estimatedLeadTime}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                Active Enrolled Cases
              </span>
              <div className="flex items-center gap-2 text-sm font-black text-[#092244]">
                <Users className="h-4 w-4 text-[#0284C7]" />
                <span>{service.activeCasesCount} Active Applicants</span>
              </div>
            </div>
          </div>

          {/* Eligibility Checklist */}
          {service.eligibilityChecklist.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#64748B] block">
                Intake &amp; Eligibility Criteria
              </span>
              <div className="space-y-1.5">
                {service.eligibilityChecklist.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-[#475569] p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#F0ECE6] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#64748B]">
            Service Code:{" "}
            <strong className="text-[#092244] font-mono">{service.code}</strong>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 px-5 rounded-xl border-[#EAE6DF] text-xs font-bold text-[#64748B] hover:text-[#092244] cursor-pointer"
            >
              Close
            </Button>
            <Button
              asChild
              className="h-11 px-6 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold gap-2 cursor-pointer"
            >
              <Link href={ROUTES.CLIENT_CREATE}>
                <UserPlus className="h-4 w-4 text-[#F3A712]" />
                <span>Onboard Client for this Service</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
