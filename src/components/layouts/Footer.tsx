import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { Shield, Lock, FileCheck, ExternalLink } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#EAE6DF] bg-[#F5F2EC] text-[#334155] transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <Link href={ROUTES.HOME} className="inline-block">
              <div className="relative h-10 w-48">
                <Image
                  src="/logo.svg"
                  alt="PayTrack AI by AdSkill"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-[#475569] max-w-md">
              The official financial tracking and client management infrastructure for{" "}
              <strong className="text-[#092244] font-semibold">AdSkill Consultancy Inc.</strong> Designed for
              transparent installment schedules, automated milestone payments, and deterministic accounting across immigration and business cases.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-medium text-[#64748B]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EAE6DF]">
                <Lock className="h-3.5 w-3.5 text-[#092244]" />
                <span>PCI-DSS Hosted Checkout</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EAE6DF]">
                <Shield className="h-3.5 w-3.5 text-[#F3A712]" />
                <span>Zero-Hallucination AI</span>
              </span>
            </div>
          </div>

          {/* Quick Links: Services */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#092244]">
              Consultancy Cases
            </h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#092244] transition-colors">
                  EB-2 NIW National Interest Waiver
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#092244] transition-colors">
                  EB-1A Extraordinary Ability
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#092244] transition-colors">
                  EB-3 Employment-Based Petitions
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#092244] transition-colors">
                  E-2 & L-1 Business & Investor Visas
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#092244] transition-colors">
                  Corporate Formation & DMV/PSB
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Platform */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#092244]">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li>
                <Link href={ROUTES.ABOUT} className="hover:text-[#092244] transition-colors">
                  About AdSkill
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRICING} className="hover:text-[#092244] transition-colors">
                  Fee Separation Policy
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LOGIN} className="hover:text-[#092244] transition-colors">
                  Client Portal Login
                </Link>
              </li>
              <li>
                <Link href={ROUTES.REGISTER} className="hover:text-[#092244] transition-colors">
                  Client Case Onboarding
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CONTACT} className="hover:text-[#092244] transition-colors">
                  Consultant Inquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Governance & Legal */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#092244]">
              Governance
            </h4>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li>
                <Link href={ROUTES.PRIVACY_POLICY} className="hover:text-[#092244] transition-colors">
                  Privacy Notice
                </Link>
              </li>
              <li>
                <Link href={ROUTES.TERMS} className="hover:text-[#092244] transition-colors">
                  Terms of Agreement
                </Link>
              </li>
              <li>
                <span className="text-xs text-[#64748B] block pt-2">
                  Portal Version: 2.0.4 MVP
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#EAE6DF]/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p className="text-center md:text-left leading-relaxed">
            &copy; {currentYear} AdSkill Consultancy Inc. All rights reserved. Professional fees are tracked separately from USCIS government fees and attorney expenses.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>Deterministic Accounting</span>
            <span>&bull;</span>
            <span>OWASP Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
