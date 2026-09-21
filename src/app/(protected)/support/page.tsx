"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetSupportOverviewQuery,
  useCreateSupportInquiryMutation,
  useGetMyInquiriesQuery,
} from "@/services/api/support/supportApi";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const FAQS = [
  {
    q: "How do I make a payment against my invoice?",
    a: "You can navigate to the Payments section in your sidebar and select 'Record Payment'. Choose your active application case, specify whether it's a general deposit or a milestone payment, select your payment channel (bKash, Nagad, Bank, Cash, etc.), and provide your transaction reference. Our accounting team will verify it within 24 business hours.",
  },
  {
    q: "How are project milestones tracked and verified?",
    a: "Milestones are defined during onboarding with clear deliverables and due dates. Once you or your advisor marks a milestone deliverable ready, it is reviewed by the client lead. Invoices and receipts are instantly generated upon payment confirmation.",
  },
  {
    q: "Can I contact my consultant directly through WhatsApp?",
    a: "Yes! If your consultant has configured their WhatsApp number, you'll find a direct WhatsApp link on your Support card above. Click it to open an encrypted direct chat with your assigned advisor.",
  },
  {
    q: "Where can I download my receipts and official invoices?",
    a: "Official signed invoices and payment receipts are available in the 'Invoices & Receipts' tab under Payments. You can download PDF copies anytime for accounting and tax records.",
  },
  {
    q: "What should I do if an emergency arises outside normal hours?",
    a: "For critical payment or case issues, use our 24/7 hotline or submit a High Priority inquiry form below. Our on-duty supervisor will be alerted immediately.",
  },
];

