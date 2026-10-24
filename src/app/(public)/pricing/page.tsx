import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/common";
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
  Lock,
  FileText,
  DollarSign,
  Scale,
  Calendar,
  CheckCircle2,
  Wallet,
  Building2,
  ShieldAlert,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fee Schedules & Transparent Milestone Pricing — AdSkill PayTrack AI",
  description:
    "Explore transparent milestone payment models, program base fees, and strict regulatory fee separation policies for AdSkill Consultancy Inc.",
};

const topTierServices = [
  {
    code: "EB2-NIW",
    name: "EB-2 NIW (National Interest Waiver)",
    category: "Employment-Based",
    baseFee: "$8,000",
    govFee: "$715 (I-140)",
    structure: "3-Stage Milestones (40% Retainer / 30% Brief / 30% Filing)",
    popular: true,
  },
  {
    code: "EB1-A",
    name: "EB-1A (Extraordinary Ability)",
    category: "Priority Worker",
    baseFee: "$10,000",
    govFee: "$715 (I-140)",
    structure: "Deliverable Milestones (Deposit / Evidence Review / Submission)",
    popular: false,
  },
  {
    code: "E-2",
    name: "E-2 Treaty Investor Visa",
    category: "Investor Enterprise",
    baseFee: "$15,000",
    govFee: "$315 (Consular)",
    structure: "Entity Setup / Business Plan / Filing Phases",
    popular: true,
  },
  {
    code: "EB-3",
    name: "EB-3 Professional & Skilled Workers",
    category: "Employment",
    baseFee: "$24,000",
    govFee: "$715 (I-140)",
    structure: "Multi-Phase Milestone Plan (PERM, Wage, Filing)",
    popular: false,
  },
  {
    code: "EB-5",
    name: "EB-5 Immigrant Investor Green Card",
    category: "High Net Worth",
    baseFee: "$35,655",
    govFee: "$11,160 (I-526E)",
    structure: "Multi-Tranche Milestone & Escrow Schedule",
    popular: false,
  },
  {
    code: "COS-B1-F1",
    name: "Change of Status (B1/B2 to F-1)",
    category: "Student & Status",
    baseFee: "$1,250",
    govFee: "$470 (I-539)",
    structure: "2-Stage Installment (50% Retainer / 50% Final)",
    popular: false,
  },
  {
    code: "F-1",
    name: "F-1 Student Visa & Admission Support",
    category: "Student & Status",
    baseFee: "$800",
    govFee: "$185 (DS-160)",
    structure: "Upfront Fixed Milestone",
    popular: false,
  },
  {
    code: "I-20-COORD",
    name: "I-20 Coordination & University Placement",
    category: "Education",
    baseFee: "$300",
    govFee: "$0 (Institutional)",
    structure: "Single Deliverable Fee",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#0a0a0a] min-h-screen">
      {/* ── 1. HEADER ── */}
      <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-24 border-b border-[#EAE6DF]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-[#F3A712]/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00] shadow-xs">
            <BadgePercent className="h-3.5 w-3.5" />
            <span>Deterministic Pricing &amp; Milestone Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0a0a0a]">
            Transparent Milestone Plans. Zero Hidden Fees.
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            Every AdSkill agreement defines exact contracted deliverables, scheduled milestones, and distinct separation between consulting fees and statutory government costs.
          </p>
        </div>
      </section>

      {/* ── 2. THREE STANDARD PAYMENT STRUCTURES ── */}
      <section className="py-16 sm:py-20 border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
              Installment Models
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              Flexible Installment Structures
            </h2>
            <p className="text-sm text-[#475569]">
              Choose the financial model that aligns with your timeline and cash flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Model 1: Milestone Installments */}
            <div className="rounded-3xl border-2 border-[#F3A712] bg-white p-7 sm:p-8 shadow-sm flex flex-col justify-between space-y-6 relative ring-1 ring-[#F3A712]/40">
              <div className="absolute -top-3 left-6 px-3.5 py-1 rounded-full bg-[#0a0a0a] text-white text-[11px] font-bold uppercase tracking-wider">
                Most Popular
              </div>

              <div className="space-y-5 pt-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                    Deliverable-Gated
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a0a0a] mt-1">
                    3-Stage Milestone Plan
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed mt-2">
                    Standard for EB-2 NIW and EB-1A petitions. You only release subsequent funds after concrete draft deliverables are approved.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE6DF] space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Deposit (40%):</strong> Retainer, profile intake &amp; endeavor framework
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Milestone 2 (30%):</strong> Comprehensive petition brief &amp; recommendation letters review
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Milestone 3 (30%):</strong> Final filing readiness package &amp; submission check
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild size="sm" className="w-full">
                <Link href={ROUTES.CONTACT} className="gap-2">
                  <span>Inquire for Milestone Plan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {/* Model 2: Monthly Recurring */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                    Even Cashflow
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a0a0a] mt-1">
                    Monthly Recurring Plan
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed mt-2">
                    Evenly spread out payments across 3 to 12 months with automatic ledger logging and card auto-debit receipts.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE6DF] space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Fixed Monthly Installments:</strong> Predictable recurring invoice
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Instant Receipts:</strong> Automatic tax-compliant PDF receipt generation
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Zero Compounding:</strong> Grace period with zero compounding interest
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={ROUTES.CONTACT} className="gap-2">
                  <span>Explore Monthly Options</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {/* Model 3: Corporate & Investor Retainer */}
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                    Enterprise &amp; Investor
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a0a0a] mt-1">
                    Custom Enterprise Retainer
                  </h3>
                  <p className="text-xs text-[#475569] leading-relaxed mt-2">
                    Tailored for E-2 treaty investors, EB-5 syndicates, and multi-employee corporate transfers.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EAE6DF] space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">Multi-Entity Billing:</strong> Grouped statements across beneficiaries
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">State Escrow Tracking:</strong> Dedicated corporate escrow for government fees
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#0a0a0a]">CPA / Attorney Split:</strong> Full ledger reconciliation with outside counsel
                    </div>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={ROUTES.CONTACT} className="gap-2">
                  <span>Request Corporate Retainer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SERVICE FEE MATRIX (TRANSPARENT TABLE) ── */}
      <section className="py-16 sm:py-20 bg-white border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                Standard Fee Matrix
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] mt-1">
                Primary Case Offerings &amp; Statutory Costs
              </h2>
              <p className="text-sm text-[#475569] mt-1">
                Clear separation between AdSkill Advisory Fees and USCIS / Agency statutory disbursements.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.ADVISORY}>
                <span>View Full 28-Service Catalog &rarr;</span>
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5]/50">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-xs font-bold text-[#0a0a0a] uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Service / Program</th>
                  <th className="py-4 px-6">AdSkill Base Fee</th>
                  <th className="py-4 px-6">USCIS / Agency Fee</th>
                  <th className="py-4 px-6">Installment Plan</th>
                  <th className="py-4 px-6 text-right">Inquire</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF] bg-white">
                {topTierServices.map((svc) => (
                  <tr key={svc.code} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#0a0a0a]">{svc.name}</div>
                      <div className="text-[11px] font-mono text-[#64748B]">{svc.code} &bull; {svc.category}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-[#0a0a0a]">{svc.baseFee}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#64748B]">
                      {svc.govFee}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#475569]">
                      {svc.structure}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                        <Link href={ROUTES.CONTACT}>Select</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-[#64748B] mt-4 italic">
            * Note: Government statutory filing fees are subject to change by USCIS / State agencies. Premium Processing (Form I-907 $2,805) is optional and charged directly by DHS.
          </p>
        </div>
      </section>

      {/* ── 4. PAYMENT METHODS & CHANNELS ── */}
      <section className="py-16 bg-[#F5F2EC]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
              Secure Gateways
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              Accepted Payment Channels
            </h2>
            <p className="text-sm text-[#475569]">
              All payments are verified against the client ledger with instant PDF receipt issuance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 text-center space-y-2 shadow-xs">
              <CreditCard className="h-6 w-6 text-[#F3A712] mx-auto" />
              <div className="font-bold text-[#0a0a0a] text-sm">Credit &amp; Debit Cards</div>
              <div className="text-xs text-[#64748B]">Stripe PCI-DSS Level 1 hosted checkout (Visa, MC, Amex).</div>
            </div>

            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 text-center space-y-2 shadow-xs">
              <Building2 className="h-6 w-6 text-[#F3A712] mx-auto" />
              <div className="font-bold text-[#0a0a0a] text-sm">U.S. Domestic ACH</div>
              <div className="text-xs text-[#64748B]">Direct bank-to-bank transfer with zero surcharge fees.</div>
            </div>

            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 text-center space-y-2 shadow-xs">
              <Wallet className="h-6 w-6 text-[#F3A712] mx-auto" />
              <div className="font-bold text-[#0a0a0a] text-sm">Zelle &amp; Wire Transfer</div>
              <div className="text-xs text-[#64748B]">Rapid verification for domestic and international wire deposits.</div>
            </div>

            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-5 text-center space-y-2 shadow-xs">
              <FileText className="h-6 w-6 text-[#F3A712] mx-auto" />
              <div className="font-bold text-[#0a0a0a] text-sm">Certified Checks</div>
              <div className="text-xs text-[#64748B]">Cashier's checks and money orders payable to AdSkill Consultancy.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM CTA ── */}
      <section className="py-16 sm:py-20 border-t border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
            Ready to Begin or Inspect an Active Schedule?
          </h2>
          <p className="text-sm text-[#475569] max-w-xl mx-auto leading-relaxed">
            Existing clients can log in to view paid invoices and remaining milestone balances. New applicants can contact us for custom payment arrangements.
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
                <span>Contact Case Team</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
