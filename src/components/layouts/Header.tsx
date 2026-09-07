"use client";

import Link from "next/link";
import { ROUTES } from "@/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href={ROUTES.HOME} className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-lg">PayTrack AI</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href={ROUTES.ABOUT} className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
          <Link href={ROUTES.SERVICES} className="transition-colors hover:text-foreground/80 text-foreground/60">Services</Link>
          <Link href={ROUTES.PRICING} className="transition-colors hover:text-foreground/80 text-foreground/60">Pricing</Link>
          <Link href={ROUTES.CONTACT} className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Sign In
          </Link>
          <Link
            href={ROUTES.REGISTER}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
