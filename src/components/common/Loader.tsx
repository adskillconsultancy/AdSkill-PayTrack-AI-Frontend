import { cn } from "@/lib/utils";
import { Plane, Globe, Loader2 } from "lucide-react";

export interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "plane" | "spinner";
  text?: string;
  subtext?: string;
}

export function Loader({
  className,
  size = "md",
  variant = "plane",
  text,
  subtext,
}: LoaderProps) {
  // Classic simple spinner variant
  if (variant === "spinner") {
    const spinnerSizes = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    return (
      <div className={cn("flex items-center justify-center gap-2.5", className)}>
        <Loader2 className={cn("animate-spin text-[#F3A712]", spinnerSizes[size])} />
        {text && (
          <span className="text-xs font-semibold text-[#092244]">{text}</span>
        )}
      </div>
    );
  }

  // Visa & Aviation Themed Flight Loader
  if (size === "sm") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <div className="relative flex items-center justify-center">
          <Plane className="h-4 w-4 text-[#F3A712] fill-[#F3A712] animate-plane-fly drop-shadow-xs" />
        </div>
        {text && (
          <span className="text-xs font-semibold text-[#092244]">{text}</span>
        )}
      </div>
    );
  }

  if (size === "md") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 p-4", className)}>
        {/* Radar & Plane Hub */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#092244] shadow-md border border-[#F3A712]/30">
          <div className="absolute inset-0 rounded-2xl bg-[#F3A712]/15 animate-ping" />
          <Plane className="h-6 w-6 text-[#F3A712] fill-[#F3A712] animate-plane-fly drop-shadow-sm" />
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          {text && (
            <div className="text-sm font-bold text-[#092244]">{text}</div>
          )}
          {subtext && (
            <div className="text-xs text-[#64748B]">{subtext}</div>
          )}
        </div>

        {/* Pulsing Dots */}
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F3A712] animate-bounce [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#F3A712] animate-bounce [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#F3A712] animate-bounce" />
        </div>
      </div>
    );
  }

  // Large Full-Page Visa Platform Loader
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 p-6 text-center select-none", className)}>
      {/* Flight Radar & Global Flight Path */}
      <div className="relative flex h-36 w-36 items-center justify-center">
        {/* Outer Orbit Dashed Path */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#CBD5E1] animate-orbit">
          {/* Plane Flying on Track */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <div className="relative flex items-center justify-center p-1 rounded-full bg-white shadow-md border border-[#EAE6DF]">
              <Plane className="h-5 w-5 text-[#F3A712] fill-[#F3A712] rotate-45" />
            </div>
          </div>
        </div>

        {/* Second Radar Pulse */}
        <div className="absolute inset-3 rounded-full border border-[#F3A712]/30 animate-ping opacity-60" />

        {/* Central Dark Navy Globe Pod */}
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#092244] shadow-[0_10px_25px_-5px_rgba(9,34,68,0.35)] border-2 border-[#F3A712]/40">
          <Globe className="h-9 w-9 text-[#F3A712] animate-pulse" />
        </div>
      </div>

      {/* Brand & Loading Status */}
      <div className="space-y-1.5 max-w-sm">
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#B47B00]">
          AdSkill Visa &amp; Milestone Network
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-[#092244]">
          {text || "Connecting to Visa Portal..."}
        </h3>
        <p className="text-xs text-[#64748B] leading-relaxed">
          {subtext || "Synchronizing case milestones, payment schedules, and verified records."}
        </p>
      </div>

      {/* Golden Pulsing Indicator */}
      <div className="flex items-center gap-2 pt-1">
        <span className="h-2 w-2 rounded-full bg-[#F3A712] animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-[#F3A712] animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-[#F3A712] animate-bounce" />
      </div>
    </div>
  );
}
