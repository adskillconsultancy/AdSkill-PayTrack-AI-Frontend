"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { UserItem, UserRole, UserStatus } from "../types";
import { MOCK_USERS } from "../mockData";
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Calendar,
  Building2,
  KeyRound,
  History,
  Lock,
  ExternalLink,
  Edit,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface UserDetailViewProps {
  userId: string;
}

export function UserDetailView({ userId }: UserDetailViewProps) {
  const router = useRouter();
  const user = React.useMemo(() => {
    return MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
  }, [userId]);

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Super Admin":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FAF5FF] text-[#7E22CE] ring-1 ring-[#7E22CE]/20">
            Super Admin
          </span>
        );
      case "Admin":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#1E40AF] ring-1 ring-[#1E40AF]/20">
            Admin
          </span>
        );
      case "Consultant":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E6F4F1] text-[#0D6E6E] ring-1 ring-[#0D6E6E]/20">
            Consultant
          </span>
        );
      case "Accountant":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/20">
            Accountant
          </span>
        );
      case "Support":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#B45309]/20">
            Support Staff
          </span>
        );
      case "Client":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#475569] ring-1 ring-[#475569]/20">
            Client Account
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#64748B]">
            {role}
          </span>
        );
    }
  };

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] ring-1 ring-[#059669]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
            Active Account
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#D97706] ring-1 ring-[#D97706]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D97706]" />
            Pending Verification
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] ring-1 ring-[#E11D48]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E11D48]" />
            Suspended
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#64748B] ring-1 ring-[#64748B]/20">
            <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
            Inactive
          </span>
        );
    }
  };

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
            <Link href={ROUTES.USERS}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to User List</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#092244] tracking-tight">
              User Profile &amp; Dossier
            </h1>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
              <span>Super Admin</span>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <Link
                href={ROUTES.USERS}
                className="hover:text-[#092244] transition-colors"
              >
                User List
              </Link>
              <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
              <span className="text-[#092244] font-bold">{user.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`Reset password initiated for ${user.email}`)}
            className="h-10 px-4 rounded-xl text-xs font-bold gap-2"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#F3A712]" />
            <span>Reset Password</span>
          </Button>

          <Button
            asChild
            className="h-10 px-4 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold gap-2 shadow-xs"
          >
            <a
              href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              <span>WhatsApp Chat</span>
            </a>
          </Button>
        </div>
      </div>

      {/* ── 2. HERO PROFILE BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user.avatarUrl ? (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-full border-4 border-[#FAF8F5] shadow-md">
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-full bg-[#092244]/10 text-2xl font-black text-[#092244]">
                {user.initials || user.name.charAt(0)}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-[#092244] tracking-tight">
                  {user.name}
                </h2>
                {renderRoleBadge(user.role)}
                {renderStatusBadge(user.status)}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748B] font-medium">
                <span className="font-mono text-[#092244] font-bold">
                  {user.username}
                </span>
                <span>•</span>
                <span>ID: {user.userId}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-[#94A3B8]" />
                  {user.department}
                </span>
              </div>
              {user.bio && (
                <p className="text-xs sm:text-sm text-[#475569] max-w-2xl pt-1">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. TWO COLUMN DOSSIER DETAILS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Activity Info (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#F3A712]" />
              <span>Contact &amp; Personal Info</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Email Address
                </span>
                <div className="text-sm font-bold text-[#092244] break-all">
                  {user.email}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  WhatsApp Number
                </span>
                <div className="text-sm font-mono font-bold text-[#059669] flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                  <span>{user.whatsapp}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Direct Telephone
                </span>
                <div className="text-sm font-mono font-bold text-[#092244]">
                  {user.phone || "Not configured"}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                  Account Created
                </span>
                <div className="text-sm font-bold text-[#092244] flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#0284C7]" />
                  <span>{user.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* PBAC Permissions & Capabilities Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#059669]" />
              <span>Assigned PBAC Role Privileges</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#092244]">
                  Role Capability Scope:
                </span>
                <span className="text-xs font-bold text-[#7E22CE] bg-[#FAF5FF] px-2.5 py-0.5 rounded-lg border border-[#7E22CE]/20">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {user.role === "Super Admin" &&
                  "Universal capability bypass across all endpoints: manage clients, invoices, dynamic PBAC matrix, staff roles, refunds, audit logs, and integrations."}
                {user.role === "Consultant" &&
                  "Scoped access to view assigned client portfolios, upload visa milestone documents, manage application statuses, and add private case notes."}
                {user.role === "Accountant" &&
                  "Full finance permissions: record manual payments, review offline proofs, approve invoices, adjust installments, and export aging reports."}
                {user.role === "Support" &&
                  "Client intake assistance, document collection tracking, and WhatsApp ticket resolution."}
                {user.role === "Client" &&
                  "Strictly scoped self-service access to view their own immigration case, payment installments, invoices, and payment receipts."}
              </p>
            </div>
          </div>

          {/* Audit & Activity Logs */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <History className="h-4 w-4 text-[#0284C7]" />
              <span>Recent Activity &amp; Audit Trail</span>
            </h3>

            {user.activityLogs && user.activityLogs.length > 0 ? (
              <div className="divide-y divide-[#F0ECE6]">
                {user.activityLogs.map((log) => (
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
                      {log.ipAddress && (
                        <div className="text-[10px] font-mono text-[#94A3B8]">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#94A3B8] italic py-3">
                No recent activity logged for this account.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: WhatsApp Direct Card & Security Details */}
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
                  Instant messaging channel
                </p>
              </div>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Launch a direct WhatsApp message to this user. Useful for milestone alerts, document requests, and support queries.
            </p>

            <Button
              asChild
              className="w-full h-11 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              <a
                href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Open WhatsApp Chat</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            </Button>
          </div>

          {/* Security & Authentication Card */}
          <div className="p-6 rounded-3xl border border-[#EAE6DF] bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#092244] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#7E22CE]" />
              <span>Security &amp; Auth</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Two-Factor Auth (2FA)
                </span>
                {user.twoFactorEnabled ? (
                  <span className="text-[11px] font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
                    Enabled
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-[#E11D48] bg-[#FFF1F2] px-2 py-0.5 rounded-md">
                    Disabled
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Assigned Cases
                </span>
                <span className="text-xs font-bold text-[#092244]">
                  {user.assignedCasesCount || 0} active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#092244]">
                  Last Active Session
                </span>
                <span className="text-xs font-medium text-[#64748B]">
                  {user.lastActive}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
