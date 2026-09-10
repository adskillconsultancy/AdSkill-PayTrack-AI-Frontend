"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  ChevronDown,
  Plane,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ROUTES } from "@/constants";
import { registerSchema, type RegisterFormValues } from "@/validations/auth.schema";
import { useRegisterMutation } from "@/services/api/auth/authApi";
import { useAuthStore } from "@/stores/auth.store";

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Bangladesh",
  "India",
  "Pakistan",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Singapore",
  "Malaysia",
  "Germany",
  "France",
  "Netherlands",
  "Ireland",
  "Sweden",
  "Switzerland",
  "Italy",
  "Spain",
  "New Zealand",
  "Japan",
  "South Korea",
  "China",
  "Brazil",
  "Mexico",
  "Egypt",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Turkey",
  "Other",
];

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [registerUser, { isLoading }] = useRegisterMutation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      country: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMessage(null);
    try {
      const response = await registerUser({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone?.trim() || undefined,
        country: data.country?.trim() || undefined,
      }).unwrap();

      const { user, accessToken } = response.data;

      // Update Zustand client auth store
      setAuth(user, accessToken);

      // Set cookie for Next.js edge route protection
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

      setIsSuccess(true);
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 1200);
    } catch (err: any) {
      console.error("Registration failed:", err);
      const serverMessage =
        err?.data?.message ||
        (err?.status === "FETCH_ERROR"
          ? "Unable to connect to backend server. Please verify the API is running."
          : "Registration failed. Please check your information and try again.");
      setErrorMessage(serverMessage);
    }
  };

  return (
    <div className="rounded-2xl border border-[#EAE6DF] bg-white p-7 sm:p-8 shadow-[0_8px_30px_-4px_rgba(9,34,68,0.06)]">
      {isSuccess ? (
        <div className="py-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F3A712]/15 text-[#F3A712]">
            <CheckCircle2 className="h-8 w-8 text-[#092244]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#092244]">
              Account Created Successfully!
            </h3>
            <p className="text-xs text-[#64748B]">
              Your client profile is ready. Redirecting to your dashboard...
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#092244] hover:underline"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-[#092244]">
              Create Client Account
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Sign up to track your payment schedule, milestone invoices, and receipts
            </p>
          </div>

          {/* Error alert */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Full Legal Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#092244]">
              Full Legal Name *
            </label>
            <div className="relative">
              <Input
                type="text"
                {...register("name")}
                placeholder="e.g. Mohammad Rahim"
                className={`pl-10 pr-3.5 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] placeholder:text-[#94A3B8] focus-visible:border-[#F3A712] focus-visible:ring-[#F3A712] ${
                  errors.name ? "border-rose-500" : "border-[#EAE6DF]"
                }`}
              />
              <User className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8]" />
            </div>
            {errors.name && (
              <p className="text-[11px] font-medium text-rose-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#092244]">
              Email Address *
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

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#092244]">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="At least 6 characters"
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

          {/* Phone & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#092244]">
                Mobile / WhatsApp
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
                Country of Residence
              </label>
              <div className="relative">
                <select
                  {...register("country")}
                  defaultValue=""
                  className={`w-full appearance-none pl-10 pr-9 h-10 rounded-xl bg-[#FAF8F5] text-sm text-[#092244] border transition-all cursor-pointer focus:bg-white focus:outline-none focus:border-[#F3A712] focus:ring-1 focus:ring-[#F3A712] ${
                    errors.country ? "border-rose-500" : "border-[#EAE6DF]"
                  }`}
                >
                  <option value="" disabled>
                    Select country...
                  </option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Globe className="absolute left-3.5 top-3 h-4 w-4 text-[#94A3B8] pointer-events-none" />
                <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-[#94A3B8] pointer-events-none" />
              </div>
              {errors.country && (
                <p className="text-[11px] font-medium text-rose-500 mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>



          {/* Privacy Note */}
          <div className="rounded-xl bg-[#FAF8F5] p-3 text-[11px] text-[#64748B] flex items-center gap-2 border border-[#EAE6DF]">
            <ShieldCheck className="h-4 w-4 text-[#F3A712] shrink-0" />
            <span>
              Your personal data is encrypted and securely stored according to strict confidentiality standards.
            </span>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Plane className="h-4 w-4 text-[#F3A712] fill-[#F3A712] animate-plane-fly drop-shadow-xs" />
                <span>Preparing Visa Account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 text-[#F3A712]" />
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70 ml-1" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
