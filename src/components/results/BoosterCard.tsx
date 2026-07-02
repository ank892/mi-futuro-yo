"use client";
import { GlassCard } from "@/components/ui/GlassCard";
import type { WealthBooster } from "@/lib/types";
import { formatUSD } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function BoosterCard({ booster }: { booster: WealthBooster }) {
  const isInsurance = booster.product.max_coverage_usd !== 0;
  return (
    <GlassCard className="animate-fade-in-up">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-mint/20 px-2 py-0.5 text-xs font-bold text-mint">
              #{booster.rank} · {isInsurance ? "BLINDAJE" : "OPTIMIZACIÓN"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">{booster.product.name}</h3>
          {isInsurance && (
            <p className="mt-0.5 text-xs text-white/50">Aliado: {booster.product.provider_code}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-white/50">ROA (20 años)</div>
          <div className="text-2xl font-black text-mint">
            {booster.roa_multiplier >= 100 ? "100x+" : `${booster.roa_multiplier.toFixed(1)}x`}
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-white/70">{booster.rationale}</p>

      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-white/5 p-4">
        <div>
          <div className="text-xs text-white/50">Cierra fuga de</div>
          <div className="text-lg font-bold text-white">{formatUSD(booster.leak_impact_covered_usd)}</div>
        </div>
        <div>
          <div className="text-xs text-white/50">Costo</div>
          <div className="text-lg font-bold text-white">
            {booster.monthly_cost_usd > 0 ? booster.monthly_cost_range : "Sin costo"}
          </div>
        </div>
      </div>

      {booster.product.features && booster.product.features.length > 0 && (
        <ul className="mb-4 space-y-1.5 text-sm text-white/80">
          {booster.product.features.slice(0, 4).map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-mint">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      <Link href="/asesor">
        <Button fullWidth variant={booster.rank === 1 ? "primary" : "secondary"}>
          {isInsurance ? "Hablar con un asesor" : "Activar esta optimización"}
        </Button>
      </Link>
    </GlassCard>
  );
}
