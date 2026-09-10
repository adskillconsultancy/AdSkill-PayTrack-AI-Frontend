"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { ClientItem } from "../types";
import {
  X,
  MapPin,
  Calendar,
  FileText,
  User,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";

interface ClientDetailModalProps {
  client: ClientItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientDetailModal({
  client,
  isOpen,
  onClose,
}: ClientDetailModalProps) {
  if (!isOpen || !client) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Processing":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EBF8FF] text-[#0284C7] ring-1 ring-[#0284C7]/20">
            Processing
          </span>
        );
      case "Missing Docs":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] ring-1 ring-[#E11D48]/20">
            Missing Docs
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/20">
            Approved
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]/20">
            Under Review
          </span>
        );
      case "Delayed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#B45309]/20">
            Delayed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#64748B]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#EAE6DF] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0ECE6] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-[#EAE6DF] text-[#092244] shadow-2xs">
              <FileText className="h-5 w-5 text-[#092244]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#092244] tracking-tight">
                Client Case Dossier
              </h3>
              <p className="text-xs font-mono font-medium text-[#64748B]">
                ID: {client.clientId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] text-[#64748B] hover:text-[#092244] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Client Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
            <div className="flex items-center gap-4">
              {client.avatarUrl ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-xs">
                  <Image
                    src={client.avatarUrl}
                    alt={client.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-base font-bold text-[#092244]">
                  {client.initials || client.name.charAt(0)}
                </div>
              )}
              <div>
                <h4 className="text-lg font-black text-[#092244] tracking-tight">
                  {client.name}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] mt-1 font-medium">
                  {client.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-[#94A3B8]" />
                      {client.email}
                    </span>
                  )}
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
                      {client.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="self-start sm:self-center">
              {getStatusBadge(client.status)}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Destination */}
            <div className="p-4 rounded-2xl border border-[#EAE6DF] bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                <MapPin className="h-3.5 w-3.5 text-[#F3A712]" />
                <span>Destination</span>
              </div>
              <div className="text-sm font-black text-[#092244]">
                {client.destination.code} — {client.destination.country}
              </div>
            </div>

            {/* Visa Category */}
            <div className="p-4 rounded-2xl border border-[#EAE6DF] bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
                <span>Visa Category</span>
              </div>
              <div className="text-sm font-black text-[#092244]">
                {client.visaCategory.title}
              </div>
              <div className="text-xs text-[#94A3B8]">
                {client.visaCategory.subCategory}
              </div>
            </div>

            {/* Submission Date & Agent */}
            <div className="p-4 rounded-2xl border border-[#EAE6DF] bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                <Calendar className="h-3.5 w-3.5 text-[#0284C7]" />
                <span>Submission Date</span>
              </div>
              <div className="text-sm font-black text-[#092244]">
                {client.submission.date}
              </div>
              <div className="text-xs text-[#64748B]">
                Assigned Agent: {client.submission.agentName}
              </div>
            </div>

            {/* Passport Number */}
            <div className="p-4 rounded-2xl border border-[#EAE6DF] bg-white space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                <User className="h-3.5 w-3.5 text-[#7E22CE]" />
                <span>Passport Number</span>
              </div>
              <div className="text-sm font-mono font-black text-[#092244]">
                {client.passportNumber || "Not recorded"}
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="p-4 rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#092244]">
                <CreditCard className="h-4 w-4 text-[#F3A712]" />
                <span>Payment Plan Summary</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="text-[10px] font-extrabold uppercase text-[#64748B]">
                  Contract Fee
                </div>
                <div className="text-sm sm:text-base font-black text-[#092244] mt-0.5">
                  ${client.totalFee?.toLocaleString() || "4,500"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="text-[10px] font-extrabold uppercase text-[#059669]">
                  Collected
                </div>
                <div className="text-sm sm:text-base font-black text-[#059669] mt-0.5">
                  ${client.paidAmount?.toLocaleString() || "3,000"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="text-[10px] font-extrabold uppercase text-[#E11D48]">
                  Outstanding
                </div>
                <div className="text-sm sm:text-base font-black text-[#E11D48] mt-0.5">
                  ${client.dueAmount?.toLocaleString() || "1,500"}
                </div>
              </div>
            </div>
          </div>

          {/* Case Notes */}
          {client.notes && (
            <div className="p-4 rounded-2xl border border-[#EAE6DF] bg-white space-y-1.5">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Internal Case Notes
              </div>
              <p className="text-xs text-[#092244] leading-relaxed">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#F0ECE6] bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 text-xs font-bold"
          >
            Close
          </Button>
          <Button
            type="button"
            className="h-10 text-xs font-bold"
          >
            Edit Client Record
          </Button>
        </div>
      </div>
    </div>
  );
}
