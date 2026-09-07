import Link from "next/link";
import { ROUTES } from "@/constants";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <span className="font-bold">PayTrack AI</span>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} AdSkill. All rights reserved.
          </p>
        </div>
        <nav className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link href={ROUTES.PRIVACY_POLICY} className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href={ROUTES.TERMS} className="hover:text-foreground transition-colors">Terms</Link>
          <Link href={ROUTES.CONTACT} className="hover:text-foreground transition-colors">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
