import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import {
  FileCheck,
  Award,
  Briefcase,
  Users,
  Building,
  Shield,
  Layers,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Advisory Services & Fee Structures — AdSkill PayTrack AI",
  description:
    "Explore supported immigration and business consulting services, transparent milestone payment plans, and strict fee separation policies.",
};

const services = [
  {
    id: "eb2-niw",
    category: "Employment-Based Immigration",
    title: "EB-2 NIW (National Interest Waiver)",
    description:
      "Comprehensive consultation, endeavor drafting, proposed endeavor roadmap, and petition support for researchers, engineers, and professionals of exceptional ability.",
    installments: "3-Stage Milestones (Deposit, Draft, Final)",
    coverage: "Professional endeavor drafting, recommendation letters framework, citation/impact evidence audit.",
  },
  {
    id: "eb1a",
    category: "Priority Category",
    title: "EB-1A (Extraordinary Ability)",
    description:
      "Elite petition management for candidates meeting at least three regulatory criteria in sciences, arts, education, business, or athletics.",
    installments: "Custom Milestone Schedules",
    coverage: "Major prizes audit, critical role analysis, scholarly publication vetting, and media review.",
  },
  {
    id: "eb3",
    category: "Permanent Residency",
    title: "EB-3 Professional & Skilled Workers",
    description:
      "Employment-based third preference support for skilled professionals and sponsored workers through PERM labor certification stages.",
    installments: "Multi-Phase Milestone Plan",
    coverage: "Sponsor documentation audit, prevailing wage tracking, and Form I-140 preparation support.",
  },
  {
    id: "e2-l1",
    category: "Investor & Corporate",
    title: "E-2 & L-1 Business Petitions",
    description:
      "Treaty investor enterprise setup and intra-company transfer management for managers, executives, and specialized knowledge personnel.",
    installments: "Entity Setup & Filing Milestones",
    coverage: "Qualifying investment tracking, corporate hierarchy verification, and business plan alignment.",
  },
  {
    id: "business-formation",
    category: "Corporate Advisory",
    title: "Business Formation & Corporate Filing",
    description:
      "State entity incorporation (LLC/C-Corp), registered agent services, employer identification numbers (EIN), and operating agreement structuring.",
    installments: "Fixed 2-Phase Fee",
    coverage: "Articles of organization, state compliance fees tracking, corporate kit, and licensing.",
  },
  {
    id: "family-immigration",
    category: "Family & Humanitarian",
    title: "Family Immigration & Consular Processing",
    description:
      "Spouse, parent, and child immediate relative petitions, adjustment of status (Form I-485), and consular interview preparation.",
    installments: "Deposit + Submission Milestones",
    coverage: "Affidavit of support (I-864) calculations, civil documents verification, and interview readiness.",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#092244] min-h-screen">
      {/* ── HEADER INTRO ── */}
      <section className="pt-14 pb-16 border-b border-[#EAE6DF] bg-[#FAF8F5]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AdSkill Consultancy Inc. Service Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#092244]">
            Consulting Services & Milestone Schedules
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            Every AdSkill service is structured with clear milestone deliverables, deterministic installment schedules, and strict fee separation from government costs.
          </p>
        </div>
      </section>

      {/* ── FEE SEPARATION CALLOUT (SECTION 5 OF SPEC) ── */}
      <section className="py-12 bg-white border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="rounded-2xl border-2 border-[#F3A712]/40 bg-[#FFFDF9] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#092244] text-[#F3A712]">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#092244]">
                  Regulatory Fee Separation Policy
                </h2>
                <p className="text-xs text-[#64748B]">
                  Specification Section 5 &bull; AdSkill Consultancy Financial Rule
                </p>
              </div>
            </div>

            <p className="text-sm text-[#475569] leading-relaxed">
              In strict accordance with AdSkill Consultancy governance, <strong>AdSkill Professional Advisory Fees</strong> are recorded and tracked completely separately from:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="font-bold text-[#092244]">USCIS Government Fees</div>
                <div className="text-[#64748B] mt-1">Filing fees, biometric fees, and Premium Processing (Form I-907).</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="font-bold text-[#092244]">Attorney Representation</div>
                <div className="text-[#64748B] mt-1">Separate retained legal counsel and attorney of record expenses.</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="font-bold text-[#092244]">3rd Party Evaluations</div>
                <div className="text-[#64748B] mt-1">Academic credential audits, certified translations, and expert letters.</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAE6DF]">
                <div className="font-bold text-[#092244]">CPA & Licensing</div>
                <div className="text-[#64748B] mt-1">Business formation statutory state filing fees and accounting fees.</div>
              </div>
            </div>
            <p className="text-xs text-[#64748B] mt-4 italic">
              *Government and third-party fees are collected in escrow or paid directly to agencies and never count as AdSkill company revenue.
            </p>
          </div>
        </div>
      </section>

      {/* ── SERVICE CARDS GRID ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="rounded-2xl border border-[#EAE6DF] bg-white p-7 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B47B00]">
                    {svc.category}
                  </span>
                  <h3 className="text-xl font-bold text-[#092244]">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#EAE6DF]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B] font-medium">Standard Schedule:</span>
                    <span className="font-bold text-[#092244] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EAE6DF]">
                      {svc.installments}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748B] flex items-start gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-[#F3A712] shrink-0 mt-0.5" />
                    <span>{svc.coverage}</span>
                  </div>
                </div>

                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#092244] py-3 text-xs font-bold text-white transition-all hover:bg-[#0d2e5a]"
                >
                  <span>View Case Plan in Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM BANNER ── */}
      <section className="py-14 border-t border-[#EAE6DF] bg-[#F5F2EC]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#092244]">
            Have an Assigned Case Manager?
          </h2>
          <p className="text-sm text-[#475569] max-w-xl mx-auto">
            Log in to the client portal using your credentials to view your personalized installment dates, remaining balances, and payment receipts.
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 rounded-xl bg-[#092244] px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#0d2e5a] transition-all"
            >
              <span>Go to Client Portal</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
