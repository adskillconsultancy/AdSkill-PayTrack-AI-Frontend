import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/common";
import {
  ShieldCheck,
  CreditCard,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText,
  BadgePercent,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Briefcase,
  Building,
  GraduationCap,
  Globe2,
  Receipt,
  MapPin,
  Phone,
  MessageSquare,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AdSkill PayTrack AI — Client Payment Tracker & Financial Portal",
  description:
    "Official payment tracking, milestone installments, and client billing portal for AdSkill Consultancy Inc. (Jackson Heights, NY).",
};

export default function HomePage() {
  return (
    <div className="bg-[#FAF8F5] text-[#0a0a0a] min-h-screen">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Soft Warm Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#F3A712]/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#0a0a0a]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Official Endorsement Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#EAE6DF] bg-white/90 text-xs font-semibold text-[#0a0a0a] shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#F3A712]" />
                <span className="text-[#475569]">AdSkill Consultancy Inc. &bull; Jackson Heights, NY</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#0a0a0a] leading-[1.12]">
                Transparent Client Fees.{" "}
                <span className="text-[#B47B00]">
                  Automated Milestone
                </span>{" "}
                Payment Tracking.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                One verified source of truth for AdSkill clients and advisors.
                Track installment schedules for EB-2 NIW ($8k), EB-1A ($10k), E-2 Investor ($15k), and business cases
                with deterministic accounting, instant Stripe checkout, and controlled AI assistance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="shadow-sm"
                >
                  <Link href={ROUTES.LOGIN}>
                    <ShieldCheck className="h-5 w-5 text-[#F3A712] mr-2" />
                    <span>Access Client Portal</span>
                    <ArrowRight className="h-4 w-4 opacity-80 ml-2" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                >
                  <Link href={ROUTES.ADVISORY}>
                    <span>Explore 28-Service Catalog</span>
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Stripe PCI-DSS Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Deterministic Math Ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Private Isolated Portals</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive-Style Payment Card Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-[0_16px_50px_-12px_rgba(10,10,10,0.12)] transition-all">
                {/* Header of Card */}
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      Client Agreement #ASK-2841
                    </div>
                    <div className="text-base font-bold text-[#0a0a0a]">
                      EB-2 NIW Petition Agreement
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Active Plan
                  </span>
                </div>

                {/* Balance Summary */}
                <div className="my-5 rounded-2xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-[#64748B]">Contracted Base Fee</span>
                    <span className="text-xl font-extrabold text-[#0a0a0a]">$8,000.00</span>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-[#64748B]">
                    <span>Paid to Date: <strong className="text-[#0a0a0a]">$3,200.00</strong> (40%)</span>
                    <span>Remaining: <strong className="text-[#B47B00]">$4,800.00</strong></span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EAE6DF]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#0a0a0a] to-[#F3A712] w-[40%]" />
                  </div>
                </div>

                {/* Milestone Schedule */}
                <div className="space-y-3 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    3-Stage Milestone Gates
                  </div>

                  {/* Milestone 1 - Paid */}
                  <div className="flex items-center justify-between rounded-xl border border-[#EAE6DF] bg-white p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0a0a0a]">1. Retainer &amp; Endeavor Audit (40%)</div>
                        <div className="text-[11px] text-[#64748B]">Cleared &bull; Receipt #REC-1042</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#0a0a0a]">$3,200.00</span>
                  </div>

                  {/* Milestone 2 - Due Next */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-[#F3A712]/60 bg-[#FFFBEB]/50 p-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3A712] text-white font-bold text-[10px]">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-[#0a0a0a]">2. Petition Brief &amp; Draft Delivery (30%)</div>
                        <div className="text-[11px] text-[#B47B00] font-medium">Draft Review Milestone</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#0a0a0a]">$2,400.00</span>
                  </div>

                  {/* Milestone 3 - Upcoming */}
                  <div className="flex items-center justify-between rounded-xl border border-[#EAE6DF] bg-white/60 p-3 opacity-75">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAE6DF] text-[#64748B] font-bold text-[10px]">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-[#0a0a0a]">3. Final Filing Readiness (30%)</div>
                        <div className="text-[11px] text-[#64748B]">Upon Petition Finalization</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#64748B]">$2,400.00</span>
                  </div>
                </div>

                {/* Instant Pay with Stripe CTA */}
                <div className="mt-5 pt-4 border-t border-[#EAE6DF]">
                  <Button
                    asChild
                    className="w-full gap-2 text-xs"
                  >
                    <Link href={ROUTES.LOGIN}>
                      <CreditCard className="h-4 w-4 text-[#F3A712]" />
                      <span>Pay Milestone via Secure Hosted Portal</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. METRICS BANNER ── */}
      <section className="border-y border-[#EAE6DF] bg-[#F5F2EC]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#0a0a0a]">100%</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Deterministic Math
              </div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#0a0a0a]">28+</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Catalog Offerings
              </div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#0a0a0a]">0%</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                AI Hallucination
              </div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#0a0a0a]">PCI-DSS</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Hosted Stripe Checkout
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FOUR CORE SYSTEM PILLARS ── */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#B47B00]">
              Engineered for Financial Integrity
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-[#0a0a0a] tracking-tight">
              Why Clients &amp; Advisors Rely On PayTrack AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Precise Accounting */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] mb-5 font-bold">
                <TrendingUp className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">
                Deterministic Logic
              </h3>
              <p className="text-xs leading-relaxed text-[#475569]">
                All fees, discounts, partial payments, and overdue balances are calculated in exact decimal cents &mdash; never rounded or guessed by generative AI.
              </p>
            </div>

            {/* Pillar 2: Fee Separation */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] mb-5 font-bold">
                <BadgePercent className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">
                Strict Fee Separation
              </h3>
              <p className="text-xs leading-relaxed text-[#475569]">
                AdSkill advisory fees are cleanly isolated from USCIS statutory fees, attorney escrow, and degree evaluation costs for 100% financial transparency.
              </p>
            </div>

            {/* Pillar 3: Branded Invoices */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] mb-5 font-bold">
                <FileText className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">
                Certified PDF Receipts
              </h3>
              <p className="text-xs leading-relaxed text-[#475569]">
                Sequential, tax-compliant PDF receipts stamped with AdSkill legal credentials, remaining balance, and verified transaction IDs.
              </p>
            </div>

            {/* Pillar 4: Controlled AI */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a] mb-5 font-bold">
                <Sparkles className="h-6 w-6 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a0a0a] mb-2">
                Controlled AI Boundaries
              </h3>
              <p className="text-xs leading-relaxed text-[#475569]">
                Strict governance: AI translates schedules and formats reminder notices, but is strictly prohibited from altering ledger amounts or dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FLAGSHIP CASE TYPES SHOWCASE ── */}
      <section className="py-16 sm:py-20 bg-[#F5F2EC] border-t border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                Flagship Programs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] mt-1">
                Featured Advisory Programs &amp; Base Fees
              </h2>
            </div>
            <Button asChild variant="link" className="text-[#0a0a0a] font-bold hover:text-[#B47B00] p-0 h-auto gap-1">
              <Link href={ROUTES.ADVISORY}>
                <span>Explore all 28 services &rarr;</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* EB-2 NIW */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#B47B00] tracking-wider">
                    Merit-Based
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0a0a0a] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE6DF]">
                    EB2-NIW
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0a0a0a]">
                  EB-2 NIW Petition
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  National Interest Waiver for advanced researchers, engineers, and exceptional ability candidates.
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAE6DF] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">AdSkill Base Fee:</span>
                  <span className="font-extrabold text-[#0a0a0a] text-sm">$8,000</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>USCIS Form I-140:</span>
                  <span>$715</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>Payment Model:</span>
                  <span className="font-medium text-[#0a0a0a]">3-Stage Milestones</span>
                </div>
              </div>

              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href={ROUTES.CONTACT}>Inquire for EB-2 NIW</Link>
              </Button>
            </div>

            {/* EB-1A */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#B47B00] tracking-wider">
                    Priority Category
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0a0a0a] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE6DF]">
                    EB1-A
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0a0a0a]">
                  EB-1A Extraordinary Ability
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Top-tier petition for scholars, founders, athletes, and artists with significant career impact.
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAE6DF] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">AdSkill Base Fee:</span>
                  <span className="font-extrabold text-[#0a0a0a] text-sm">$10,000</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>USCIS Form I-140:</span>
                  <span>$715</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>Payment Model:</span>
                  <span className="font-medium text-[#0a0a0a]">Phased Milestones</span>
                </div>
              </div>

              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href={ROUTES.CONTACT}>Inquire for EB-1A</Link>
              </Button>
            </div>

            {/* E-2 Investor */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-[#B47B00] tracking-wider">
                    Investor &amp; Enterprise
                  </span>
                  <span className="text-xs font-mono font-bold text-[#0a0a0a] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE6DF]">
                    E-2
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0a0a0a]">
                  E-2 Treaty Investor Visa
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Treaty investor business enterprise setup, capitalization roadmap, and consular briefing package.
                </p>
              </div>

              <div className="pt-3 border-t border-[#EAE6DF] space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">AdSkill Base Fee:</span>
                  <span className="font-extrabold text-[#0a0a0a] text-sm">$15,000</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>Consular Filing:</span>
                  <span>$315</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#64748B]">
                  <span>Payment Model:</span>
                  <span className="font-medium text-[#0a0a0a]">Entity + Filing Phased</span>
                </div>
              </div>

              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href={ROUTES.CONTACT}>Inquire for E-2</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. HEADQUARTERS & CONTACT BANNER ── */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] p-8 sm:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                  <MapPin className="h-4 w-4" />
                  <span>Jackson Heights, New York</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
                  Visit Our Headquarters or Chat Instantly
                </h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Conveniently located at <strong>37-13 74th Street, Floor 2, Jackson Heights, NY 11372</strong>. Reach our advisory coordinators via phone, WhatsApp, or through the client portal 24/7.
                </p>
                <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
                  <a
                    href="https://maps.google.com/?q=37-13+74th+Street+Jackson+Heights+NY+11372"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#B47B00] hover:underline"
                  >
                    <span>Google Maps Directions &rarr;</span>
                  </a>
                  <a
                    href="https://wa.me/16467728544"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp: +1 646-772-8544</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl bg-white border border-[#EAE6DF] p-6 space-y-3 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Direct Contact Desk
                </div>
                <div className="space-y-1.5 text-xs text-[#475569]">
                  <div className="flex justify-between items-center">
                    <span>Primary Line:</span>
                    <a href="tel:+14255407996" className="font-bold text-[#0a0a0a] font-mono hover:text-[#B47B00]">+1 425-540-7996</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Secondary Line:</span>
                    <a href="tel:+16468818711" className="font-bold text-[#0a0a0a] font-mono hover:text-[#B47B00]">+1 646-881-8711</a>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Email:</span>
                    <a href="mailto:admin@adskillconsultancy.com" className="font-bold text-[#0a0a0a] hover:text-[#B47B00]">admin@adskillconsultancy.com</a>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#EAE6DF]">
                  <Button asChild size="sm" className="w-full">
                    <Link href={ROUTES.CONTACT}>Send an Inquiry</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. CALL TO ACTION ── */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] text-white p-10 sm:p-14 lg:p-16 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F3A712]/15 blur-[120px] pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#F3A712] border border-white/10">
                <Lock className="h-3.5 w-3.5" />
                <span>Secure Company-Owned Platform</span>
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Access Your AdSkill Account &amp; Milestone Schedule
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Log in to inspect your contracted agreement, upcoming payment dates,
                verified receipts, and download certified invoices.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  className="rounded-xl bg-[#F3A712] px-6 h-12 text-sm font-bold text-[#0a0a0a] shadow-md hover:bg-[#ffb526] active:scale-[0.98]"
                >
                  <Link href={ROUTES.LOGIN}>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span>Enter Client Portal</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-white/20 bg-white/5 px-6 h-12 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href={ROUTES.CONTACT}>
                    <span>Contact Billing Support</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
