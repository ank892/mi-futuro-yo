"use client";
import { useEffect, useState } from "react";
import type { WealthProfile } from "@/lib/types";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatUSD } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Compartir() {
  const [p, setP] = useState<WealthProfile | null>(null);
  useEffect(() => {
    const raw = sessionStorage.getItem("mfy_profile");
    if (raw) setP(JSON.parse(raw));
  }, []);

  if (!p) return null;

  return (
    <main className="mx-auto max-w-md px-6 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Comparte tu diagnóstico</h1>
        <p className="text-sm text-white/60">Toma una captura de la tarjeta y compártela</p>
      </div>

      <div className="mx-auto aspect-[9/16] max-w-xs overflow-hidden rounded-3xl bg-hero-radial p-6 shadow-glow">
        <div className="mb-4 text-xs uppercase tracking-widest text-mint">Mi Futuro Yo</div>
        <div className="flex justify-center">
          <ScoreRing value={p.overall_score} size={180} />
        </div>
        <div className="mt-4 text-center">
          <div className="text-lg font-bold">{p.score_label}</div>
          <div className="text-xs text-white/60">Percentil {p.peer_benchmark.percentile} vs. peers</div>
        </div>
        <div className="mt-6 rounded-2xl bg-white/10 p-3 text-center">
          <div className="text-[10px] uppercase text-white/60">Potencial optimizado 20 años</div>
          <div className="text-xl font-black text-mint">{formatUSD(p.trajectory.final_optimized)}</div>
        </div>
        <div className="mt-4 text-center text-[10px] text-white/60">mifuturoyo.app</div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/resultados"><Button variant="secondary">Volver</Button></Link>
      </div>
    </main>
  );
}
