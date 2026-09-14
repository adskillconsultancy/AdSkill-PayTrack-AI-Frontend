"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useGetServiceByIdQuery,
  useDeleteServiceMutation,
} from "@/services/api/services/servicesApi";
import type { BackendServiceCategory } from "../types";
import {
  ArrowLeft,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  Scale,
  Clock,
  DollarSign,
  Calendar,
  User,
  Trash2,
  FileSpreadsheet,
  AlertCircle,
  FileText,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface ServiceDetailViewProps {
  serviceId: string;
}

export function ServiceDetailView({ serviceId }: ServiceDetailViewProps) {
  const router = useRouter();

  // 🌟 Live Backend Query (100% Real PostgreSQL Data) 🌟
  const {
    data: response,
    isLoading,
    isError,
  } = useGetServiceByIdQuery(serviceId);
  const [deleteServiceMutation, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const service = response?.data;

  // Handle Deletion
  const handleDelete = async () => {
    if (!service) return;
    if (
      !window.confirm(
        `Are you sure you want to deactivate and remove "${service.name}" (${service.code}) from the active catalog?`
      )
    ) {
      return;
    }

    try {
      await deleteServiceMutation(service.id).unwrap();
      router.push(ROUTES.SERVICES);
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message || "Failed to delete service"
          : "Failed to delete service";
      alert(msg);
    }
  };

  const renderCategoryBadge = (category: BackendServiceCategory) => {
    switch (category) {
      case "IMMIGRATION":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide uppercase bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
            Immigration
          </span>
        );
      case "BUSINESS":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Business
          </span>
        );
      case "CONSULTATION":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide uppercase bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            Consultation
          </span>
        );
      case "DMV_PSB":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide uppercase bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]">
            DMV / PSB
          </span>
        );
      case "CUSTOM":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold tracking-wide uppercase bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
            Custom
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <Loader size="lg" text="Retrieving live service dossier..." />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="py-16">
        <EmptyState
          icon={<Briefcase className="h-8 w-8 text-[#64748B]" />}
          title="Service Offering Not Found"
          description="The requested service offering could not be found in the active catalog directory."
          action={
            <Button
              variant="default"
              onClick={() => router.push(ROUTES.SERVICES)}
              className="h-10 px-4 rounded-xl text-xs font-semibold"
            >
              Back to Catalog Directory
            </Button>
          }
        />
      </div>
    );
  }

  const base = Number(service.baseFee || 0);
  const gov = Number(service.estimatedGovFee || 0);
  const attorney = Number(service.estimatedAttorneyFee || 0);
  const thirdParty = Number(service.estimatedThirdPartyFee || 0);
  const passThrough = gov + attorney + thirdParty;
  const totalCost = base + passThrough;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B]">
          <Link
            href={ROUTES.SERVICES}
            className="flex items-center gap-1 hover:text-[#0a0a0a] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Service Catalog</span>
          </Link>
          <ChevronRight className="h-3 w-3 text-[#CBD5E1]" />
          <span className="font-mono text-[#0a0a0a]">{service.code}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-9 px-3 rounded-xl gap-1.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Deactivate Offering</span>
          </Button>
        </div>
      </div>

      {/* Hero Header Dossier Banner */}
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#0a0a0a] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#EAE6DF]">
                {service.code}
              </span>
              {renderCategoryBadge(service.category)}
              {service.isActive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                  Active Offering
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
                  Inactive
                </span>
              )}
            </div>

            <h1 className="font-sans text-2xl sm:text-3xl font-black tracking-tight text-[#0a0a0a]">
              {service.name}
            </h1>

            {service.description && (
              <p className="text-xs sm:text-sm text-[#64748B] max-w-3xl leading-relaxed">
                {service.description}
              </p>
            )}
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Estimated Client Cost
            </div>
            <div className="font-mono text-3xl font-black tracking-tight text-[#0a0a0a]">
              ${totalCost.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-[#059669]">
              ${base.toLocaleString()} AdSkill Advisory Base
            </div>
          </div>
        </div>
      </div>

      {/* Strict Fee Separation Architecture Card */}
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#F1ECE4]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-sans text-base sm:text-lg font-bold text-[#0a0a0a]">
                Strict Regulatory Fee Separation Architecture
              </h2>
              <p className="text-xs text-[#64748B]">
                Accounting isolation between firm professional advisory revenue and client pass-through expenses.
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Audit Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Base Fee */}
          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
                Firm Professional Fee
              </span>
              <span className="font-mono text-[9px] font-bold text-[#059669] uppercase bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                Revenue
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-[#0a0a0a]">
              ${base.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#64748B]">
              AdSkill legal and advisory retainer revenue.
            </p>
          </div>

          {/* Government Fee */}
          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
                USCIS / Filing Fees
              </span>
              <span className="font-mono text-[9px] font-bold text-[#2563EB] uppercase bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                Pass-Through
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-[#0a0a0a]">
              ${gov.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#64748B]">
              Government petitions and official filing fees.
            </p>
          </div>

          {/* Attorney Fee */}
          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
                Attorney Representation
              </span>
              <span className="font-mono text-[9px] font-bold text-[#2563EB] uppercase bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                Pass-Through
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-[#0a0a0a]">
              ${attorney.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#64748B]">
              Outside licensed legal counsel representation.
            </p>
          </div>

          {/* Third-Party Fee */}
          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
                Evaluations &amp; 3rd Party
              </span>
              <span className="font-mono text-[9px] font-bold text-[#2563EB] uppercase bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                Pass-Through
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-[#0a0a0a]">
              ${thirdParty.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#64748B]">
              Certified translations, business plans, credentials.
            </p>
          </div>
        </div>

        {/* Regulatory Governance Banner */}
        <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF] flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="text-xs text-[#64748B] leading-relaxed">
            <strong className="text-[#0a0a0a]">Accounting Policy Notice:</strong> Pass-through fees ($
            {passThrough.toLocaleString()}) are third-party reimbursements collected in escrow/trust and do not contribute to AdSkill gross profit or taxable business earnings.
          </div>
        </div>
      </div>

      {/* Suggested Retainer & Milestone Terms Card */}
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F1ECE4]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#0a0a0a]">
              Suggested Retainer &amp; Milestone Terms
            </h2>
            <p className="text-xs text-[#64748B]">
              Default schedule parameters applied when generating payment agreements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
            <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
              Upfront Retainer Deposit
            </span>
            <div className="font-mono text-xl font-bold text-[#0a0a0a] mt-1">
              {service.defaultDeposit !== null && service.defaultDeposit !== undefined
                ? `$${Number(service.defaultDeposit).toLocaleString()}`
                : "None"}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              Payable before initial filing preparation begins.
            </p>
          </div>

          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
            <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
              Milestone Installments
            </span>
            <div className="font-mono text-xl font-bold text-[#0a0a0a] mt-1">
              {service.defaultInstallments
                ? `${service.defaultInstallments} Installments`
                : "Custom schedule"}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              Disbursed across agreed petition milestones.
            </p>
          </div>

          <div className="rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
            <span className="font-mono text-[10px] font-bold text-[#64748B] uppercase">
              Estimated Duration
            </span>
            <div className="font-mono text-xl font-bold text-[#0a0a0a] mt-1">
              {service.estimatedDuration || "Variable"}
            </div>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              Estimated duration from onboarding to completion.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Trail & Provenance Card */}
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#F1ECE4]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-[#0a0a0a]">
              Immutable Audit Provenance
            </h3>
            <p className="text-[11px] text-[#64748B]">
              Actor traceability and catalog modification history.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF] space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase text-[#64748B]">
              Created By
            </span>
            <div className="font-semibold text-[#0a0a0a]">
              {service.createdBy?.name || "System Administrator"}
            </div>
            <div className="text-[11px] text-[#64748B]">
              {service.createdBy?.email || "N/A"}
            </div>
            <div className="font-mono text-[10px] text-[#94A3B8] pt-1">
              {new Date(service.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF] space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase text-[#64748B]">
              Last Modified
            </span>
            <div className="font-semibold text-[#0a0a0a]">
              {service.updatedBy?.name || service.createdBy?.name || "System"}
            </div>
            <div className="text-[11px] text-[#64748B]">
              {service.updatedBy?.email || service.createdBy?.email || "N/A"}
            </div>
            <div className="font-mono text-[10px] text-[#94A3B8] pt-1">
              {new Date(service.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
