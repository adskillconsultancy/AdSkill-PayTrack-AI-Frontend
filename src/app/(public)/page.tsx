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
} from "lucide-react";

export const metadata: Metadata = {
  title: "AdSkill PayTrack AI — Client Payment Tracker & Financial Portal",
  description:
    "Official payment tracking, milestone installments, and client billing portal for AdSkill Consultancy Inc.",
};

export default function HomePage() {
  return (
    <div className="bg-[#FAF8F5] text-[#092244] min-h-screen">
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        {/* Soft Warm Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#F3A712]/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#092244]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Official Endorsement Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#EAE6DF] bg-white/80 text-xs font-semibold text-[#092244] shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#F3A712]" />
                <span className="text-[#475569]">AdSkill Consultancy Inc. Flagship Financial System</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#092244] leading-[1.12]">
                Transparent Client Fees.{" "}
                <span className="text-[#B47B00]">
                  Automated Milestone
                </span>{" "}
                Payment Tracking.
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
                One verified source of truth for AdSkill clients and consultants.
                Track installment schedules for EB-2 NIW, EB-1A, and business cases
                with deterministic accounting, instant Stripe checkout, and controlled AI assistance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-[#092244] px-6 h-13 text-base font-bold text-white shadow-md shadow-[#092244]/15 hover:bg-[#0d2e5a] hover:shadow-lg hover:shadow-[#092244]/20 active:scale-[0.98]"
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
                  className="rounded-xl border-[#EAE6DF] bg-white px-6 h-13 text-base font-semibold text-[#092244] shadow-xs hover:bg-[#F5F2EC] active:scale-[0.98]"
                >
                  <Link href={ROUTES.SERVICES}>
                    <span>Explore Supported Cases</span>
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
                  <span>Deterministic Accounting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712]" />
                  <span>Private Isolated Accounts</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive-Style Payment Card Mockup */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-[0_12px_40px_-8px_rgba(9,34,68,0.1)] transition-all">
                {/* Header of Card */}
                <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                      Client Account
                    </div>
                    <div className="text-base font-bold text-[#092244]">
                      EB-2 NIW Petition Plan
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Active Plan
                  </span>
                </div>

                {/* Balance Summary */}
                <div className="my-5 rounded-xl bg-[#FAF8F5] p-4 border border-[#EAE6DF]">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-[#64748B]">Total Contracted Fee</span>
                    <span className="text-xl font-extrabold text-[#092244]">$6,500.00</span>
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-[#64748B]">
                    <span>Paid to Date: <strong className="text-[#092244]">$2,500.00</strong></span>
                    <span>Remaining: <strong className="text-[#B47B00]">$4,000.00</strong></span>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EAE6DF]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#092244] to-[#F3A712] w-[38%]" />
                  </div>
                </div>

                {/* Milestone Schedule */}
                <div className="space-y-3 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    Installment Milestones
                  </div>

                  {/* Milestone 1 - Paid */}
                  <div className="flex items-center justify-between rounded-lg border border-[#EAE6DF] bg-white p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#092244]">1. Initial Retainer & Audit</div>
                        <div className="text-[11px] text-[#64748B]">Paid on Sept 01, 2026 &bull; Receipt #REC-1042</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#092244]">$2,500.00</span>
                  </div>

                  {/* Milestone 2 - Due Next */}
                  <div className="flex items-center justify-between rounded-lg border-2 border-[#F3A712]/60 bg-[#FFFBEB]/50 p-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3A712] text-white font-bold text-[10px]">
                        2
                      </div>
                      <div>
                        <div className="font-bold text-[#092244]">2. Case Brief & Draft Review</div>
                        <div className="text-[11px] text-[#B47B00] font-medium">Due in 5 Days &bull; Sept 15, 2026</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#092244]">$2,000.00</span>
                  </div>

                  {/* Milestone 3 - Upcoming */}
                  <div className="flex items-center justify-between rounded-lg border border-[#EAE6DF] bg-white/60 p-3 opacity-75">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAE6DF] text-[#64748B] font-bold text-[10px]">
                        3
                      </div>
                      <div>
                        <div className="font-bold text-[#092244]">3. Final Submission Package</div>
                        <div className="text-[11px] text-[#64748B]">Upon Case Completion</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#64748B]">$2,000.00</span>
                  </div>
                </div>

                {/* Instant Pay with Stripe CTA */}
                <div className="mt-5 pt-4 border-t border-[#EAE6DF]">
                  <Button
                    asChild
                    className="w-full h-11 gap-2 rounded-xl bg-[#092244] text-xs font-bold text-white shadow-sm hover:bg-[#0d2e5a]"
                  >
                    <Link href={ROUTES.LOGIN}>
                      <CreditCard className="h-4 w-4 text-[#F3A712]" />
                      <span>Pay Milestone 2 via Secure Hosted Portal</span>
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
              <div className="text-3xl lg:text-4xl font-extrabold text-[#092244]">100%</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Deterministic Math
              </div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#092244]">0%</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                AI Hallucination
              </div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#092244]">6+</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Payment Methods
              </div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#092244]">256-bit</div>
              <div className="mt-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Encrypted Storage
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
              Engineered for Compliance
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-[#092244] tracking-tight">
              Why AdSkill Clients & Staff Rely On PayTrack AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Precise Accounting */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] mb-5 font-bold">
                <TrendingUp className="h-5 w-5 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#092244] mb-2">
                Deterministic Logic
              </h3>
              <p className="text-sm leading-relaxed text-[#475569]">
                All fees, discounts, partial payments, and overdue balances are calculated using exact decimal accounting — never rounded or guessed by generative models.
              </p>
            </div>

            {/* Pillar 2: Fee Separation */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] mb-5 font-bold">
                <BadgePercent className="h-5 w-5 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#092244] mb-2">
                Strict Fee Separation
              </h3>
              <p className="text-sm leading-relaxed text-[#475569]">
                AdSkill professional fees are cleanly separated from USCIS government fees, attorney fees, evaluation costs, and translations. 100% financial clarity.
              </p>
            </div>

            {/* Pillar 3: Branded Invoices */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] mb-5 font-bold">
                <FileText className="h-5 w-5 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#092244] mb-2">
                Branded PDF Receipts
              </h3>
              <p className="text-sm leading-relaxed text-[#475569]">
                Automatically generated sequential receipts and invoices stamped with AdSkill legal credentials, remaining balance, and verified transaction IDs.
              </p>
            </div>

            {/* Pillar 4: Controlled AI */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] mb-5 font-bold">
                <Sparkles className="h-5 w-5 text-[#F3A712]" />
              </div>
              <h3 className="text-lg font-bold text-[#092244] mb-2">
                Controlled AI Insights
              </h3>
              <p className="text-sm leading-relaxed text-[#475569]">
                Permission-aware AI translates schedules, drafts reminder notices, and summarizes payment progress without ever altering financial records autonomously.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SUPPORTED CASE TYPES SHOWCASE ── */}
      <section className="py-16 bg-[#F5F2EC] border-t border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                Covered Programs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#092244] mt-1">
                Supported Advisory & Visa Cases
              </h2>
            </div>
            <Button asChild variant="link" className="text-[#092244] font-bold hover:text-[#B47B00] p-0 h-auto gap-1">
              <Link href={ROUTES.SERVICES}>
                <span>View all service fee schedules</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* EB-2 NIW */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#B47B00] tracking-wider mb-1">
                Employment-Based
              </div>
              <h3 className="text-xl font-bold text-[#092244] mb-2">
                EB-2 NIW Petition
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">
                National Interest Waiver cases for advanced degree professionals and extraordinary researchers. 3-stage installment structure.
              </p>
              <div className="text-xs font-semibold text-[#64748B] pt-3 border-t border-[#EAE6DF] flex items-center gap-2">
                <Check className="h-4 w-4 text-[#F3A712]" />
                <span>Professional plan & evidence fees</span>
              </div>
            </div>

            {/* EB-1A */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#B47B00] tracking-wider mb-1">
                Priority Worker
              </div>
              <h3 className="text-xl font-bold text-[#092244] mb-2">
                EB-1A Extraordinary Ability
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">
                Elite petitions for researchers, athletes, artists, and business executives with custom milestone schedules.
              </p>
              <div className="text-xs font-semibold text-[#64748B] pt-3 border-t border-[#EAE6DF] flex items-center gap-2">
                <Check className="h-4 w-4 text-[#F3A712]" />
                <span>Milestone-based verification</span>
              </div>
            </div>

            {/* E-2 & L-1 Business */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#B47B00] tracking-wider mb-1">
                Investor & Corporate
              </div>
              <h3 className="text-xl font-bold text-[#092244] mb-2">
                E-2 & L-1 Business Formations
              </h3>
              <p className="text-sm text-[#475569] leading-relaxed mb-4">
                Treaty investor and intra-company transfer cases including corporate entity setup, business plans, and DMV/PSB filings.
              </p>
              <div className="text-xs font-semibold text-[#64748B] pt-3 border-t border-[#EAE6DF] flex items-center gap-2">
                <Check className="h-4 w-4 text-[#F3A712]" />
                <span>Government & 3rd party fee isolation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CALL TO ACTION ── */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#092244] text-white p-10 sm:p-14 lg:p-16 shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F3A712]/15 blur-[120px] pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#F3A712] border border-white/10">
                <Lock className="h-3.5 w-3.5" />
                <span>Secure Company-Owned Platform</span>
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Access Your AdSkill Account & Payment Schedule
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Log in to inspect your contracted agreement, upcoming payment dates,
                verified receipts, and download certified invoices.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  className="rounded-xl bg-[#F3A712] px-6 h-12 text-sm font-bold text-[#092244] shadow-md hover:bg-[#ffb526] active:scale-[0.98]"
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
