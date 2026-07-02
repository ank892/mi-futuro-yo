"use client";
import { useEffect, useState } from "react";
import type { WealthProfile } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatUSD } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Plan() {
  const [p, setP] = useState<WealthProfile | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("mfy_profile");
    if (raw) setP(JSON.parse(raw));
  }, []);

  if (!p) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-white/60">Necesitas completar el análisis primero.</p>
          <Link href="/quiz"><Button>Comenzar</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-black">Tu Plan de Optimización Patrimonial</h1>
      <p className="mb-8 text-white/60">
        3 acciones priorizadas por impacto sobre tu Score y patrimonio a 20 años.
      </p>

      {p.boosters.map((b, i) => (
        <GlassCard key={b.id} className="mb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-mint text-2xl font-black text-indigo-900">
              {i + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{b.product.name}</h3>
              <p className="mt-1 text-sm text-white/60">{b.rationale}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="ROA 20yr" value={`${b.roa_multiplier.toFixed(1)}x`} />
                <Stat label="Cierra fuga" value={formatUSD(b.leak_impact_covered_usd)} />
                <Stat label="Costo/mes" value={b.monthly_cost_range} />
                <Stat label="Pilar" value={b.pillar_boosted} />
              </div>
              {b.product.features?.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-white/80">
                  {b.product.features.map((f, i) => (
                    <li key={i}>✓ {f}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </GlassCard>
      ))}

      <Link href="/asesor">
        <Button fullWidth size="lg" className="mt-4">Contactar un asesor para activar mi plan →</Button>
      </Link>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-2 text-center">
      <div className="text-[10px] uppercase text-white/50">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
