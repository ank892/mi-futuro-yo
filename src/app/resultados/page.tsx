"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { WealthProfile } from "@/lib/types";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SubScoreCard } from "@/components/results/SubScoreCard";
import { TrajectoryChart } from "@/components/results/TrajectoryChart";
import { LeakCard } from "@/components/results/LeakCard";
import { BoosterCard } from "@/components/results/BoosterCard";
import { formatUSD, formatFullUSD } from "@/lib/utils";
import Link from "next/link";

export default function Resultados() {
  const router = useRouter();
  const [p, setP] = useState<WealthProfile | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("mfy_profile");
    if (!raw) {
      router.push("/quiz");
      return;
    }
    setP(JSON.parse(raw));
  }, [router]);

  if (!p) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-white/60">Cargando tus resultados…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Header con Score Ring */}
      <section className="mb-10 text-center">
        <p className="mb-4 text-xs uppercase tracking-widest text-mint">Tu Índice de Riqueza Futura</p>
        <div className="flex justify-center">
          <ScoreRing value={p.overall_score} size={260} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">{p.score_label}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
          Estás en el percentil {p.peer_benchmark.percentile} vs. {p.peer_benchmark.cohort_description}.
          {p.peer_benchmark.user_vs_median === "above" && " Por encima de la mediana."}
          {p.peer_benchmark.user_vs_median === "below" && " Por debajo de la mediana."}
        </p>
      </section>

      {/* 4 sub-scores */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Tus 4 pilares</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SubScoreCard pillar="ingreso" detail={p.sub_scores.ingreso} />
          <SubScoreCard pillar="ahorro" detail={p.sub_scores.ahorro} />
          <SubScoreCard pillar="crecimiento" detail={p.sub_scores.crecimiento} />
          <SubScoreCard pillar="blindaje" detail={p.sub_scores.blindaje} />
        </div>
      </section>

      {/* Trayectoria */}
      <section className="mb-10">
        <GlassCard>
          <h2 className="mb-1 text-xl font-bold">Tu trayectoria a 20 años</h2>
          <p className="mb-4 text-sm text-white/60">
            Diferencia entre optimizar y no hacer nada: <strong className="text-mint">{formatUSD(p.trajectory.difference_best_worst)}</strong>
          </p>
          <TrajectoryChart traj={p.trajectory} />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-mint/10 p-3">
              <div className="text-xs text-white/60">Optimizado</div>
              <div className="text-lg font-bold text-mint">{formatUSD(p.trajectory.final_optimized)}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="text-xs text-white/60">Actual</div>
              <div className="text-lg font-bold text-white">{formatUSD(p.trajectory.final_current)}</div>
            </div>
            <div className="rounded-xl bg-coral/10 p-3">
              <div className="text-xs text-white/60">Adverso</div>
              <div className="text-lg font-bold text-coral">{formatUSD(p.trajectory.final_adverse)}</div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Fugas */}
      {p.detected_leaks.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Fugas detectadas</h2>
            <span className="text-sm text-coral font-semibold">
              Total: −{formatUSD(p.total_leak_impact_20yr)} a 20 años
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {p.detected_leaks.map((l) => (
              <LeakCard key={l.id} leak={l} />
            ))}
          </div>
        </section>
      )}

      {/* Potenciadores */}
      <section className="mb-10">
        <h2 className="mb-1 text-xl font-bold">Tus Potenciadores recomendados</h2>
        <p className="mb-4 text-sm text-white/60">
          Ordenados por Retorno sobre Acción (ROA) a 20 años.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {p.boosters.map((b) => (
            <BoosterCard key={b.id} booster={b} />
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mb-6">
        <GlassCard className="text-center">
          <h2 className="mb-2 text-2xl font-bold">¿Quieres activar tu plan?</h2>
          <p className="mb-6 text-sm text-white/70">
            Un asesor especializado te contactará por WhatsApp en menos de 24 hrs para orquestar tus potenciadores.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/asesor">
              <Button size="lg">Hablar con un asesor</Button>
            </Link>
            <Link href="/plan">
              <Button size="lg" variant="secondary">Ver plan detallado</Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      <p className="mt-8 text-center text-xs text-white/40">
        Confianza del análisis: {p.confidence.toUpperCase()} · Generado {new Date(p.generated_at).toLocaleDateString("es-MX")}
      </p>
    </main>
  );
}
