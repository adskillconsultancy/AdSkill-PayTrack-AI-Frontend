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
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "EB-2 NIW",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-[#FAF8F5] text-[#092244] min-h-screen">
      {/* ── HEADER ── */}
      <section className="pt-14 pb-16 border-b border-[#EAE6DF]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#EAE6DF] text-xs font-semibold text-[#B47B00]">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>AdSkill Consultancy Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#092244]">
            Connect With Our Advisory Team
          </h1>
          <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-2xl mx-auto">
            Questions regarding case fee schedules, payment verification, or consulting agreements? Our coordinators are here to assist.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Direct Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B47B00]">
                  Direct Assistance
                </span>
                <h2 className="text-2xl font-bold text-[#092244]">
                  Official Contact Channels
                </h2>
                <p className="text-sm text-[#475569] leading-relaxed">
                  For faster verification, active clients are encouraged to reference their <strong>Client ID</strong> (e.g. #ASK-XXXX) in all correspondence.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Email */}
                <div className="flex items-start gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF]">
                    <Mail className="h-5 w-5 text-[#F3A712]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#092244] text-sm">Official Billing & Inquiries</div>
                    <div className="text-[#475569] mt-0.5">billing@adskillconsultancy.com</div>
                    <div className="text-[#64748B] text-[11px] mt-1">Average response time: 2-4 hours</div>
                  </div>
                </div>

                {/* WhatsApp & Phone */}
                <div className="flex items-start gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF]">
                    <Phone className="h-5 w-5 text-[#F3A712]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#092244] text-sm">WhatsApp & Client Support</div>
                    <div className="text-[#475569] mt-0.5">+1 (555) ADSKILL-AI</div>
                    <div className="text-[#64748B] text-[11px] mt-1">Direct coordinator chat available</div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] text-[#092244] border border-[#EAE6DF]">
                    <Clock className="h-5 w-5 text-[#F3A712]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#092244] text-sm">Advisory Hours</div>
                    <div className="text-[#475569] mt-0.5">Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM EST</div>
                    <div className="text-[#64748B] text-[11px] mt-1">Automated portal accessible 24/7</div>
                  </div>
                </div>
              </div>

              {/* Active Client Callout */}
              <div className="rounded-2xl border border-[#F3A712]/40 bg-[#FFFDF9] p-5 text-xs text-[#475569]">
                <div className="flex items-center gap-2 font-bold text-[#092244] mb-1">
                  <ShieldCheck className="h-4 w-4 text-[#F3A712]" />
                  <span>Already Have an Active Case?</span>
                </div>
                <p>
                  You can inspect your exact fee breakdown, upcoming installments, and payment history by logging into the{" "}
                  <Link href={ROUTES.LOGIN} className="font-bold text-[#092244] underline hover:text-[#B47B00]">
                    Client Portal
                  </Link>.
                </p>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-xs">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#092244]">
                      Inquiry Received
                    </h3>
                    <p className="text-sm text-[#475569] max-w-md mx-auto">
                      Thank you, {formData.name}. An AdSkill case coordinator will review your request and contact you shortly.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-4 rounded-xl bg-[#092244] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0d2e5a]"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-[#092244]">
                        Send an Advisory Inquiry
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Fill in your details and our team will get back to you within one business day.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#092244]">
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          required
                          placeholder="e.g. Dr. Jane Smith"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="h-10 rounded-xl border-[#EAE6DF] bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#092244]">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          required
                          placeholder="jane@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-10 rounded-xl border-[#EAE6DF] bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#092244]">
                          WhatsApp / Phone
                        </label>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="h-10 rounded-xl border-[#EAE6DF] bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#092244]">
                          Case Program of Interest
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                          className="w-full h-10 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 text-sm text-[#092244] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                        >
                          <option value="EB-2 NIW">EB-2 NIW (National Interest Waiver)</option>
                          <option value="EB-1A">EB-1A (Extraordinary Ability)</option>
                          <option value="EB-3">EB-3 (Skilled & Professional)</option>
                          <option value="E-2/L-1">E-2 & L-1 Business Petitions</option>
                          <option value="Business Formation">Business Incorporation / DMV</option>
                          <option value="General">General Billing & Portal Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#092244]">
                        Inquiry / Case Notes *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us about your background, target petition deadline, or payment schedule questions..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 gap-2 rounded-xl bg-[#092244] text-sm font-bold text-white shadow-sm hover:bg-[#0d2e5a] active:scale-[0.98]"
                    >
                      <Send className="h-4 w-4 text-[#F3A712]" />
                      <span>Submit Advisory Inquiry</span>
                    </Button>
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
