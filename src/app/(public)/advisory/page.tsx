import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/common";
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
  GraduationCap,
  Globe2,
  FileSpreadsheet,
  Building2,
  DollarSign,
  Receipt,
  Scale,
  Car,
  Plane,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Advisory Services & Service Catalog — AdSkill PayTrack AI",
  description:
    "Explore our complete service catalog across U.S. Immigration, Business Formations, Profile Mentoring, and Strategic Advisory with upfront fee structures.",
};

const serviceCategories = [
  {
    name: "Employment & Merit-Based Immigration",
    badge: "Merit & Talent Petitions",
    description: "High-level petitions for exceptional scholars, founders, professionals, and specialized global talent.",
    items: [
      {
        id: "eb2-niw",
        code: "EB2-NIW",
        title: "EB-2 NIW (National Interest Waiver)",
        baseFee: "$8,000",
        govFee: "$715 (USCIS Form I-140)",
        coverage: "Proposed endeavor drafting, 3-prong Dhanasar analysis, recommendation letter advisory, expert evidence curation, and formal petition brief.",
        timeline: "3-Stage Milestone Plan (Deposit, Draft & Brief Review, Final Submission)",
        icon: Award,
        popular: true,
      },
      {
        id: "eb1-a",
        code: "EB1-A",
        title: "EB-1A (Extraordinary Ability)",
        baseFee: "$10,000",
        govFee: "$715 (USCIS Form I-140)",
        coverage: "Elite evidence audit meeting 3+ regulatory criteria: major awards, scholarly citations, original contributions, media features, and critical judging roles.",
        timeline: "Phased Milestone Installments",
        icon: Sparkles,
        popular: false,
      },
      {
        id: "eb-3",
        code: "EB-3",
        title: "EB-3 (Skilled / Professional / Unskilled)",
        baseFee: "$24,000",
        govFee: "$715 (USCIS Form I-140)",
        coverage: "Comprehensive end-to-end petition management through PERM labor certification stages, prevailing wage determination, and USCIS filing.",
        timeline: "Multi-Phase Milestone Plan",
        icon: Briefcase,
        popular: false,
      },
    ],
  },
  {
    name: "Investor, Business & Corporate Services",
    badge: "Corporate & Enterprise",
    description: "Enterprise formation, treaty investor visas, and cross-border commercial expansions.",
    items: [
      {
        id: "e-2",
        code: "E-2",
        title: "E-2 Investor Visa & Enterprise Package",
        baseFee: "$15,000",
        govFee: "$315 (Consular / USCIS)",
        coverage: "Treaty enterprise capitalization, source of funds audit, commercial enterprise structuring, hiring timeline, and full consular briefing.",
        timeline: "Entity Setup + Evidence + Filing Milestones",
        icon: Building,
        popular: true,
      },
      {
        id: "eb-5",
        code: "EB-5",
        title: "EB-5 Investor Green Card (Form I-526)",
        baseFee: "$35,655",
        govFee: "$11,160 (USCIS Form I-526E)",
        coverage: "Targeted Employment Area (TEA) validation, extensive lawful capital tracing, job creation economic impact reports, and escrow coordination.",
        timeline: "Multi-Tranche Escrow Schedule",
        icon: Globe2,
        popular: false,
      },
      {
        id: "biz-formation",
        code: "BIZ-FORMATION",
        title: "U.S. Business Formation (LLC / Corporation)",
        baseFee: "Custom Retainer",
        govFee: "State Filing & Licensing (Variable)",
        coverage: "Articles of Organization / Incorporation, Registered Agent coordination, Operating Agreements, Corporate Kits, and State Licensing.",
        timeline: "Fixed 2-Phase Fee",
        icon: Building2,
        popular: false,
      },
      {
        id: "bp-e2",
        code: "BP-E2 / FIN-PROJ",
        title: "Business Plan Development & Financial Projections",
        baseFee: "Consulting Fee",
        govFee: "$0 (Advisory Only)",
        coverage: "Matter of Ho compliant 5-year financial models, industry market analysis, staffing projections, and enterprise pro-forma spreadsheets.",
        timeline: "Initial Draft + Revisions Milestone",
        icon: FileSpreadsheet,
        popular: false,
      },
    ],
  },
  {
    name: "Student, Status & Family Services",
    badge: "Education & Family",
    description: "Academic enrollment support, status transitions, and family reunification filings.",
    items: [
      {
        id: "cos-b1-f1",
        code: "COS-B1-F1",
        title: "Change of Status (B1/B2 → F-1)",
        baseFee: "$1,250",
        govFee: "$470 (USCIS Form I-539)",
        coverage: "Status maintenance review, SEVIS I-20 coordination, Form I-539 documentation, intent statement review, and USCIS filing.",
        timeline: "2-Stage Installment (Deposit + Final Filing)",
        icon: GraduationCap,
        popular: true,
      },
      {
        id: "f-1",
        code: "F-1 / I-20",
        title: "F-1 Student Visa & I-20 Coordination",
        baseFee: "$800 (F-1) / $300 (I-20)",
        govFee: "$185 (DS-160) + SEVIS I-901",
        coverage: "University admission facilitation, SEVIS portal coordination, DS-160 preparation, financial affidavit audit, and mock visa interview prep.",
        timeline: "Per-Stage Installments",
        icon: GraduationCap,
        popular: false,
      },
      {
        id: "i-485",
        code: "I-485",
        title: "Adjustment of Status (Green Card Application)",
        baseFee: "Custom Advisory",
        govFee: "$1,440 (USCIS Form I-485)",
        coverage: "Package preparation for Form I-485, work authorization (I-765), advance parole (I-131), and public charge compliance checks.",
        timeline: "Filing Phase Retainer",
        icon: FileCheck,
        popular: false,
      },
      {
        id: "i-130",
        code: "I-130",
        title: "Family-Based Petitions (Form I-130)",
        baseFee: "Custom Advisory",
        govFee: "$675 (USCIS Form I-130)",
        coverage: "Spouse, parent, and sibling petitions, bona-fide marriage proof audit, civil document validation, and consular processing packages.",
        timeline: "Milestone-Based Schedule",
        icon: Users,
        popular: false,
      },
      {
        id: "n-400",
        code: "N-400",
        title: "Naturalization & U.S. Citizenship",
        baseFee: "Custom Advisory",
        govFee: "$760 (USCIS Form N-400)",
        coverage: "Continuous residence verification, physical presence audit, moral character documentation, civics and English interview readiness.",
        timeline: "2-Stage Milestone Fee",
        icon: Shield,
        popular: false,
      },
    ],
  },
  {
    name: "Strategic Advisory, Mentoring & Legal Support",
    badge: "Mentorship & Case Support",
    description: "Hands-on profile building, recommendation letter drafting, and legal counsel coordination.",
    items: [
      {
        id: "profile-mentor",
        code: "PROFILE-MENTOR",
        title: "EB-1A / EB-2 NIW Profile Mentoring",
        baseFee: "Consulting Retainer",
        govFee: "$0 (Advisory Only)",
        coverage: "Targeted strategy sessions to build publication citations, secure journal peer-review invitations, media coverage, and organizational memberships.",
        timeline: "Monthly or Milestone Retainer",
        icon: Sparkles,
        popular: true,
      },
      {
        id: "rec-letters",
        code: "REC-LETTERS / PETITION",
        title: "Petition Drafting & Expert Recommendation Letters",
        baseFee: "Deliverable Fee",
        govFee: "$0 (Advisory Only)",
        coverage: "Customized technical reference letters from independent and dependent experts, legal exhibit indexation, and technical endeavor framing.",
        timeline: "Per-Letter / Milestone Basis",
        icon: FileCheck,
        popular: false,
      },
      {
        id: "rfe-response",
        code: "RFE-RESPONSE",
        title: "RFE & NOID Response Strategy",
        baseFee: "Case Review Fee",
        govFee: "$0 (Advisory Only)",
        coverage: "Point-by-point rebuttal strategy, supplementary evidence gathering, and legal coordination for complex USCIS Request for Evidence notices.",
        timeline: "Immediate Rapid Turnaround",
        icon: Scale,
        popular: false,
      },
      {
        id: "atty-coord",
        code: "ATTY-COORD",
        title: "Attorney Coordination & End-to-End Case Management",
        baseFee: "Integrated Plan",
        govFee: "Separate Attorney Escrow",
        coverage: "Seamless bridging between applicant, accredited attorneys of record (Form G-28), translated documents, and payment reconciliation.",
        timeline: "Full Case Lifecycle",
        icon: Briefcase,
        popular: false,
      },
    ],
  },
];

