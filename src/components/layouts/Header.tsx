"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants";
import { Button } from "@/components/common";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: ROUTES.HOME },
    { label: "Services", href: ROUTES.ADVISORY },
    { label: "About", href: ROUTES.ABOUT },
    { label: "Pricing", href: ROUTES.PRICING },
    { label: "Contact", href: ROUTES.CONTACT },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EAE6DF] bg-[#FAF8F5]/90 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Official Brand Logo */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-3 transition-transform hover:opacity-95"
          aria-label="AdSkill PayTrack AI"
        >
          <div className="relative h-11 w-48 sm:w-56">
            <Image
              src="/logo.svg"
              alt="PayTrack AI by AdSkill"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#475569]">
          {navLinks.map((link) => {
            const isActive =
              link.href === ROUTES.HOME
                ? pathname === ROUTES.HOME
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors hover:text-[#092244] ${
                  isActive
                    ? "font-semibold text-[#092244]"
                    : "text-[#475569]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#F3A712]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.LOGIN}>
              Sign In
            </Link>
          </Button>

          <Button asChild size="sm" className="gap-2">
            <Link href={ROUTES.LOGIN}>
              <ShieldCheck className="h-4 w-4 text-[#F3A712]" />
              <span>Client Portal</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70 ml-0.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#092244] hover:bg-[#EFECE6] h-10 w-10"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EAE6DF] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-medium text-[#092244] rounded-lg hover:bg-[#EFECE6]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#EAE6DF] flex flex-col gap-2.5">
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href={ROUTES.LOGIN} onClick={() => setMobileMenuOpen(false)}>
                Client Portal
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
