"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { ServiceItem, ServiceStatus } from "../types";
import {
  MOCK_SERVICES,
  getMockServices,
  saveMockServices,
  updateMockService,
} from "../mockData";
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  Layers,
  Clock,
  CheckCircle2,
  Users,
  UserPlus,
  RotateCw,
  Download,
  AlertCircle,
  FileText,
  Building2,
  Briefcase,
  Globe,
  DollarSign,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ServiceDetailViewProps {
  serviceId: string;
}

export function ServiceDetailView({ serviceId }: ServiceDetailViewProps) {
  const router = useRouter();

  const [services, setServices] = React.useState<ServiceItem[]>(getMockServices());
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setServices(getMockServices());
  }, []);

  const service = React.useMemo(() => {
    return (
      services.find((s) => s.id === serviceId || s.code === serviceId) ||
      MOCK_SERVICES.find((s) => s.id === serviceId || s.code === serviceId) ||
      null
    );
  }, [services, serviceId]);

  if (!service) {
    return (
      <div className="space-y-6 py-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#64748B]">
          <Briefcase className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[#092244]">
            Service Offering Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
            The requested service program could not be found in the active catalog directory or has been removed.
          </p>
        </div>
        <Button asChild className="rounded-xl bg-[#092244] text-white">
          <Link href={ROUTES.SERVICES}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Service Catalog
          </Link>
        </Button>
      </div>
    );
  }

  const totalPassThrough = service.passThroughFees.reduce(
    (acc, f) => acc + f.amount,
    0
  );

  const handleToggleStatus = () => {
    const nextStatus: ServiceStatus =
      service.status === "Active" ? "Draft" : "Active";
    const updated: ServiceItem = {
      ...service,
      status: nextStatus,
      updatedAt: "Just now",
    };
    updateMockService(updated);
    setServices(getMockServices());
  };

  const handleExportCSV = () => {
    const headers = [
      "Property",
      "Value",
    ];
    const rows = [
      ["Service Code", service.code],
      ["Program Title", service.title],
      ["Category", service.category],
      ["Sub-Category", service.subCategory],
      ["Destination Country", service.destination.country],
      ["Destination Code", service.destination.code],
      ["AdSkill Advisory Fee", `${service.professionalFee} ${service.currency}`],
      ["Total Pass-Through Fees", `${totalPassThrough} ${service.currency}`],
      ["Total Client Cost", `${service.totalClientCost} ${service.currency}`],
      ["Status", service.status],
      ["Estimated Lead Time", service.estimatedLeadTime],
      ["Active Cases", `${service.activeCasesCount}`],
      ["Milestone Preset", service.schedulePreset],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => `"${e[0]}","${e[1]}"`)].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `adskill_service_${service.code.toLowerCase()}_spec.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isActive = service.status === "Active";
  const isDraft = service.status === "Draft";

  return (
    <div className="space-y-6">
      {/* ── 1. TOP BREADCRUMB & BACK NAVIGATION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] shadow-2xs cursor-pointer"
          >
            <Link href={ROUTES.SERVICES}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Service Catalog</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
              Service Offering Dossier
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Management</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.SERVICES}
                className="hover:text-[#092244] transition-colors"
              >
                Service Catalog
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#092244] font-bold">{service.title}</span>
            </div>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-2 border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#64748B]" />
            <span>Export Spec</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className="h-10 px-3.5 rounded-xl text-xs font-bold gap-2 border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] cursor-pointer"
          >
            <RotateCw className="h-3.5 w-3.5 text-[#D97706]" />
            <span>Switch to {isActive ? "Draft" : "Active"}</span>
          </Button>

          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold gap-2 shadow-xs cursor-pointer"
          >
            <Link href={ROUTES.CLIENT_CREATE}>
              <UserPlus className="h-4 w-4 text-[#F3A712]" />
              <span>Enroll Client Case</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── 2. HERO PROGRAM PROFILE BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="flex h-18 w-18 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-3xl bg-[#FAF8F5] border-2 border-[#EAE6DF] text-3xl sm:text-4xl shadow-xs">
              {service.destination.flag}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#092244] tracking-tight">
                  {service.title}
                </h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase",
                    isActive &&
                      "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
                    isDraft &&
                      "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
                    service.status === "Archived" &&
                      "bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isActive && "bg-[#059669]",
                      isDraft && "bg-[#D97706]",
                      service.status === "Archived" && "bg-[#64748B]"
                    )}
                  />
                  {service.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B] font-medium">
                <span className="font-mono font-bold text-[#092244] bg-[#FAF8F5] px-2.5 py-0.5 rounded-lg border border-[#EAE6DF]">
                  Code: {service.code}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-[#092244]">
                  <Globe className="h-3.5 w-3.5 text-[#0284C7]" />
                  {service.destination.country} ({service.destination.code})
                </span>
                <span>•</span>
                <span>Category: {service.category}</span>
                <span>•</span>
                <span className="text-[#059669] font-semibold">
                  {service.subCategory}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#F0ECE6] pt-4 md:pt-0 md:pl-6 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#94A3B8] block">
                Total Contracted Cost
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[#092244] block">
                ${service.totalClientCost.toLocaleString()}{" "}
                <span className="text-xs font-bold text-[#64748B]">
                  {service.currency}
                </span>
              </span>
              <span className="text-[11px] font-semibold text-[#059669]">
                ${service.professionalFee.toLocaleString()} Advisory + $
                {totalPassThrough.toLocaleString()} Pass-thru
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TWO COLUMN DOSSIER DETAILS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope, Fee Architecture & Milestones (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Program Scope & Description */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0ECE6]">
              <FileText className="h-4 w-4 text-[#092244]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                Program Scope &amp; Legal Description
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed bg-[#FAF8F5] p-4.5 rounded-2xl border border-[#EAE6DF]">
              {service.description}
            </p>
          </div>

          {/* Strict Fee Separation Architecture (Spec Section 5 & 20) */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 text-[#059669]" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                    Deterministic Fee Separation Breakdown
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Governed by AdSkill Advisory Accounting Rules (Spec Section 5 &amp; 20)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#059669] bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#A7F3D0]">
                Strict Segregation
              </span>
            </div>

            {/* 3 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#065F46] block">
                  AdSkill Professional Fee
                </span>
                <span className="text-xl font-black text-[#065F46] mt-0.5 block font-mono">
                  ${service.professionalFee.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-[#059669]">
                    {service.currency}
                  </span>
                </span>
                <span className="text-[10px] text-[#059669] font-semibold mt-1 block">
                  ✓ Recognized Firm Revenue
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E40AF] block">
                  Third-Party Pass-Through
                </span>
                <span className="text-xl font-black text-[#1E40AF] mt-0.5 block font-mono">
                  ${totalPassThrough.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-[#2563EB]">
                    {service.currency}
                  </span>
                </span>
                <span className="text-[10px] text-[#2563EB] font-semibold mt-1 block">
                  * Escrow / Non-Revenue Item
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                  Total Client Commitment
                </span>
                <span className="text-xl font-black text-[#092244] mt-0.5 block font-mono">
                  ${service.totalClientCost.toLocaleString()}{" "}
                  <span className="text-xs font-bold text-[#64748B]">
                    {service.currency}
                  </span>
                </span>
                <span className="text-[10px] text-[#64748B] font-semibold mt-1 block">
                  Full Contract Package
                </span>
              </div>
            </div>

            {/* Regulatory Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#92400E] leading-relaxed">
                <strong>Accounting Governance Rule:</strong> Pass-through expenses are strictly non-revenue fiduciary disbursements payable to government authorities (USCIS, Home Office, IRCC) and partner vendors (attorneys, evaluators, translators). They do not factor into AdSkill margin computations.
              </p>
            </div>

            {/* Itemized Pass-Through Fee Table */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                Itemized Third-Party Pass-Through Disbursements ({service.passThroughFees.length} Items)
              </span>

              {service.passThroughFees.length > 0 ? (
                <div className="divide-y divide-[#F0ECE6] border border-[#EAE6DF] rounded-2xl overflow-hidden bg-white">
                  {service.passThroughFees.map((pt) => (
                    <div
                      key={pt.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#FAF8F5]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-[#092244]">
                            {pt.name}
                          </span>
                          <span className="text-[10px] font-semibold text-[#64748B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE6DF]">
                            {pt.category}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded",
                              pt.isMandatory
                                ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                                : "bg-[#FAF8F5] text-[#64748B] border border-[#EAE6DF]"
                            )}
                          >
                            {pt.isMandatory ? "Mandatory" : "Optional Add-on"}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          Payable recipient:{" "}
                          <strong className="text-[#092244]">
                            {pt.payableTo}
                          </strong>
                        </div>
                        {pt.description && (
                          <div className="text-[11px] text-[#94A3B8]">
                            {pt.description}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-sm text-[#092244]">
                          ${pt.amount.toLocaleString()} {service.currency}
                        </span>
                        <span className="text-[10px] text-[#64748B] block mt-0.5">
                          Disbursement amount
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] text-center text-xs text-[#64748B]">
                  No pass-through disbursements configured for this offering.
                </div>
              )}
            </div>
          </div>

          {/* Default Milestone Phases Schedule */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE6]">
              <div className="flex items-center gap-2.5">
                <Layers className="h-5 w-5 text-[#092244]" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                    Default Milestone Payment Architecture
                  </h3>
                  <span className="text-[11px] text-[#64748B]">
                    Standard advisory billing schedule applied to new client contracts
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#092244] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE6DF] capitalize">
                Preset: {service.schedulePreset.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {service.defaultMilestones.map((ms, idx) => (
                <div
                  key={ms.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
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
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-normal pt-1 border-t border-[#EAE6DF]/60">
                    <strong>Trigger:</strong> {ms.triggerEvent}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Checklist */}
          {service.eligibilityChecklist && service.eligibilityChecklist.length > 0 && (
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
                <CheckCircle2 className="h-5 w-5 text-[#059669]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                  Intake &amp; Client Eligibility Criteria
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.eligibilityChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] flex items-start gap-2.5 text-xs text-[#475569]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Specifications & Admin Metadata (1 col) */}
        <div className="space-y-6">
          {/* Quick Specifications Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] pb-2 border-b border-[#F0ECE6]">
              Program Specifications
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Destination:</span>
                <span className="font-bold text-[#092244] flex items-center gap-1.5">
                  <span>{service.destination.flag}</span>
                  <span>{service.destination.country}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">ISO Country Code:</span>
                <span className="font-mono font-bold text-[#092244]">
                  {service.destination.code}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Advisory Category:</span>
                <span className="font-bold text-[#092244]">
                  {service.category}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Estimated Lead Time:</span>
                <span className="font-bold text-[#092244] flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#F3A712]" />
                  <span>{service.estimatedLeadTime}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Active Enrolled Cases:</span>
                <span className="font-mono font-black text-[#0284C7] bg-[#EFF6FF] px-2 py-0.5 rounded-md">
                  {service.activeCasesCount} Cases
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Currency:</span>
                <span className="font-mono font-bold text-[#092244]">
                  {service.currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Created:</span>
                <span className="text-[#64748B]">{service.createdAt}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B]">Last Updated:</span>
                <span className="text-[#64748B]">{service.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Quick Client Onboarding CTA Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                Direct Case Onboarding
              </span>
              <h4 className="text-sm font-black text-[#092244]">
                Enroll Client Under {service.code}
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Launch client case onboarding with pre-filled program codes, default fee segregation, and milestone presets.
              </p>
            </div>

            <Button
              asChild
              className="w-full h-11 rounded-2xl bg-[#092244] text-white hover:bg-[#071933] font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              <Link href={ROUTES.CLIENT_CREATE}>
                <UserPlus className="h-4 w-4 text-[#F3A712]" />
                <span>Open Client Onboarding Wizard</span>
              </Link>
            </Button>
          </div>

          {/* Internal Notes Card */}
          {service.internalNotes && (
            <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] block">
                Internal Advisory Notes
              </span>
              <p className="text-xs text-[#475569] leading-relaxed italic bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE6DF]">
                &ldquo;{service.internalNotes}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
