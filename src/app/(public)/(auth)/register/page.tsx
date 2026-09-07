import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Create an account",
};

export default function RegisterPage() {
  return (
    <div className="container flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
          <div className="space-y-2 text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Get started with AdSkill PayTrack AI.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Create an account form will be implemented here.
            </p>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
