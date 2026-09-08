"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/validations/auth.schema";
import { ROUTES } from "@/constants";
import { Button, Input } from "@/components/common";
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
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [portalType, setPortalType] = useState<"client" | "staff">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleQuickFill = (roleEmail: string) => {
    setValue("email", roleEmail, { shouldValidate: true });
    setValue("password", "Password123!", { shouldValidate: true });
  };

  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    // Simulated authentication with token cookie for proxy edge middleware
    document.cookie = "accessToken=demo_token; path=/; max-age=86400";
    setTimeout(() => {
      setIsLoading(false);
      router.push(ROUTES.DASHBOARD);
    }, 400);
  };

  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(9,34,68,0.06)]">
      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 rounded-xl bg-[#FAF8F5] p-1 border border-[#EAE6DF] mb-6 gap-1">
        <Button
          type="button"
          variant={portalType === "client" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPortalType("client")}
          className={`flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all h-9 ${
            portalType === "client"
              ? "bg-[#092244] text-white shadow-xs hover:bg-[#092244]"
              : "text-[#64748B] hover:text-[#092244] hover:bg-transparent"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Client Portal</span>
        </Button>

        <Button
          type="button"
          variant={portalType === "staff" ? "default" : "ghost"}
          size="sm"
          onClick={() => setPortalType("staff")}
          className={`flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all h-9 ${
            portalType === "staff"
              ? "bg-[#092244] text-white shadow-xs hover:bg-[#092244]"
              : "text-[#64748B] hover:text-[#092244] hover:bg-transparent"
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span>Staff / Manager</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email / ID Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#092244]">
            {portalType === "client" ? "Client Email or ID" : "Staff Email Address"}
          </label>
          <div className="relative">
            <Input
              type="text"
              {...register("email")}
              placeholder={
                portalType === "client"
                  ? "client@example.com or #ASK-1042"
                  : "staff@adskillconsultancy.com"
              }
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
              placeholder="••••••••"
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
          className="w-full h-11 gap-2 rounded-xl bg-[#092244] text-sm font-bold text-white shadow-sm hover:bg-[#0d2e5a] active:scale-[0.98] disabled:opacity-50"
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
        </Button>
      </form>

      {/* Demo Quick-Fill Buttons */}
      <div className="mt-6 pt-5 border-t border-[#EAE6DF] space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          <KeyRound className="h-3 w-3 text-[#F3A712]" />
          <span>Quick Test Credentials:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPortalType("client");
              handleQuickFill("client@example.com");
            }}
            className="h-7 px-2.5 rounded-md bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-medium transition-colors text-xs"
          >
            Client Demo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPortalType("staff");
              handleQuickFill("finance@adskillconsultancy.com");
            }}
            className="h-7 px-2.5 rounded-md bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-medium transition-colors text-xs"
          >
            Finance Manager
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPortalType("staff");
              handleQuickFill("admin@adskillconsultancy.com");
            }}
            className="h-7 px-2.5 rounded-md bg-[#FAF8F5] border-[#EAE6DF] text-[#092244] hover:bg-[#F3A712]/10 hover:border-[#F3A712] font-medium transition-colors text-xs"
          >
            Super Admin
          </Button>
        </div>
      </div>
    </div>
  );
}
