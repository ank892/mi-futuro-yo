"use client";
import { GlassCard } from "@/components/ui/GlassCard";
import type { SubScore } from "@/lib/types";

const PILLAR_META = {
  ingreso: { label: "Ingreso", icon: "💰", desc: "Robustez de ingresos" },
  ahorro: { label: "Ahorro", icon: "🏦", desc: "Capacidad de ahorro" },
  crecimiento: { label: "Crecimiento", icon: "📈", desc: "Multiplicación de capital" },
  blindaje: { label: "Blindaje", icon: "🛡️", desc: "Blindaje patrimonial" },
};

export function SubScoreCard({ pillar, detail }: { pillar: keyof typeof PILLAR_META; detail: SubScore }) {
  const meta = PILLAR_META[pillar];
  const color = detail.value >= 70 ? "text-mint" : detail.value >= 50 ? "text-info" : "text-coral";
  const barColor = detail.value >= 70 ? "bg-mint" : detail.value >= 50 ? "bg-info" : "bg-coral";
  return (
    <GlassCard>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <div className="text-sm font-semibold text-white">{meta.label}</div>
          <div className="text-xs text-white/50">{meta.desc}</div>
        </div>
      </div>
      <div className="mb-1 flex items-end justify-between">
        <div className={`text-3xl font-black ${color}`}>{Math.round(detail.value)}</div>
        <div className="text-xs text-white/50">peso {Math.round(detail.weight * 100)}%</div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, detail.value)}%` }} />
      </div>
      <p className="mt-3 text-xs font-semibold text-white/80">{detail.label}</p>
      {detail.details && detail.details.length > 0 && (
        <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-white/60">
          {detail.details.slice(0, 3).map((d, i) => (
            <li key={i}>• {d}</li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
