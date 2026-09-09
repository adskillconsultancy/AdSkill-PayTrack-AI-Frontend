import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { RegisterForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Create Client Account",
  description: "Register your client account for AdSkill PayTrack AI payment schedule and invoice management.",
};

export default function RegisterPage() {
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
            Client Portal Registration
          </p>
        </div>

        {/* Feature Component */}
        <RegisterForm />

        {/* Footer Link */}
        <div className="text-center text-xs text-[#64748B]">
          Already have an account?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="font-bold text-[#092244] hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
