"use client";
import type { WealthLevel } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";

export function WealthLevelCard({ level, score }: { level: WealthLevel; score: number }) {
  const pct = Math.max(2, Math.min(100, ((score - level.min) / Math.max(1, level.max - level.min)) * 100));
  return (
    <GlassCard>
      <div className="flex items-start gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-4xl"
          style={{ background: `${level.color}22`, boxShadow: `0 0 30px ${level.color}44` }}
        >
          {level.emoji}
        </div>
        <div className="flex-1">
          <div className="text-xs uppercase tracking-widest text-white/50">Nivel</div>
          <h3 className="text-xl font-black" style={{ color: level.color }}>
            {level.name}
          </h3>
          <p className="text-sm text-white/70">{level.tagline}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-white/80">{level.description}</p>

      {level.next_level_name && level.next_level_delta ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-white/60">
            <span>Progreso al siguiente nivel</span>
            <span className="font-semibold text-white">
              +{level.next_level_delta} pts → {level.next_level_name}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: level.color }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs font-semibold text-mint">✨ Nivel máximo alcanzado</p>
      )}
    </GlassCard>
  );
}
