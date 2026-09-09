import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { LoginForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Account Sign In",
  description: "Sign in to your AdSkill PayTrack AI account to manage case milestone payments and receipts.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-[#092244] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Logo Header */}
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

        {/* Feature Component */}
        <LoginForm />

        {/* Footer Link */}
        <div className="text-center text-xs text-[#64748B]">
          Don't have an account yet?{" "}
          <Link
            href={ROUTES.REGISTER}
            className="font-bold text-[#092244] hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
