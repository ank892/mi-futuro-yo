"use client";
import type { Achievement } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";

const RARITY_STYLES: Record<Achievement["rarity"], { ring: string; label: string; textColor: string }> = {
  comun: { ring: "ring-white/20", label: "Común", textColor: "text-white/60" },
  raro: { ring: "ring-blue-400/60", label: "Raro", textColor: "text-blue-300" },
  epico: { ring: "ring-purple-400/60", label: "Épico", textColor: "text-purple-300" },
  legendario: { ring: "ring-yellow-400/70", label: "Legendario", textColor: "text-yellow-300" },
};

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);
  return (
    <GlassCard>
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-bold">Logros desbloqueados</h3>
        <span className="text-sm text-white/60">
          {unlocked.length}/{achievements.length}
        </span>
      </div>

      {unlocked.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {unlocked.map((a) => {
            const s = RARITY_STYLES[a.rarity];
            return (
              <div
                key={a.id}
                className={`group relative rounded-2xl bg-white/5 p-3 text-center ring-2 ${s.ring} transition hover:scale-105 hover:bg-white/10`}
                title={a.description}
              >
                <div className="text-3xl leading-none">{a.emoji}</div>
                <div className="mt-1 text-[11px] font-semibold text-white">{a.name}</div>
                <div className={`mt-0.5 text-[9px] uppercase tracking-wide ${s.textColor}`}>{s.label}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-white/60">Aún no desbloqueaste logros. Cierra fugas para conseguirlos.</p>
      )}

      {locked.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-white/50 hover:text-white/80">
            Ver logros pendientes ({locked.length})
          </summary>
          <div className="mt-3 grid grid-cols-3 gap-2 opacity-50 sm:grid-cols-4">
            {locked.map((a) => (
              <div key={a.id} className="rounded-xl bg-white/5 p-2 text-center" title={a.description}>
                <div className="text-2xl grayscale">{a.emoji}</div>
                <div className="mt-1 text-[10px] text-white/60">{a.name}</div>
              </div>
            ))}
          </div>
        </details>
      )}
    </GlassCard>
  );
}
