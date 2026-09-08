import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import {
  Check,
  ShieldCheck,
  CreditCard,
  Building,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  BadgePercent,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fee Schedules & Payment Plans — AdSkill PayTrack AI",
  description:
    "Transparent installment models, milestone payment schedules, and fee policy for AdSkill Consultancy Inc.",
};

export default function PricingPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#092244] min-h-screen">
      {/* ── HEADER ── */}
      <section className="pt-14 pb-16 border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00]">
            <BadgePercent className="h-3.5 w-3.5" />
            <span>Deterministic Payment Models</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#092244]">
            Transparent Milestone Plans
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            We do not believe in hidden costs. Every client agreement specifies upfront contracted fees, exact installment milestones, and separate government disbursements.
          </p>
        </div>
      </section>

      {/* ── 3 PAYMENT STRUCTURES (SECTION 6 OF SPEC) ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Model 1: Milestone Installments */}
            <div className="rounded-2xl border-2 border-[#F3A712]/50 bg-white p-7 shadow-sm flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#092244] text-white text-[11px] font-bold uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                  Deliverable-Based
                </div>
                <h3 className="text-2xl font-bold text-[#092244]">
                  3-Stage Milestone Plan
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Ideal for EB-2 NIW and EB-1A petitions. You only release subsequent payments as key case milestones are accomplished.
                </p>

                <div className="pt-4 border-t border-[#EAE6DF] space-y-2.5 text-xs text-[#475569]">
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span><strong>Deposit (40%):</strong> Retainer & evidence audit</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span><strong>Milestone 2 (30%):</strong> Draft & brief delivery</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span><strong>Milestone 3 (30%):</strong> Final filing readiness</span>
                  </div>
                </div>
              </div>

              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#092244] py-3 text-xs font-bold text-white hover:bg-[#0d2e5a] transition-all"
              >
                <span>Select Milestone Model</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Model 2: Monthly Recurring */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                  Predictable Budgeting
                </div>
                <h3 className="text-2xl font-bold text-[#092244]">
                  Fixed Monthly Schedule
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Even installments distributed over 3, 6, or 9 months via automatic card authorization or ACH transfers.
                </p>

                <div className="pt-4 border-t border-[#EAE6DF] space-y-2.5 text-xs text-[#475569]">
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span>Fixed contracted fee split into equal parts</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span>Automatic email/WhatsApp reminders (7 &amp; 3 days)</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span>Grace period with zero hidden compounding interest</span>
                  </div>
                </div>
              </div>

              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#092244] bg-white py-3 text-xs font-bold text-[#092244] hover:bg-[#FAF8F5] transition-all"
              >
                <span>Inquire About Monthly Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Model 3: Custom Retainer */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                  Corporate &amp; Investor
                </div>
                <h3 className="text-2xl font-bold text-[#092244]">
                  Custom Corporate Retainer
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Tailored for E-2 treaty investors, L-1 enterprise groups, and multiple simultaneous family immigration filings.
                </p>

                <div className="pt-4 border-t border-[#EAE6DF] space-y-2.5 text-xs text-[#475569]">
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span>Multi-beneficiary grouped billing statements</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span>Separate state statutory filing escrow tracking</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-[#092244]">
                    <Check className="h-4 w-4 text-[#F3A712]" />
                    <span>Direct CPA/Attorney fee reconciliation</span>
                  </div>
                </div>
              </div>

              <Link
                href={ROUTES.CONTACT}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#092244] bg-white py-3 text-xs font-bold text-[#092244] hover:bg-[#FAF8F5] transition-all"
              >
                <span>Request Custom Agreement</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── PAYMENT METHODS SUPPORTED ── */}
      <section className="py-14 bg-[#F5F2EC] border-t border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
            Payment Gateways &amp; Methods
          </span>
          <h2 className="text-2xl font-bold text-[#092244]">
            Accepted Payment Channels
          </h2>
          <p className="text-sm text-[#475569] max-w-xl mx-auto">
            Pay safely through Stripe hosted checkout, US Domestic ACH, International Bank Wire, Zelle, and certified checks with automatic ledger reconciliation.
          </p>
        </div>
      </section>
    </div>
  );
}
