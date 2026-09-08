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
} from "lucide-react";

export const metadata: Metadata = {
  title: "About AdSkill PayTrack AI — Infrastructure & Security",
  description:
    "Learn about AdSkill Consultancy Inc. and the deterministic accounting standards powering the PayTrack AI platform.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] text-[#092244] min-h-screen">
      {/* ── HERO ── */}
      <section className="pt-14 pb-16 border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00]">
            <Building2 className="h-3.5 w-3.5" />
            <span>AdSkill Consultancy Inc.</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#092244]">
            Engineering Financial Trust for Global Clients
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            PayTrack AI was built to give every client and consultant one reliable, mathematically verified source of truth for advisory agreements, installments, and receipts.
          </p>
        </div>
      </section>

      {/* ── THE STORY & PROBLEM SOLVED ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-7 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                Our Background
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#092244]">
                From Fragmented Spreadsheets to Bank-Grade Certainty
              </h2>
              <p className="text-sm leading-relaxed text-[#475569]">
                Immigration and corporate petitions are multi-month, milestone-heavy engagements. Clients often had to track separate wire receipts, installment schedules, and government filing costs across disjointed emails.
              </p>
              <p className="text-sm leading-relaxed text-[#475569]">
                <strong>AdSkill PayTrack AI</strong> eliminates that friction. Every client has a private portal showing exactly what was contracted, what deposit was cleared, what milestone is due next, and instant download of certified tax-ready receipts.
              </p>
            </div>

            <div className="md:col-span-5 rounded-2xl border border-[#EAE6DF] bg-white p-7 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-[#092244]">
                Key Platform Guarantees
              </h3>
              <ul className="space-y-3 text-xs text-[#475569]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <span><strong>Zero Float Arithmetic:</strong> Stored in cents, never floating point values.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <span><strong>Immutable Audit Logs:</strong> Financial changes preserve previous values with actor IP timestamps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <span><strong>Client Isolation:</strong> Cross-client URL tampering is prevented at both UI and API layers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#F3A712] shrink-0 mt-0.5" />
                  <span><strong>PCI-DSS Compliant:</strong> Card data is never stored on company infrastructure.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI BOUNDARIES & GOVERNANCE (SECTION 14 OF SPEC) ── */}
      <section className="py-16 bg-[#F5F2EC] border-y border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
              Specification Section 14
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#092244] mt-1">
              Ethical & Controlled AI Boundaries
            </h2>
            <p className="text-sm text-[#475569] mt-2">
              How we strictly govern artificial intelligence to protect your financial records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Allowed AI */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>What AI Is Allowed To Do</span>
              </div>
              <ul className="space-y-2 text-xs text-[#475569] pt-2">
                <li>&bull; Plain-language schedule & balance explanations.</li>
                <li>&bull; Drafting standardized reminder notifications.</li>
                <li>&bull; Multilingual schedule translation (Bangla, Spanish, Portuguese).</li>
                <li>&bull; Staff follow-up summaries and anomaly flagging.</li>
              </ul>
            </div>

            {/* Prohibited AI */}
            <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                <EyeOff className="h-3.5 w-3.5" />
                <span>What AI Will NEVER Do</span>
              </div>
              <ul className="space-y-2 text-xs text-[#475569] pt-2">
                <li>&bull; Never invent or change financial balances or dates.</li>
                <li>&bull; Never autonomously issue refunds or waive fees.</li>
                <li>&bull; Never offer legal advice or predict visa approval rates.</li>
                <li>&bull; Never expose client financial data to public models.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#092244]">
            Ready to View Your Milestone Plan?
          </h2>
          <p className="text-sm text-[#475569] max-w-xl mx-auto">
            Log in with your assigned client ID to check your active case status and receipts.
          </p>
          <div className="pt-2">
            <Button asChild className="rounded-xl bg-[#092244] px-6 h-11 text-sm font-bold text-white shadow-sm hover:bg-[#0d2e5a]">
              <Link href={ROUTES.LOGIN} className="gap-2">
                <span>Access Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