export default function AdvisoryPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#0a0a0a] min-h-screen">
      {/* ── 1. HERO ── */}
      <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-24 border-b border-[#EAE6DF]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-[#F3A712]/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00] shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AdSkill Consultancy Inc. Official Service Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0a0a0a]">
            Advisory Services &amp; Transparent Fee Catalog
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-3xl mx-auto">
            From premier <strong>EB-2 NIW</strong> and <strong>EB-1A</strong> petitions to <strong>E-2 Investor Visas</strong>, student status changes, and business entity formation &mdash; every service is governed by predictable milestone payments and strict fee separation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild size="lg">
              <Link href={ROUTES.PRICING}>
                <Receipt className="h-4 w-4 mr-2 text-[#F3A712]" />
                <span>View Payment Models &amp; Pricing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.CONTACT}>
                <span>Request Custom Consultation</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. REGULATORY FEE SEPARATION CALLOUT (SPEC SECTION 5) ── */}
      <section className="py-12 bg-white border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="rounded-3xl border-2 border-[#F3A712]/40 bg-gradient-to-br from-[#FFFDF9] via-[#FAF8F5] to-white p-7 sm:p-9 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0a0a0a] text-[#F3A712] shadow-md">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                    Specification Section 5 Standard
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0a0a0a]">
                    Strict Regulatory Fee Separation Policy
                  </h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                100% Escrow &amp; Cost Transparency
              </span>
            </div>

            <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">
              Under AdSkill Consultancy financial governance, <strong>AdSkill Professional Advisory Fees</strong> cover petition drafting, strategy, document review, and case coordination. They are tracked and invoiced completely separately from external statutory costs:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
                <div className="font-bold text-[#0a0a0a] text-sm">USCIS Statutory Fees</div>
                <div className="text-[#64748B] mt-1.5 leading-relaxed">
                  Direct government fees (e.g. Form I-140 $715, Form I-485 $1,440, Premium Processing I-907 $2,805) are paid directly to the U.S. Department of Homeland Security.
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
                <div className="font-bold text-[#0a0a0a] text-sm">Attorney Representation</div>
                <div className="text-[#64748B] mt-1.5 leading-relaxed">
                  Retained licensed legal counsel and formal Form G-28 attorney-of-record fees are handled in dedicated attorney trust accounts.
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
                <div className="font-bold text-[#0a0a0a] text-sm">Credential &amp; Translations</div>
                <div className="text-[#64748B] mt-1.5 leading-relaxed">
                  NACES-certified degree evaluations, certified ATA translations, and independent expert testimony are invoiced at pure pass-through cost.
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#EAE6DF] shadow-xs">
                <div className="font-bold text-[#0a0a0a] text-sm">State &amp; Corporate Filings</div>
                <div className="text-[#64748B] mt-1.5 leading-relaxed">
                  State business incorporation fees, registered agent expenses, and statutory publication requirements are billed with zero markup.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. DETAILED SERVICE CATALOG BY CATEGORY ── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-16">
          {serviceCategories.map((cat, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EAE6DF] pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                    {cat.badge}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a] mt-1">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-[#475569] mt-1">
                    {cat.description}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#64748B]">
                  {cat.items.length} Programs Available
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cat.items.map((svc) => {
                  const Icon = svc.icon;
                  return (
                    <div
                      key={svc.id}
                      className={`relative rounded-3xl border bg-white p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-5 ${
                        svc.popular ? "border-[#F3A712] ring-1 ring-[#F3A712]/30" : "border-[#EAE6DF]"
                      }`}
                    >
                      {svc.popular && (
                        <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#0a0a0a] text-white text-[10px] font-bold uppercase tracking-wider">
                          Primary Offering
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] text-[#0a0a0a]">
                            <Icon className="h-5 w-5 text-[#F3A712]" />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-[#64748B] bg-[#FAF8F5] px-2.5 py-1 rounded-md border border-[#EAE6DF]">
                            {svc.code}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-[#0a0a0a] leading-snug">
                            {svc.title}
                          </h3>
                          <p className="text-xs text-[#475569] leading-relaxed mt-2">
                            {svc.coverage}
                          </p>
                        </div>

                        {/* Pricing and Gov Fee Breakdown */}
                        <div className="rounded-2xl bg-[#FAF8F5] p-3.5 border border-[#EAE6DF] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[#64748B] font-medium">AdSkill Base Fee:</span>
                            <span className="text-[#0a0a0a] font-extrabold text-sm">{svc.baseFee}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-[#EAE6DF]/70 text-[11px]">
                            <span className="text-[#64748B]">Gov / Agency Cost:</span>
                            <span className="text-[#0a0a0a] font-semibold">{svc.govFee}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 pt-1">
                          <Clock className="h-3.5 w-3.5 text-[#F3A712] shrink-0" />
                          <span><strong>Schedule:</strong> {svc.timeline}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button asChild size="sm" className="w-full gap-2">
                          <Link href={ROUTES.CONTACT}>
                            <span>Inquire for {svc.code}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <section className="py-16 bg-[#F5F2EC] border-t border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
              Lifecycle Walkthrough
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
              How Your Case &amp; Installments Work
            </h2>
            <p className="text-sm text-[#475569]">
              Every client journey follows transparent, verifiable milestone gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-white border border-[#EAE6DF] p-6 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0a] text-white font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-[#0a0a0a] text-base">Profile Evaluation</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Complimentary assessment of your resume, citations, endeavor merits, and petition eligibility.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-[#EAE6DF] p-6 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0a] text-white font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-[#0a0a0a] text-base">Contracted Retainer</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Clear contract specifying upfront fee, 3-stage milestones, and separate government disbursements.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-[#EAE6DF] p-6 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0a] text-white font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-[#0a0a0a] text-base">PayTrack Portal</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Instant access to your private portal with live ledger balance, upcoming dates, and receipt downloads.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-[#EAE6DF] p-6 shadow-xs space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0a0a] text-white font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-[#0a0a0a] text-base">Milestone Release</h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Next installments are only due when petition drafts and milestones are verified and completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a0a0a]">
            Already an AdSkill Client?
          </h2>
          <p className="text-sm text-[#475569] max-w-xl mx-auto leading-relaxed">
            Sign in with your email or phone to view your active case milestones, download official PDF receipts, or pay an upcoming installment.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={ROUTES.LOGIN} className="gap-2">
                <Shield className="h-4 w-4 text-[#F3A712]" />
                <span>Log In to Client Portal</span>
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
