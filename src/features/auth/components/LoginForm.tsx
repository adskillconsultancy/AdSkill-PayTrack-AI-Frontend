"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants";
import { loginSchema, type LoginFormValues } from "@/validations/auth.schema";
import { useLoginMutation } from "@/services/api/auth/authApi";
import { useAuthStore } from "@/stores/auth.store";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginUser, { isLoading }] = useLoginMutation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleQuickFill = (email: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", "Password123!", { shouldValidate: true });
    setErrorMessage(null);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMessage(null);
    try {
      const response = await loginUser({
        email: data.email.trim(),
        password: data.password,
      }).unwrap();

      const { user, accessToken } = response.data;

      // Update Zustand client auth store
      setAuth(user, accessToken);

      // Set cookie for Next.js edge route protection
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

      // Redirect to main dashboard
      router.push(ROUTES.DASHBOARD);
    } catch (err: any) {
      console.error("Login failed:", err);
      const serverMessage =
        err?.data?.message ||
        (err?.status === "FETCH_ERROR"
          ? "Unable to connect to backend server. Please verify the API is running."
          : "Invalid email or password. Please try again.");
      setErrorMessage(serverMessage);
    }
  };

  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(9,34,68,0.06)]">
      {/* Header text */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#092244]">Sign In</h2>
        <p className="text-xs text-[#64748B] mt-1">
          Access your payment tracker, milestone invoices, and receipts
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#092244]">
            Email Address
          </label>
          <div className="relative">
            <Input
              type="email"
              {...register("email")}
              placeholder="you@example.com"
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
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="••••••••••••"
              className={`pl-10 pr-10 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712] ${
                errors.password ? "border-rose-500" : "border-[#EAE6DF]"
              }`}
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1.5 top-1 h-8 w-8 text-[#94A3B8] hover:text-[#092244] hover:bg-transparent"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-[11px] font-medium text-rose-500 mt-1">
              {errors.password.message}
            </p>
          )}
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
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 gap-2 rounded-xl bg-[#092244] text-sm font-bold text-white shadow-sm hover:bg-[#0d2e5a] active:scale-[0.98] disabled:opacity-50 transition-all"
        >
          <ShieldCheck className="h-4 w-4 text-[#F3A712]" />
          <span>{isLoading ? "Signing In..." : "Sign In to Account"}</span>
          <ArrowRight className="h-3.5 w-3.5 opacity-70 ml-1" />
        </Button>
      </form>

      {/* Quick Test Credentials */}
      <div className="mt-6 pt-5 border-t border-[#EAE6DF] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
            <KeyRound className="h-3 w-3 text-[#F3A712]" />
            <span>Quick Test Credentials:</span>
          </div>
          <span className="text-[10px] text-[#94A3B8] font-mono">Password123!</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickFill("client@example.com")}
            className="h-8 px-2 rounded-lg bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-semibold transition-colors text-xs justify-center"
          >
            Client
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickFill("consultant@adskillconsultancy.com")}
            className="h-8 px-2 rounded-lg bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-semibold transition-colors text-xs justify-center"
          >
            Consultant
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickFill("manager@adskillconsultancy.com")}
            className="h-8 px-2 rounded-lg bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-semibold transition-colors text-xs justify-center"
          >
            Manager
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickFill("admin@adskillconsultancy.com")}
            className="h-8 px-2 rounded-lg bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-semibold transition-colors text-xs justify-center"
          >
            Super Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
