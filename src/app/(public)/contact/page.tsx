"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button, Input } from "@/components/common";
import {
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle,
  ShieldCheck,
  MessageSquare,
  MapPin,
  ExternalLink,
  Sparkles,
  Building2,
  CalendarCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useCreateLeadMutation } from "@/services/api/leads/leadsApi";

// Map service codes from the dropdown to their exact database UUIDs
const SERVICE_ID_MAP: Record<string, string> = {
  "EB2-NIW": "ff96b294-3b2d-43dc-b2bd-56ffc4a513a7",
  "EB1-A": "0034dfee-0bd6-4875-bec7-aab60c90d26a",
  "EB-3": "d5fbc1ed-6b96-43a2-ae52-ee216787babc",
  "E-2": "4d84fdbb-a39c-412b-a50d-99acb3d79174",
  "EB-5": "d91f4278-2f5a-4b87-bb47-e7d772e866ef",
  "BIZ-FORMATION": "a144aa5c-2fa9-49de-8528-35269c390ffc",
  "BP-E2": "aacf8fbe-057a-4eaa-9503-4edbdc28ef76",
  "COS-B1-F1": "6459a070-5282-443a-a1b0-16be839b90ca",
  "F-1": "e589cb59-5c75-4572-b9ca-6c1dbd00e703",
  "I-485": "c4d9b3fe-ad78-4858-8ad9-541bc62c617b",
  "I-130": "849d52c1-a32b-4565-91a2-a658fc100ae3",
  "N-400": "d486bbc0-a573-41ab-b925-2e617fd34c45",
  "PROFILE-MENTOR": "3375e8ed-f69b-4089-8e5e-54ac6a1c6021",
  "RFE-RESPONSE": "ba6cfdad-f980-462a-a680-f772ec40e37c",
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdClientCode, setCreatedClientCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "EB2-NIW",
    message: "",
  });

  const [createLead, { isLoading }] = useCreateLeadMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Phone or WhatsApp number is required.");
      return;
    }

    try {
      const mappedServiceId = SERVICE_ID_MAP[formData.service] || undefined;
      const res = await createLead({
        fullName: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        serviceId: mappedServiceId,
        leadSource: "Website Contact Page",
        whatClientWants: `Program: ${formData.service}\nDetails: ${formData.message.trim()}`,
        remarks: `Submitted via Public Website Advisory Form on ${new Date().toLocaleDateString()}`,
        status: "NEW",
        priority: "HIGH",
      }).unwrap();

      if (res?.data?.clientCode) {
        setCreatedClientCode(res.data.clientCode);
      }
      setSubmitted(true);
    } catch (err: any) {
      console.error("Lead submission error:", err);
      const apiMsg = err?.data?.message || err?.error || "Failed to submit inquiry. Please try again or reach out via WhatsApp.";
      setErrorMessage(apiMsg);
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-[#0a0a0a] min-h-screen">
      {/* ── 1. HEADER ── */}
      <section className="relative overflow-hidden pt-14 pb-16 lg:pt-20 lg:pb-24 border-b border-[#EAE6DF]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[340px] bg-[#F3A712]/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00] shadow-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AdSkill Consultancy Client Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0a0a0a]">
            Connect With Our Advisory Team
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            Questions regarding case fee schedules, payment verification, or consulting agreements? Visit our New York headquarters, reach us via WhatsApp, phone, or submit an inquiry below.
          </p>
        </div>
      </section>

      {/* ── 2. MAIN CONTENT ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Direct Info Cards */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                  Direct Channels
                </span>
                <h2 className="text-2xl font-extrabold text-[#0a0a0a]">
                  Official Contact Channels
                </h2>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Existing clients can reference their <strong>Client Code</strong> (e.g. #ASK-XXXX) for instant file lookup.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Office Address Card */}
                <div className="group rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs hover:border-[#F3A712]/60 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
                      <MapPin className="h-6 w-6 text-[#F3A712]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#B47B00]">
                        Headquarters
                      </div>
                      <div className="font-bold text-[#0a0a0a] text-sm">
                        AdSkill Consultancy Inc.
                      </div>
                      <p className="text-[#475569] leading-relaxed pt-0.5">
                        37-13 74th Street, Floor 2<br />
                        Jackson Heights, NY 11372
                      </p>
                      <a
                        href="https://maps.google.com/?q=37-13+74th+Street+Jackson+Heights+NY+11372"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B47B00] hover:underline pt-2"
                      >
                        <span>Open in Google Maps</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Priority Card */}
                <div className="group rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <MessageSquare className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Rapid Direct Chat
                      </div>
                      <div className="font-bold text-[#0a0a0a] text-sm">
                        WhatsApp Coordinator Desk
                      </div>
                      <a
                        href="https://wa.me/16467728544"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base font-extrabold text-emerald-800 hover:text-emerald-900 block font-mono pt-0.5"
                      >
                        +1 646-772-8544
                      </a>
                      <p className="text-[11px] text-[#475569]">
                        Instant response during business hours for file updates &amp; quick inquiries.
                      </p>
                      <a
                        href="https://wa.me/16467728544"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline pt-1.5"
                      >
                        <span>Start Chat on WhatsApp &rarr;</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct Phone Numbers */}
                <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
                      <Phone className="h-6 w-6 text-[#F3A712]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        Telephone Lines
                      </div>
                      <div className="font-bold text-[#0a0a0a] text-sm">
                        Direct Advisory Call Centers
                      </div>
                      <div className="space-y-1 pt-1">
                        <div>
                          <span className="text-[11px] text-[#64748B] block">Primary Line:</span>
                          <a
                            href="tel:+14255407996"
                            className="text-sm font-bold text-[#0a0a0a] hover:text-[#B47B00] font-mono transition-colors"
                          >
                            +1 425-540-7996
                          </a>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#64748B] block">Secondary Line:</span>
                          <a
                            href="tel:+16468818711"
                            className="text-sm font-bold text-[#0a0a0a] hover:text-[#B47B00] font-mono transition-colors"
                          >
                            +1 646-881-8711
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Email */}
                <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
                      <Mail className="h-6 w-6 text-[#F3A712]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        Official Email
                      </div>
                      <div className="font-bold text-[#0a0a0a] text-sm">
                        Advisory &amp; Billing Inquiries
                      </div>
                      <a
                        href="mailto:admin@adskillconsultancy.com"
                        className="text-sm font-bold text-[#0a0a0a] hover:text-[#B47B00] block transition-colors pt-0.5"
                      >
                        admin@adskillconsultancy.com
                      </a>
                      <div className="text-[#64748B] text-[11px]">Average response: 2-4 business hours</div>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F5] text-[#0a0a0a] border border-[#EAE6DF]">
                      <Clock className="h-6 w-6 text-[#F3A712]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                        Hours of Operation
                      </div>
                      <div className="font-bold text-[#0a0a0a] text-sm">
                        Advisory &amp; Office Schedule
                      </div>
                      <p className="text-[#475569] leading-relaxed pt-0.5">
                        Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM EST<br />
                        Saturday &ndash; Sunday: By Appointment
                      </p>
                      <div className="text-[#64748B] text-[11px] pt-1">Client Portal &amp; Stripe Checkout active 24/7/365</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Callout */}
              <div className="rounded-3xl border-2 border-[#F3A712]/40 bg-[#FFFDF9] p-6 text-xs text-[#475569] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#0a0a0a] text-sm">
                  <ShieldCheck className="h-5 w-5 text-[#F3A712]" />
                  <span>Already an Active AdSkill Client?</span>
                </div>
                <p className="leading-relaxed">
                  Log in to your private portal to view upcoming milestone dates, download certified tax receipts, and check case progress.
                </p>
                <div className="pt-1">
                  <Button asChild size="sm" variant="outline" className="h-8 text-xs font-bold">
                    <Link href={ROUTES.LOGIN}>Log In to Portal &rarr;</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-[#EAE6DF] bg-white p-8 sm:p-10 shadow-sm">
                {submitted ? (
                  <div className="text-center py-14 space-y-5">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold text-[#0a0a0a]">
                        Inquiry Received Successfully
                      </h3>
                      {createdClientCode && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-mono font-bold text-[#B47B00] mt-2">
                          Lead Reference: #{createdClientCode}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{formData.name}</strong>. Your inquiry has been registered in our case management system. An AdSkill case coordinator will review your background and reach out within 24 hours.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false);
                        setCreatedClientCode(null);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          service: "EB2-NIW",
                          message: "",
                        });
                      }}
                      className="mt-4"
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold text-[#B47B00]">
                        <Sparkles className="h-3 w-3" />
                        Direct Case Intake
                      </div>
                      <h3 className="text-2xl font-extrabold text-[#0a0a0a] mt-2">
                        Send an Advisory Inquiry
                      </h3>
                      <p className="text-xs text-[#64748B] mt-1">
                        Fill in your background details. Our coordinators review each submission under strict confidentiality.
                      </p>
                    </div>

                    {errorMessage && (
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>{errorMessage}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0a0a0a]">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder="e.g. Dr. Jane Smith"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-11 rounded-xl border-[#EAE6DF] bg-[#FAF8F5] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0a0a0a]">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          placeholder="jane@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-11 rounded-xl border-[#EAE6DF] bg-[#FAF8F5] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0a0a0a]">
                          WhatsApp / Phone Number *
                        </label>
                        <Input
                          type="tel"
                          required
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-11 rounded-xl border-[#EAE6DF] bg-[#FAF8F5] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#0a0a0a]">
                          Program / Service of Interest *
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full h-11 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 text-sm text-[#0a0a0a] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                        >
                          <optgroup label="Merit-Based Immigration">
                            <option value="EB2-NIW">EB-2 NIW (National Interest Waiver)</option>
                            <option value="EB1-A">EB-1A (Extraordinary Ability)</option>
                            <option value="EB-3">EB-3 (Skilled / Professional Worker)</option>
                          </optgroup>
                          <optgroup label="Investor & Business">
                            <option value="E-2">E-2 Investor Visa & Enterprise</option>
                            <option value="EB-5">EB-5 Immigrant Investor</option>
                            <option value="BIZ-FORMATION">U.S. Business Formation (LLC / Corp)</option>
                            <option value="BP-E2">Business Plan & Financial Projections</option>
                          </optgroup>
                          <optgroup label="Student & Family">
                            <option value="COS-B1-F1">Change of Status (B1/B2 → F-1)</option>
                            <option value="F-1">F-1 Student Visa & Admission</option>
                            <option value="I-485">Adjustment of Status (Form I-485)</option>
                            <option value="I-130">Family Petitions (Form I-130)</option>
                            <option value="N-400">Naturalization / Citizenship (N-400)</option>
                          </optgroup>
                          <optgroup label="Mentoring & Legal Support">
                            <option value="PROFILE-MENTOR">Profile Mentoring (Citations & Evidence)</option>
                            <option value="RFE-RESPONSE">RFE / NOID Response Strategy</option>
                            <option value="GENERAL">General Billing & Ledger Inquiries</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0a0a0a]">
                        Brief Background / Inquiry Details *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your background, degree/experience, target deadlines, or installment plan questions..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-3 text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 placeholder:font-normal focus:border-[#F3A712] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="w-full gap-2 font-bold"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-[#F3A712]" />
                            <span>Registering Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 text-[#F3A712]" />
                            <span>Submit Advisory Inquiry</span>
                          </>
                        )}
                      </Button>
                      <p className="text-[11px] text-[#64748B] text-center mt-2.5">
                        Strict confidentiality guaranteed. We never sell or share client data.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
