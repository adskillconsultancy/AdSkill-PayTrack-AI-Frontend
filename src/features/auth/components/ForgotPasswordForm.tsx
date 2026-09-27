"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants";
import { useForgotPasswordMutation } from "@/services/api/auth/authApi";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    setErrorMessage(null);

    try {
      await forgotPassword({ email: email.trim() }).unwrap();
      setIsSubmitted(true);
    } catch (err: any) {
      const msg = err?.data?.message || "Failed to process request. Please try again.";
      setErrorMessage(msg);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(10,10,10,0.06)] text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[#0a0a0a]">Check Your Email</h2>
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          If an account exists for <span className="font-semibold text-[#0a0a0a]">{email}</span>, a secure password reset link has been dispatched.
        </p>
        <p className="text-xs text-[#94A3B8] mt-2">
          The link will expire in 1 hour for security purposes.
        </p>

        <div className="mt-6 pt-5 border-t border-[#EAE6DF] flex flex-col gap-2">
          <Button
            type="button"
            variant="subtle"
            className="w-full"
            onClick={() => setIsSubmitted(false)}
          >
            Try another email
          </Button>
          <Link href={ROUTES.LOGIN}>
            <Button variant="ghost" className="w-full text-xs text-[#64748B]">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(10,10,10,0.06)]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF8F5] border border-[#EAE6DF] text-[#F3A712]">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-[#0a0a0a]">Forgot Password?</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Enter your registered email address and we'll send you instructions to reset your password.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0a0a0a]">
            Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
            />
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <span>Sending Link...</span>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70 ml-1" />
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href={ROUTES.LOGIN}
            className="text-xs font-semibold text-[#64748B] hover:text-[#0a0a0a] transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Sign In
          </Link>
        </div>
      </form>
    </div>
  );
}
