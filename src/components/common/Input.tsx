import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={error ? "true" : undefined}
        className={cn(
          "flex h-10 w-full rounded-xl border border-input bg-transparent px-3.5 py-2 text-sm text-foreground shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A712] focus-visible:border-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-rose-500 focus-visible:ring-rose-500/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
