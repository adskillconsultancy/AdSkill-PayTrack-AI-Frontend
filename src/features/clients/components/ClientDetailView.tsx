"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { ClientItem, ClientStatus } from "../types";
import { MOCK_CLIENTS, getMockClients } from "../mockData";
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  History,
  ExternalLink,
  MapPin,
  ShieldCheck,
  User,
  CheckCircle2,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface ClientDetailViewProps {
  clientId: string;
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const router = useRouter();

  const client = React.useMemo(() => {
    const list = getMockClients();
    return (
      list.find((c) => c.id === clientId || c.clientId === clientId) ||
      list[0] ||
      MOCK_CLIENTS[0]
    );
  }, [clientId]);

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "Processing":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#0D6E6E] ring-1 ring-[#0D6E6E]/15">
            Processing
          </span>
        );
      case "Missing Docs":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] ring-1 ring-[#E11D48]/15">
            Missing Docs
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/15">
            Approved
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#B45309]/15">
            Under Review
          </span>
        );
      case "Delayed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]/15">
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

  const whatsappClean = (client.whatsapp || "+14165550192").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6">
      {/* ── 1. TOP BREADCRUMB & BACK NAVIGATION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-2xl border-[#EAE6DF] bg-white text-[#092244] hover:bg-[#FAF8F5] shadow-2xs"
          >
            <Link href={ROUTES.CLIENTS}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Client List</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
              Client Case Dossier
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Clients &amp; Services</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.CLIENTS}
                className="hover:text-[#092244] transition-colors"
              >
                Client List
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#092244] font-bold">{client.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`Payment reminder triggered for ${client.name}`)}
            className="h-10 px-4 rounded-xl text-xs font-bold gap-2"
          >
            <CreditCard className="h-3.5 w-3.5 text-[#F3A712]" />
            <span>Send Reminder</span>
          </Button>

          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold gap-2 shadow-xs"
          >
            <a
              href={`https://wa.me/${whatsappClean}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>WhatsApp Chat</span>
            </a>
          </Button>
        </div>
      </div>

      {/* ── 2. HERO CLIENT PROFILE BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {client.avatarUrl ? (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#FAF8F5] shadow-md">
                <Image
                  src={client.avatarUrl}
                  alt={client.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-2xl font-black text-[#092244]">
                {client.initials || client.name.charAt(0)}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#092244] tracking-tight">
                  {client.name}
                </h2>
                {getStatusBadge(client.status)}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B] font-medium">
                <span className="font-mono text-[#092244] font-bold">
                  ID: {client.clientId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-[#092244]">
                  <MapPin className="h-3.5 w-3.5 text-[#F3A712]" />
                  {client.destination.code} — {client.destination.country}
                </span>
                <span>•</span>
                <span>Visa: {client.visaCategory.title}</span>
              </div>
              {client.notes && (
                <p className="text-xs sm:text-sm text-[#475569] max-w-2xl pt-1">
                  {client.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TWO COLUMN DOSSIER DETAILS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Case Information & Financial Plan (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case & Visa Dossier Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#059669]" />
              <span>Immigration &amp; Visa Case Dossier</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Target Destination
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-[#092244] text-white px-2 py-0.5 rounded-md">
                    {client.destination.code}
                  </span>
                  <span>{client.destination.country}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Visa Category
                </span>
                <div className="text-sm font-bold text-[#092244]">
                  {client.visaCategory.title}
                </div>
                <div className="text-xs text-[#94A3B8]">
                  {client.visaCategory.subCategory}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Submission Date &amp; Agent
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#0284C7]" />
                  <span>{client.submission.date}</span>
                </div>
                <div className="text-xs text-[#64748B]">
                  Assigned Consultant: {client.submission.agentName}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Passport Identifier
                </span>
                <div className="text-sm font-mono font-bold text-[#092244] flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[#7E22CE]" />
                  <span>{client.passportNumber || "Not recorded"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Plan & Milestone Summary */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#F3A712]" />
              <span>Contract Fee &amp; Payment Schedule</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <div className="text-[10px] sm:text-xs font-extrabold uppercase text-[#64748B]">
                  Contract Fee
                </div>
                <div className="text-base sm:text-xl font-black text-[#092244] mt-1">
                  ${client.totalFee?.toLocaleString() || "4,500"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#059669]/20">
                <div className="text-[10px] sm:text-xs font-extrabold uppercase text-[#059669]">
                  Collected
                </div>
                <div className="text-base sm:text-xl font-black text-[#059669] mt-1">
                  ${client.paidAmount?.toLocaleString() || "3,000"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#E11D48]/20">
                <div className="text-[10px] sm:text-xs font-extrabold uppercase text-[#E11D48]">
                  Outstanding Due
                </div>
                <div className="text-base sm:text-xl font-black text-[#E11D48] mt-1">
                  ${client.dueAmount?.toLocaleString() || "1,500"}
                </div>
              </div>
            </div>
          </div>

          {/* Activity & Milestone History */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <History className="h-4 w-4 text-[#0284C7]" />
              <span>Case Milestones &amp; Audit Logs</span>
            </h3>

            {client.activityLogs && client.activityLogs.length > 0 ? (
              <div className="divide-y divide-[#F0ECE6]">
                {client.activityLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold text-[#092244]">
                        {log.action}
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        {log.target}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-semibold text-[#092244]">
                        {log.timestamp}
                      </div>
                      <div className="text-[10px] font-medium text-[#94A3B8]">
                        Agent: {log.agentName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] italic py-3">
                No recent case milestone logs for this client.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp Direct Card & Contact Details */}
        <div className="space-y-6">
          {/* WhatsApp Direct Chat Card */}
          <div className="p-6 rounded-3xl border border-[#25D366]/30 bg-gradient-to-b from-[#ECFDF5] to-white shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-sm">
                <MessageCircle className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#092244]">
                  WhatsApp Direct
                </h4>
                <p className="text-xs text-[#059669] font-medium">
                  Client communication channel
                </p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Launch an immediate WhatsApp conversation with this client. Send milestone payment reminders, requested documents checklist, or case approvals.
            </p>

            <Button
              asChild
              className="w-full h-11 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Open WhatsApp Chat</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </Button>
          </div>

          {/* Contact Details Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#F3A712]" />
              <span>Contact Channels</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">
                  Email Address
                </span>
                <div className="text-xs font-bold text-[#092244] break-all">
                  {client.email || "No email on record"}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">
                  WhatsApp Mobile
                </span>
                <div className="text-xs font-mono font-bold text-[#059669] flex items-center gap-1.5">
                  <MessageCircle className="h-3 w-3 text-[#25D366]" />
                  <span>{client.whatsapp || "+1 416 555 0192"}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-[#64748B]">
                  Direct Phone
                </span>
                <div className="text-xs font-mono font-bold text-[#092244]">
                  {client.phone || "Not recorded"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
