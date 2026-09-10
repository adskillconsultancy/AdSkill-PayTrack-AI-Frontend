"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { UserRole, UserStatus } from "../types";
import {
  ArrowLeft,
  ChevronRight,
  UserPlus,
  MessageCircle,
  Shield,
  KeyRound,
  Building2,
  Mail,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function CreateUserForm() {
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("Consultant");
  const [status, setStatus] = React.useState<UserStatus>("Active");
  const [countryCode, setCountryCode] = React.useState("+1");
  const [whatsappNumber, setWhatsappNumber] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [department, setDepartment] = React.useState("Legal & Immigration");
  const [sendWelcomeWhatsApp, setSendWelcomeWhatsApp] = React.useState(true);
  const [requirePasswordReset, setRequirePasswordReset] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Auto-generate username from name if not manually typed
  const handleNameChange = (val: string) => {
    setName(val);
    if (!username || username.startsWith("@")) {
      const generated = "@" + val.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 18);
      setUsername(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.USERS);
      }, 1500);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── 1. TOP BREADCRUMB & HEADER ── */}
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
            Create New User Account
          </h1>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] mt-0.5">
            <span>Super Admin</span>
            <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
            <Link
              href={ROUTES.USERS}
              className="hover:text-[#092244] transition-colors"
            >
              User Management
            </Link>
            <ChevronRight className="h-3 w-3 text-[#94A3B8]" />
            <span className="text-[#092244] font-bold">Create User</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#059669]/30 text-[#059669] flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="text-xs font-bold">
            User account created successfully! Redirecting to User List...
          </div>
        </div>
      )}

      {/* ── 2. FORM CONTAINER ── */}
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 rounded-3xl sm:rounded-[32px] border border-[#EAE6DF] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-8"
      >
        {/* Section 1: Personal Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#092244]">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                1. Personal &amp; Account Identity
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Full legal name, username handle, and official company email
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Full Name *
              </label>
              <Input
                required
                placeholder="e.g. Rachel Adams"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Username Handle *
              </label>
              <Input
                required
                placeholder="@rachel_adams"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#092244]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Work Email *
              </label>
              <Input
                type="email"
                required
                placeholder="rachel@adskill.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Direct Telephone
              </label>
              <Input
                placeholder="+1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-semibold text-[#092244]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: WhatsApp Integration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#059669]">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                2. WhatsApp Contact Number
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Enables one-click WhatsApp client communication and automated milestone alerts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Country Code
              </label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="+1">+1 (US / Canada)</option>
                <option value="+44">+44 (United Kingdom)</option>
                <option value="+61">+61 (Australia)</option>
                <option value="+49">+49 (Germany)</option>
                <option value="+91">+91 (India)</option>
                <option value="+971">+971 (UAE)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                WhatsApp Mobile Number *
              </label>
              <Input
                required
                placeholder="4165550199"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-xs font-mono font-bold text-[#059669]"
              />
              <span className="text-[11px] text-[#64748B] block">
                Formatted: {countryCode} {whatsappNumber || "XXXXXXXXXX"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Role & Department Assignment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF5FF] text-[#7E22CE]">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                3. Role &amp; Permission Scope
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Determines access level across clients, payments, reports, and PBAC settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="Consultant">Consultant (Legal / Case Officer)</option>
                <option value="Super Admin">Super Admin (Universal Access)</option>
                <option value="Admin">Admin (Operations Manager)</option>
                <option value="Accountant">Accountant (Finance & Billing)</option>
                <option value="Support">Support Staff (Helpdesk & Intake)</option>
                <option value="Client">Client (Self-Service Portal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                Department / Team
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-bold text-[#092244] focus:outline-none focus:ring-1 focus:ring-[#092244]"
              >
                <option value="Legal & Immigration">Legal &amp; Immigration</option>
                <option value="Finance & Billing">Finance &amp; Billing</option>
                <option value="Operations">Operations</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Executive Management">Executive Management</option>
                <option value="Client Portal User">Client Portal User</option>
              </select>
            </div>
          </div>

          {/* Role summary callout */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-xs text-[#64748B] leading-relaxed">
            <span className="font-bold text-[#092244]">Role Capability: </span>
            {role === "Super Admin" &&
              "Full administrative bypass. Can create and delete users, manage all invoices, export audit logs, and configure PBAC policies."}
            {role === "Consultant" &&
              "Can view assigned clients, track visa milestones, update case documents, and send milestone reminders via WhatsApp."}
            {role === "Accountant" &&
              "Can record offline bank wires, approve manual payment proofs, generate branded receipts, and export aging reports."}
            {role === "Support" &&
              "Can view applicant intake forms, assist with document uploads, and handle WhatsApp support requests."}
            {role === "Client" &&
              "Can only view their own personal visa status, invoice milestones, and payment receipts."}
            {role === "Admin" &&
              "Operations supervisor access across team schedules and case tracking."}
          </div>
        </div>

        {/* Section 4: Security & Notification Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#F0ECE6]">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#092244]">
                4. Onboarding &amp; Credentials
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Configure initial password delivery and onboarding messaging
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
              <input
                type="checkbox"
                checked={sendWelcomeWhatsApp}
                onChange={(e) => setSendWelcomeWhatsApp(e.target.checked)}
                className="h-4 w-4 rounded text-[#092244] focus:ring-[#092244]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#092244]">
                  Send WhatsApp Welcome Message
                </span>
                <p className="text-[#64748B] text-[11px]">
                  Automatically dispatch portal access credentials and temporary PIN to {countryCode} {whatsappNumber || "number"}
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
              <input
                type="checkbox"
                checked={requirePasswordReset}
                onChange={(e) => setRequirePasswordReset(e.target.checked)}
                className="h-4 w-4 rounded text-[#092244] focus:ring-[#092244]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#092244]">
                  Require Password Change on First Sign-In
                </span>
                <p className="text-[#64748B] text-[11px]">
                  Enforces security compliance per platform policy
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-4 border-t border-[#F0ECE6] flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-bold"
          >
            <Link href={ROUTES.USERS}>Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-[#092244] text-white hover:bg-[#071933] text-xs font-bold shadow-md cursor-pointer gap-2"
          >
            <UserPlus className="h-4 w-4 text-[#F3A712]" />
            <span>{isSubmitting ? "Creating User..." : "Save & Create User"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
