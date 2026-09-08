"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  Briefcase,
  ArrowRight,
  CheckCircle,
  FileCheck,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "United States",
    service: "EB-2 NIW",
    language: "English",
    consent: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-[#092244] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href={ROUTES.HOME} className="inline-block transition-transform hover:scale-102">
            <div className="relative h-12 w-56 mx-auto">
              <Image
                src="/logo.svg"
                alt="PayTrack AI by AdSkill"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Client Case Intake &amp; Portal Registration
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(9,34,68,0.06)]">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-bold text-[#092244]">
                Case Profile Registered
              </h2>
              <p className="text-sm text-[#475569] leading-relaxed max-w-sm mx-auto">
                Welcome, <strong>{formData.fullName}</strong>. An AdSkill consultant will finalize your milestone fee schedule and send your secure portal activation link to <strong>{formData.email}</strong>.
              </p>
              <div className="pt-4">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#092244] px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#0d2e5a]"
                >
                  <span>Go to Client Login</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b border-[#EAE6DF] pb-3 mb-4">
                <h2 className="text-lg font-bold text-[#092244]">
                  New Client Registration
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Set up your client profile to access your agreed payment schedule and milestone invoices.
                </p>
              </div>

              {/* Full Legal Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#092244]">
                  Full Legal Name (as in Passport) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Rahim"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] pl-10 pr-3.5 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                  />
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#092244]">
                  Primary Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] pl-10 pr-3.5 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                  />
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
                </div>
              </div>

              {/* Phone & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#092244]">
                    WhatsApp / Mobile Phone *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] pl-10 pr-3.5 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                    />
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#092244]">
                    Country of Residence
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="United States"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] pl-10 pr-3.5 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                    />
                    <Globe className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
                  </div>
                </div>
              </div>

              {/* Service & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#092244]">
                    Target Advisory Service *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#092244] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                  >
                    <option value="EB-2 NIW">EB-2 NIW (National Interest Waiver)</option>
                    <option value="EB-1A">EB-1A (Extraordinary Ability)</option>
                    <option value="EB-3">EB-3 (Skilled / Professional)</option>
                    <option value="E-2/L-1">E-2 & L-1 Business Petitions</option>
                    <option value="Business Formation">Business Incorporation / DMV</option>
                    <option value="Family Support">Family Immigration & Green Card</option>
                    <option value="Custom">Custom Advisory Plan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#092244]">
                    Preferred Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#092244] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Bangla">Bangla (বাংলা)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="Portuguese">Portuguese (Português)</option>
                  </select>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#475569]">
                  <input
                    type="checkbox"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="h-4 w-4 mt-0.5 rounded border-[#EAE6DF] text-[#092244] focus:ring-[#F3A712]"
                  />
                  <span>
                    I consent to receiving electronic invoices, receipt notices, and payment schedule updates from AdSkill Consultancy Inc.
                  </span>
                </label>
              </div>

              {/* Privacy Reassurance Note (Spec Section 4) */}
              <div className="rounded-xl bg-[#FAF8F5] p-3 text-[11px] text-[#64748B] flex items-center gap-2 border border-[#EAE6DF]">
                <ShieldCheck className="h-4 w-4 text-[#F3A712] shrink-0" />
                <span>
                  Per privacy policy, we only record payment verification data. No sensitive immigration documents are collected during intake.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#092244] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0d2e5a] active:scale-[0.98]"
              >
                <FileCheck className="h-4 w-4 text-[#F3A712]" />
                <span>Submit Case Profile</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#64748B]">
          Already have an assigned consultant?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-bold text-[#092244] hover:underline"
          >
            Sign in to Client Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
