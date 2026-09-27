import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { ForgotPasswordForm } from "@/features/auth/components";

export const metadata: Metadata = {
  title: "Forgot Password | AdSkill PayTrack AI",
  description: "Recover your AdSkill PayTrack AI account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#FAF8F5] text-[#0a0a0a] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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
            Account Security &amp; Access Recovery
          </p>
        </div>

        {/* Feature Component */}
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
