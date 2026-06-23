import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "verified" | "suspicious" | "rejected";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase",
        {
          "bg-gold/20 text-gold": variant === "default",
          "bg-teal/20 text-teal": variant === "verified",
          "bg-amber-500/20 text-amber-300": variant === "suspicious",
          "bg-red-500/20 text-red-300": variant === "rejected",
        },
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
