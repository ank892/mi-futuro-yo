"use client";
import type { PeerDistribution } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";

export function PeerDistributionChart({ dist, userScore }: { dist: PeerDistribution; userScore: number }) {
  const max = Math.max(...dist.buckets.map((b) => b.peer_pct));
  return (
    <GlassCard>
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-lg font-bold">Cómo te comparas</h3>
        <span className="text-sm font-black text-mint">
          Superas al {dist.ahead_of_pct}%
        </span>
      </div>
      <p className="mb-4 text-xs text-white/60">{dist.cohort_size_hint}</p>

      <div className="flex h-32 items-end gap-1">
        {dist.buckets.map((b, i) => {
          const h = (b.peer_pct / max) * 100;
          const isUser = b.is_user;
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end">
              {isUser && (
                <div className="mb-1 rounded-full bg-mint px-2 py-0.5 text-[10px] font-bold text-navy">
                  Tú · {Math.round(userScore)}
                </div>
              )}
              <div
                className={`w-full rounded-t-md transition-all ${isUser ? "bg-mint" : "bg-white/20"}`}
                style={{ height: `${Math.max(6, h)}%` }}
                title={`${b.peer_pct}% en rango ${b.label}`}
              />
              <div className={`mt-1 text-[10px] ${isUser ? "font-bold text-mint" : "text-white/50"}`}>
                {b.label}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-white/60">
        Distribución estimada de scores en tu cohorte
      </p>
    </GlassCard>
  );
}