export default function SupportPage() {
  const { user } = useAuth();
  const { data: supportData, isLoading: isSupportLoading, refetch: refetchSupport } = useGetSupportOverviewQuery();
  const { data: inquiriesData, isLoading: isInquiriesLoading, refetch: refetchInquiries } = useGetMyInquiriesQuery();
  const [createInquiry, { isLoading: isSubmittingInquiry }] = useCreateSupportInquiryMutation();

  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [inquirySubject, setInquirySubject] = React.useState("");
  const [inquiryMessage, setInquiryMessage] = React.useState("");
  const [inquiryCategory, setInquiryCategory] = React.useState<"BILLING_PAYMENT" | "MILESTONE_SCHEDULE" | "DOCUMENT_VERIFICATION" | "CASE_STATUS" | "GENERAL">("GENERAL");
  const [inquiryPriority, setInquiryPriority] = React.useState<"LOW" | "NORMAL" | "URGENT">("NORMAL");
  const [selectedCaseId, setSelectedCaseId] = React.useState<string>("");
  const [inquirySuccess, setInquirySuccess] = React.useState(false);
  const [inquiryError, setInquiryError] = React.useState<string | null>(null);

  const consultant = supportData?.data?.assignedConsultant;
  const cases = supportData?.data?.activeCases || [];
  const desk = supportData?.data?.centralSupport;
  const inquiries = inquiriesData?.data || [];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) {
      setInquiryError("Please enter both a subject and a message.");
      return;
    }

    setInquiryError(null);
    setInquirySuccess(false);

    try {
      await createInquiry({
        subject: inquirySubject.trim(),
        message: inquiryMessage.trim(),
        category: inquiryCategory,
        priority: inquiryPriority,
        caseId: selectedCaseId || undefined,
      }).unwrap();

      setInquirySuccess(true);
      setInquirySubject("");
      setInquiryMessage("");
      setSelectedCaseId("");
      refetchInquiries();
      setTimeout(() => setInquirySuccess(false), 6000);
    } catch (err: any) {
      setInquiryError(err?.data?.message || "Failed to submit inquiry. Please try again.");
    }
  };

  const getWhatsAppLink = (number?: string | null) => {
    if (!number) return null;
    const cleaned = number.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleaned}?text=${encodeURIComponent("Hello! I am contacting you regarding my AdSkill application case.")}`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 🧭 Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="h-3.5 w-3.5" /> AdSkill Client Care & Advisory
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Client Support & Advisory Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect directly with your assigned consultant, submit official inquiries, and access fast-track help.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={ROUTES.PROFILE}>
            <Button variant="outline" className="gap-2 text-xs">
              <User className="h-4 w-4" /> View My Profile
            </Button>
          </Link>
          <Link href={ROUTES.PAYMENT_RECORD}>
            <Button className="gap-2 text-xs bg-primary hover:bg-primary/90">
              <Sparkles className="h-4 w-4" /> Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* 🌟 Top Row: Assigned Consultant & Central Help Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Consultant Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <UserCheck className="w-44 h-44" />
          </div>

          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                {consultant ? (consultant.name?.[0] || "C") : <User className="h-6 w-6" />}
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Dedicated Advisor
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  {consultant ? consultant.name : isSupportLoading ? "Loading consultant..." : "Senior AdSkill Advisory Team"}
                </h2>
                {consultant?.role && (
                  <p className="text-xs text-muted-foreground">{consultant.role}</p>
                )}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Assignment
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Your consultant oversees your active application cases, reviews milestone requirements, and coordinates payments with the financial team.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40">
            {/* Direct Email */}
            <div className="p-3.5 rounded-xl bg-background/60 border border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Mail className="h-3.5 w-3.5 text-primary" /> Consultant Email
              </div>
              <p className="text-xs font-semibold text-foreground truncate select-all">
                {consultant?.email || "advisory@adskill.com"}
              </p>
            </div>

            {/* Direct Phone */}
            <div className="p-3.5 rounded-xl bg-background/60 border border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Phone className="h-3.5 w-3.5 text-primary" /> Phone Line
              </div>
              <p className="text-xs font-semibold text-foreground truncate select-all">
                {consultant?.phone || "+880 1700-000000"}
              </p>
            </div>

            {/* WhatsApp Direct Action */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Direct
              </div>
              {consultant?.whatsapp || consultant?.phone ? (
                <a
                  href={getWhatsAppLink(consultant?.whatsapp || consultant?.phone) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline underline-offset-2"
                >
                  Open WhatsApp Chat <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">Available on desk line</span>
              )}
            </div>
          </div>
        </div>

        {/* Central AdSkill Help Desk Card */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Building className="h-3.5 w-3.5" /> Central Support
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {desk?.agencyName || "AdSkill Client Help Desk"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Our central operations team is on standby to assist with verification, billing queries, and emergencies.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{desk?.email || "support@adskill.com"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{desk?.hotline || "+880 1711-000000"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>{desk?.businessHours || "Sat - Thu: 9:00 AM - 7:00 PM (BST)"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{desk?.officeAddress || "Dhaka, Bangladesh"}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Direct escalations: {desk?.responseTime || "Within 4 business hours"}.
            </span>
          </div>
        </div>
      </div>

      {/* 🚀 Middle Section: Submit Ticket & Active Cases Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket Submission Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Submit a Direct Inquiry</h3>
              <p className="text-xs text-muted-foreground">
                Sent straight to your consultant and client relationship supervisor.
              </p>
            </div>
          </div>

          {inquirySuccess && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold">Inquiry submitted successfully!</p>
                <p className="text-[11px] text-muted-foreground">Your inquiry has been logged and assigned to your advisor team.</p>
              </div>
            </div>
          )}

          {inquiryError && (
            <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{inquiryError}</span>
            </div>
          )}

          <form onSubmit={handleInquirySubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Linked Case Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Related Case
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">General Account</option>
                  {cases.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.caseCode} - {c.serviceName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={inquiryCategory}
                  onChange={(e) => setInquiryCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="GENERAL">General Query</option>
                  <option value="BILLING_PAYMENT">Billing & Payment</option>
                  <option value="MILESTONE_SCHEDULE">Milestone & Delivery</option>
                  <option value="DOCUMENT_VERIFICATION">Document Verification</option>
                  <option value="CASE_STATUS">Case Status</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Priority Level
                </label>
                <select
                  value={inquiryPriority}
                  onChange={(e) => setInquiryPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Query regarding Milestone deliverable sign-off"
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Message Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Please describe your question or issue in detail. Include any relevant reference numbers or timeline requirements."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmittingInquiry || !inquirySubject.trim() || !inquiryMessage.trim()}
              className="gap-2 text-xs w-full sm:w-auto"
            >
              {isSubmittingInquiry ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Send Inquiry to Advisor
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Active Cases Snapshot (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">Your Active Cases</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {cases.length} Case{cases.length !== 1 ? "s" : ""}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Overview of your applications currently handled by AdSkill consultants.
            </p>

            <div className="space-y-3">
              {cases.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-border/60 text-center">
                  <p className="text-xs text-muted-foreground">No active cases under this client profile.</p>
                </div>
              ) : (
                cases.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-border/50 bg-background/60 hover:border-border transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-primary">{c.caseCode}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {c.status || "ACTIVE"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">{c.serviceName}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span>Destination: {c.destinationCountry || "Global"}</span>
                      <span className="font-medium text-foreground">{c.financialStatus}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40">
            <Link href={ROUTES.PAYMENTS} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
              View full payment breakdown & receipts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 📜 Past Support Inquiries Timeline */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Recent Inquiries & Requests</h3>
              <p className="text-xs text-muted-foreground">
                Track the status and official responses to questions you have submitted.
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetchInquiries()} className="text-xs">
            Refresh
          </Button>
        </div>

        {isInquiriesLoading ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-border/60 rounded-xl">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-foreground">No inquiries submitted yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Whenever you need guidance, submit a ticket above and your advisor will reply here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {inquiries.map((inq: any) => (
              <div key={inq.id} className="py-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{inq.subject}</span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        inq.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : inq.status === "IN_PROGRESS"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      )}
                    >
                      {inq.status || "OPEN"}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {inq.ticketCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(inq.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{inq.content || inq.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ❓ Client FAQ Accordion */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Frequently Asked Questions</h3>
            <p className="text-xs text-muted-foreground">
              Quick answers about payment schedules, invoice receipts, and milestone verification.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border/50 bg-background/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/30 bg-muted/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
