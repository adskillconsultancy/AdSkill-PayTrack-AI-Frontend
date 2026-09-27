"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants";
import { useResetPasswordMutation } from "@/services/api/auth/authApi";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMessage("Missing or invalid password reset token. Please request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setErrorMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage(null);

    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err?.data?.message || "Password reset failed. The link may have expired.";
      setErrorMessage(msg);
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(10,10,10,0.06)] text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[#0a0a0a]">Invalid Reset Link</h2>
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          This password reset link is invalid or incomplete. Please request a new password reset link.
        </p>
        <div className="mt-6 pt-5 border-t border-[#EAE6DF]">
          <Link href={ROUTES.FORGOT_PASSWORD}>
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(10,10,10,0.06)] text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[#0a0a0a]">Password Reset Complete</h2>
        <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
          Your password has been successfully updated. You can now sign in with your new credentials.
        </p>

        <div className="mt-6 pt-5 border-t border-[#EAE6DF]">
          <Link href={ROUTES.LOGIN}>
            <Button className="w-full gap-2">
              <span>Sign In to Your Account</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70 ml-1" />
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
        <h2 className="text-xl font-bold text-[#0a0a0a]">Set New Password</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Choose a strong, secure password for your account.
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
            New Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="pl-10 pr-10 h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1.5 top-1 h-8 w-8 text-[#94A3B8] hover:text-[#0a0a0a] hover:bg-transparent"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            Must be at least 8 characters with upper, lower, number &amp; symbol.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#0a0a0a]">
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] border-[#EAE6DF] text-sm text-[#0a0a0a] placeholder:text-[#94A3B8]/60 focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712]"
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full gap-2 mt-2"
        >
          {isLoading ? (
            <span>Updating Password...</span>
          ) : (
            <>
              <span>Update Password</span>
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
