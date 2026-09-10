import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A712] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#092244] text-white shadow-sm hover:bg-[#071933] hover:shadow-md active:bg-[#051326]",
        outline:
          "border border-[#EAE6DF] bg-white text-[#092244] shadow-xs hover:bg-[#FAF8F5] hover:border-[#CBD5E1] hover:text-[#092244]",
        secondary:
          "bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] shadow-xs hover:bg-[#F3EFE6] hover:border-[#CBD5E1]",
        subtle:
          "bg-[#FAF8F5] border border-[#EAE6DF] text-[#092244] hover:bg-[#F1ECE4] hover:border-[#092244]/25 hover:text-[#092244] font-medium shadow-none",
        ghost:
          "text-[#092244] hover:bg-[#092244]/5 hover:text-[#092244]",
        link:
          "text-[#B47B00] underline-offset-4 hover:underline hover:text-[#8E6100]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-12 px-6 text-base font-bold rounded-xl",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(
          buttonVariants({ variant, size, className }),
          (children.props as any)?.className
        ),
        ref,
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
