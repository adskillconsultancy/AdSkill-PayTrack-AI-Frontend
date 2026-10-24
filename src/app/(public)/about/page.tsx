import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/common";
import {
  ShieldCheck,
  Building2,
  Lock,
  EyeOff,
  Cpu,
  CheckCircle2,
  Scale,
  ArrowRight,
  Sparkles,
  Award,
  Users2,
  Globe2,
  Receipt,
  FileCheck2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Check,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About AdSkill Consultancy Inc. & PayTrack AI Platform",
  description:
    "Learn about AdSkill Consultancy Inc., our global headquarters in Jackson Heights, NY, and the deterministic accounting standards powering PayTrack AI.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#0a0a0a] min-h-screen">
      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-24 border-b border-[#EAE6DF]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-[#F3A712]/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00] shadow-xs">
            <Building2 className="h-3.5 w-3.5" />
            <span>AdSkill Consultancy Inc. &bull; Jackson Heights, NY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0a0a0a]">
            Engineering Financial Trust for Global Immigration &amp; Business
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            PayTrack AI was engineered to provide every AdSkill client and advisor with one unified, mathematically verified source of truth for advisory retainers, milestone releases, and official receipts.
          </p>
        </div>
      </section>

      {/* ── 2. OUR STORY & WHAT WE SOLVED ── */}
      <section className="py-16 sm:py-20 border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                Our Background &amp; Mission
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a0a0a] leading-tight">
                From Disjointed Paperwork to Bank-Grade Financial Precision
              </h2>
              <p className="text-sm leading-relaxed text-[#475569]">
                Immigration petitions &mdash; such as <strong>EB-2 NIW</strong>, <strong>EB-1A</strong>, <strong>E-2 Investor Visas</strong>, and business incorporations &mdash; are multi-month, high-stakes journeys involving multiple milestone payments and strict statutory government disbursements.
              </p>
              <p className="text-sm leading-relaxed text-[#475569]">
                Historically, clients struggled to track bank wire slips, upcoming milestone due dates, and separate attorney fees across fragmented emails and messaging apps. <strong>AdSkill PayTrack AI</strong> completely eliminates that opacity.
              </p>
              <p className="text-sm leading-relaxed text-[#475569]">
                Every client receives a private, enterprise-grade portal reflecting their exact contracted deliverables, cleared payments, upcoming milestones, and instant downloads of certified, audit-ready PDF receipts.
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#0a0a0a]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Headquartered in New York</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Strict Regulatory Separation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Deterministic Math Ledger</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl border border-[#EAE6DF] bg-white p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-[#EAE6DF] pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a]">
                  <ShieldCheck className="h-5 w-5 text-[#F3A712]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0a0a0a]">
                    Core Platform Guarantees
                  </h3>
                  <div className="text-[11px] text-[#64748B]">AdSkill Financial Standard</div>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-[#475569]">
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0a0a0a]">Deterministic Cent Precision:</strong> Every invoice is calculated using exact integer cents &mdash; never vulnerable to IEEE float rounding errors.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0a0a0a]">Immutable Audit Logging:</strong> Every ledger event, discount, or payment logs actor ID, IP address, and timestamp forever.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0a0a0a]">Strict Client Data Isolation:</strong> Fine-grained role-based access control prevents unauthorized URL tampering between accounts.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0a0a0a]">PCI-DSS Level 1 Security:</strong> Credit and debit card data is securely tokenized via Stripe and never enters company servers.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. COMPANY PRESENCE & HEADQUARTERS ── */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
              Global Presence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              Visit or Contact Our New York Headquarters
            </h2>
            <p className="text-sm text-[#475569]">
              Our main office in Queens, NY serves domestic and international clients with full in-person and digital advisory capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] p-7 shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#EAE6DF] text-[#0a0a0a]">
                <MapPin className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a]">Headquarters</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                <strong>AdSkill Consultancy Inc.</strong><br />
                37-13 74th Street, Floor 2<br />
                Jackson Heights, NY 11372<br />
                United States
              </p>
              <a
                href="https://maps.google.com/?q=37-13+74th+Street+Jackson+Heights+NY+11372"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-bold text-[#B47B00] hover:underline"
              >
                Get Directions on Google Maps &rarr;
              </a>
            </div>

            <div className="rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] p-7 shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#EAE6DF] text-[#0a0a0a]">
                <Phone className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a]">Direct Advisory Lines</h3>
              <div className="space-y-1 text-xs text-[#475569]">
                <div>
                  <span className="text-[#64748B] block">Primary Line:</span>
                  <a href="tel:+14255407996" className="font-bold text-[#0a0a0a] hover:text-[#B47B00] font-mono text-sm">
                    +1 425-540-7996
                  </a>
                </div>
                <div>
                  <span className="text-[#64748B] block">Secondary Line:</span>
                  <a href="tel:+16468818711" className="font-bold text-[#0a0a0a] hover:text-[#B47B00] font-mono text-sm">
                    +1 646-881-8711
                  </a>
                </div>
                <div>
                  <span className="text-[#64748B] block">WhatsApp Support:</span>
                  <a href="https://wa.me/16467728544" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 hover:text-emerald-800 font-mono text-sm">
                    +1 646-772-8544
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] p-7 shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#EAE6DF] text-[#0a0a0a]">
                <Clock className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a]">Hours &amp; Inquiries</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                <strong>Office Schedule:</strong><br />
                Mon &ndash; Fri: 9:00 AM &ndash; 6:00 PM EST<br />
                Weekends: By Appointment
              </p>
              <div>
                <span className="text-[#64748B] text-xs block">Official Email:</span>
                <a href="mailto:admin@adskillconsultancy.com" className="text-xs font-bold text-[#0a0a0a] hover:text-[#B47B00]">
                  admin@adskillconsultancy.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. AI GOVERNANCE & CONTROL BOUNDARIES (SPEC SECTION 14) ── */}
      <section className="py-16 sm:py-20 bg-[#F5F2EC] border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
              Specification Section 14
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              Ethical &amp; Controlled AI Boundaries
            </h2>
            <p className="text-sm text-[#475569]">
              How we strictly govern artificial intelligence to protect your sensitive financial records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Allowed AI */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>What AI Is Allowed To Do</span>
              </div>
              <ul className="space-y-3 text-xs text-[#475569] pt-1">
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Explain installment schedules and balance summaries in plain language.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Draft standardized payment reminders and receipts confirmation notes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Translate schedule summaries into multiple languages (Bangla, Spanish, Portuguese).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Flag internal follow-up queue reminders for intake advisors.</span>
                </li>
              </ul>
            </div>

            {/* Prohibited AI */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 space-y-4 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
                <EyeOff className="h-3.5 w-3.5 text-rose-600" />
                <span>What AI Will NEVER Do</span>
              </div>
              <ul className="space-y-3 text-xs text-[#475569] pt-1">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold shrink-0">&times;</span>
                  <span>Never invent, guess, or modify financial amounts, discounts, or due dates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold shrink-0">&times;</span>
                  <span>Never autonomously issue refunds, waive late milestones, or alter ledger records.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold shrink-0">&times;</span>
                  <span>Never provide legal counsel or predict USCIS visa approval probabilities.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold shrink-0">&times;</span>
                  <span>Never share or expose client data to external public LLM training corpora.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM CTA ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
            Experience Transparent Advisory Management
          </h2>
          <p className="text-sm text-[#475569] max-w-xl mx-auto leading-relaxed">
            Join hundreds of researchers, founders, and professionals who manage their immigration and business payments with certainty.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.LOGIN} className="gap-2">
                <ShieldCheck className="h-4 w-4 text-[#F3A712]" />
                <span>Access Client Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.CONTACT}>
                <span>Speak with an Advisor</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
