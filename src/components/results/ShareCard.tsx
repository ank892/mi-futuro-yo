"use client";
import { forwardRef } from "react";
import type { WealthProfile } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";

function fmt(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
}

/**
 * Tarjeta shareable 9:16 (formato Instagram Story / Reels).
 * Diseño autocontenido para poder ser exportado a PNG.
 */
export const ShareCard = forwardRef<HTMLDivElement, { profile: WealthProfile }>(
  function ShareCard({ profile: p }, ref) {
    const level = p.wealth_level;
    return (
      <div
        ref={ref}
        className="relative mx-auto aspect-[9/16] w-[360px] overflow-hidden rounded-[28px] text-white"
        style={{
          background: `radial-gradient(120% 60% at 50% 0%, ${level.color}55 0%, transparent 55%), linear-gradient(180deg, #0F1B3D 0%, #05081A 100%)`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="text-xs uppercase tracking-[0.25em] text-mint">Mi Futuro Yo</div>
          <div className="text-[10px] text-white/50">mifuturoyo.app</div>
        </div>

        {/* Level chip */}
        <div className="mt-6 flex justify-center">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ring-1"
            style={{ background: `${level.color}22`, color: level.color, boxShadow: `0 0 20px ${level.color}55` }}
          >
            <span className="text-xl">{level.emoji}</span> {level.name}
          </div>
        </div>

        {/* Score ring */}
        <div className="mt-6 flex justify-center">
          <ScoreRing value={p.overall_score} size={200} />
        </div>

        {/* Percentil */}
        <div className="mt-4 text-center">
          <div className="text-[11px] uppercase tracking-widest text-white/60">Vs. peers</div>
          <div className="text-2xl font-black text-white">
            {p.peer_benchmark.percentile >= 60
              ? `Top ${Math.max(1, 100 - p.peer_benchmark.percentile)}%`
              : `Percentil ${p.peer_benchmark.percentile}`}
          </div>
          <div className="mt-1 text-[10px] text-white/50">
            Superas al {p.peer_distribution.ahead_of_pct}% en tu cohorte
          </div>
        </div>

        {/* Future wealth pill */}
        <div className="mx-6 mt-4 rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/15">
          <div className="text-[10px] uppercase tracking-widest text-white/60">Tu Yo del 2045 podría tener</div>
          <div className="text-2xl font-black text-mint">{fmt(p.trajectory.final_optimized)} USD</div>
        </div>

        {/* Achievements */}
        {p.achievements.filter((a) => a.unlocked).length > 0 && (
          <div className="mt-4 flex justify-center gap-2 px-6">
            {p.achievements
              .filter((a) => a.unlocked)
              .slice(0, 5)
              .map((a) => (
                <div key={a.id} className="text-xl" title={a.name}>
                  {a.emoji}
                </div>
              ))}
          </div>
        )}

        {/* Footer tagline */}
        <div className="absolute inset-x-0 bottom-6 text-center">
          <div className="text-[11px] italic text-white/70 px-8">"{level.tagline}"</div>
          <div className="mt-2 text-[10px] text-white/50">¿Cuánto vale tu futuro?</div>
        </div>
      </div>
    );
  }
);
