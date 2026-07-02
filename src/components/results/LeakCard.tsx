"use client";
import { GlassCard } from "@/components/ui/GlassCard";
import type { WealthLeak } from "@/lib/types";
import { formatUSD } from "@/lib/utils";

const SEV_COLOR: Record<string, string> = {
  baja: "text-mint border-mint/40",
  media: "text-yellow-400 border-yellow-400/40",
  alta: "text-coral border-coral/40",
};

export function LeakCard({ leak }: { leak: WealthLeak }) {
  return (
    <GlassCard className="border-l-4 border-coral/70">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-lg font-bold text-white">{leak.name}</h4>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${SEV_COLOR[leak.severity] ?? ""}`}>
          {leak.severity}
        </span>
      </div>
      <p className="mb-3 text-sm text-white/70">{leak.description}</p>
      <div className="flex items-baseline justify-between rounded-xl bg-coral/10 p-3">
        <span className="text-xs text-white/70">Impacto estimado a 20 años</span>
        <span className="text-xl font-black text-coral">−{formatUSD(leak.estimated_20yr_impact_usd)}</span>
      </div>
    </GlassCard>
  );
}
