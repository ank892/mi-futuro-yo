"use client";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function GlassCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-6 shadow-glass",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
