"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-mint text-indigo-900 hover:bg-mint-600 hover:shadow-glow font-semibold",
  secondary:
    "glass text-white hover:bg-white/10 border border-white/20",
  ghost: "text-white/80 hover:text-white hover:bg-white/5",
  danger: "bg-coral text-white hover:bg-coral-600 font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", fullWidth, ...props },
  ref
) {
  const sz = size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base";
  return (
    <button
      ref={ref}
      className={cn(
        "rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none",
        styles[variant],
        sz,
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
});
