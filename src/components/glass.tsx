import * as React from "react";
import { cn } from "@/lib/utils";

export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("glass rounded-2xl text-foreground", className)}
      {...props}
    />
  ),
);
GlassCard.displayName = "GlassCard";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

export const GlassButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
    const variants = {
      default: "glass hover:bg-glass/80 text-foreground",
      primary:
        "text-primary-foreground border border-white/20 [background:var(--gradient-aurora)] shadow-[var(--shadow-glow)] hover:brightness-110",
      ghost: "text-foreground/80 hover:text-foreground hover:bg-glass",
    };
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base",
      icon: "h-10 w-10",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
GlassButton.displayName = "GlassButton";
