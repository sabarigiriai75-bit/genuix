import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-gold text-midnight hover:bg-gold-light",
  gold: "bg-gold text-midnight hover:bg-gold-light",
  outline: "border border-gold/40 bg-transparent text-gold hover:bg-gold/10",
  ghost: "hover:bg-white/5 text-ivory",
} as const;

const sizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:pointer-events-none disabled:opacity-50";

function buttonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", href, ...props }, ref) => {
    if (href) {
      return (
        <Link href={href} className={buttonClassName(variant, size, className)}>
          {props.children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={buttonClassName(variant, size, className)} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button };
