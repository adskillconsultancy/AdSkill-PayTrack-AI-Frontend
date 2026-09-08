"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormValues } from "@/validations/auth.schema";
import { ROUTES } from "@/constants";
import { Button, Input } from "@/components/common";
import {
  ShieldCheck,
  Mail,
  User,
  Phone,
  Globe,
  ArrowRight,
  CheckCircle,
  FileCheck,
} from "lucide-react";

export function RegisterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      country: "United States",
      service: "EB-2 NIW",
      language: "English",
      consent: true,
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setRegisteredName(data.fullName);
    setRegisteredEmail(data.email);
    setSubmitted(true);
  };

  return (
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
            Welcome, <strong>{registeredName}</strong>. An AdSkill consultant will finalize your milestone fee schedule and send your secure portal activation link to <strong>{registeredEmail}</strong>.
          </p>
          <div className="pt-4">
            <Button asChild className="rounded-xl bg-[#092244] px-6 h-10 text-xs font-bold text-white shadow-sm hover:bg-[#0d2e5a]">
              <Link href={ROUTES.LOGIN}>
                <span>Go to Client Login</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Input
                type="text"
                {...register("fullName")}
                placeholder="e.g. Mohammad Rahim"
                className={`pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712] ${
                  errors.fullName ? "border-rose-500" : "border-[#EAE6DF]"
                }`}
              />
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
            </div>
            {errors.fullName && (
              <p className="text-[11px] font-medium text-rose-500 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#092244]">
              Primary Email Address *
            </label>
            <div className="relative">
              <Input
                type="email"
                {...register("email")}
                placeholder="client@example.com"
                className={`pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712] ${
                  errors.email ? "border-rose-500" : "border-[#EAE6DF]"
                }`}
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
            </div>
            {errors.email && (
              <p className="text-[11px] font-medium text-rose-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#092244]">
                WhatsApp / Mobile Phone *
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  {...register("phone")}
                  placeholder="+1 (555) 000-0000"
                  className={`pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712] ${
                    errors.phone ? "border-rose-500" : "border-[#EAE6DF]"
                  }`}
                />
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
              </div>
              {errors.phone && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#092244]">
                Country of Residence *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  {...register("country")}
                  placeholder="United States"
                  className={`pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712] ${
                    errors.country ? "border-rose-500" : "border-[#EAE6DF]"
                  }`}
                />
                <Globe className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
              </div>
              {errors.country && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          {/* Service & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#092244]">
                Target Advisory Service *
              </label>
              <select
                {...register("service")}
                className="w-full h-10 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 text-sm text-[#092244] focus:border-[#F3A712] focus:bg-white focus:outline-none"
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
                {...register("language")}
                className="w-full h-10 rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-3.5 text-sm text-[#092244] focus:border-[#F3A712] focus:bg-white focus:outline-none"
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
                {...register("consent")}
                className="h-4 w-4 mt-0.5 rounded border-[#EAE6DF] text-[#092244] focus:ring-[#F3A712]"
              />
              <span>
                I consent to receiving electronic invoices, receipt notices, and payment schedule updates from AdSkill Consultancy Inc.
              </span>
            </label>
            {errors.consent && (
              <p className="text-[11px] font-medium text-rose-500 mt-1">
                {errors.consent.message}
              </p>
            )}
          </div>

          {/* Privacy Safeguard Note */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 text-[11px] text-[#64748B] flex items-center gap-2 border border-[#EAE6DF]">
            <ShieldCheck className="h-4 w-4 text-[#F3A712] shrink-0" />
            <span>
              Per privacy policy, we only record payment verification data. No sensitive immigration documents are collected during intake.
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 gap-2 rounded-xl bg-[#092244] text-sm font-bold text-white shadow-sm hover:bg-[#0d2e5a] active:scale-[0.98] disabled:opacity-50"
          >
            <FileCheck className="h-4 w-4 text-[#F3A712]" />
            <span>{isSubmitting ? "Submitting..." : "Submit Case Profile"}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-70 ml-1" />
          </Button>
        </form>
      )}
    </div>
  );
}
