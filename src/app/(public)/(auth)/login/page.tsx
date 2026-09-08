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
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  Building,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [portalType, setPortalType] = useState<"client" | "staff">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password123!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login and redirect
    setTimeout(() => {
      setIsLoading(false);
      router.push(ROUTES.DASHBOARD);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-[#092244] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Card Header */}
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
            Unified Financial Portal &amp; Milestone Tracker
          </p>
        </div>

        {/* Main Login Card */}
        <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(9,34,68,0.06)]">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 rounded-xl bg-[#FAF8F5] p-1 border border-[#EAE6DF] mb-6">
            <button
              type="button"
              onClick={() => setPortalType("client")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                portalType === "client"
                  ? "bg-[#092244] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#092244]"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Client Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setPortalType("staff")}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                portalType === "staff"
                  ? "bg-[#092244] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#092244]"
              }`}
            >
              <Building className="h-3.5 w-3.5" />
              <span>Staff / Manager</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / ID Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#092244]">
                {portalType === "client" ? "Client Email or ID" : "Staff Email Address"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={
                    portalType === "client"
                      ? "client@example.com or #ASK-1042"
                      : "staff@adskillconsultancy.com"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] pl-10 pr-3.5 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#092244]">
                  Password
                </label>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-xs font-semibold text-[#B47B00] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] pl-10 pr-10 py-2.5 text-sm text-[#092244] placeholder:text-[#94A3B8] focus:border-[#F3A712] focus:bg-white focus:outline-none"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#94A3B8] hover:text-[#092244]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#475569]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-[#EAE6DF] text-[#092244] focus:ring-[#F3A712]"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#092244] py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0d2e5a] active:scale-[0.98] disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4 text-[#F3A712]" />
              <span>
                {isLoading
                  ? "Authenticating..."
                  : portalType === "client"
                  ? "Sign In to Client Portal"
                  : "Sign In to Management"}
              </span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
            </button>
          </form>

          {/* Demo Quick-Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-[#EAE6DF] space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
              <KeyRound className="h-3 w-3 text-[#F3A712]" />
              <span>Quick Test Credentials:</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPortalType("client");
                  handleQuickFill("client@example.com");
                }}
                className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-medium transition-colors"
              >
                Client Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalType("staff");
                  handleQuickFill("finance@adskillconsultancy.com");
                }}
                className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-medium transition-colors"
              >
                Finance Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalType("staff");
                  handleQuickFill("admin@adskillconsultancy.com");
                }}
                className="px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-medium transition-colors"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#64748B]">
          New client starting an immigration case?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="font-bold text-[#092244] hover:underline"
          >
            Submit Case Registration
          </Link>
        </div>
      </div>
    </div>
  );
}
