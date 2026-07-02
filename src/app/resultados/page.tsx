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
import { PersonalNarrative } from "@/components/results/PersonalNarrative";
import { WealthLevelCard } from "@/components/results/WealthLevelCard";
import { PeerDistributionChart } from "@/components/results/PeerDistributionChart";
import { AchievementGrid } from "@/components/results/AchievementGrid";
import { ShareButtons } from "@/components/results/ShareButtons";
import { formatUSD } from "@/lib/utils";
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
    try {
      const parsed = JSON.parse(raw);
      // Guardas contra profiles viejos sin narrative/level (recalculo requerido)
      if (!parsed.wealth_level || !parsed.narrative) {
        router.push("/quiz");
        return;
      }
      setP(parsed);
    } catch {
      router.push("/quiz");
    }
  }, [router]);

  if (!p) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-white/60">Cargando tus resultados…</p>
      </main>
    );
  }

  const level = p.wealth_level;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* HERO Narrativo */}
      <section className="mb-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-mint">Tu Índice de Riqueza Futura</p>
        <div className="flex justify-center">
          <ScoreRing value={p.overall_score} size={240} />
        </div>
        <h1 className="mt-6 text-2xl font-black leading-tight text-white sm:text-4xl">
          {p.narrative.hero_headline}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
          {p.narrative.hero_subheadline}
        </p>
        <div className="mt-4 flex justify-center">
          <ShareButtons share={p.share} />
        </div>
      </section>

      {/* Narrativa personalizada + Nivel */}
      <section className="mb-10 grid gap-4 lg:grid-cols-2">
        <PersonalNarrative narrative={p.narrative} level={level} />
        <WealthLevelCard level={level} score={p.overall_score} />
      </section>

      {/* Gamificación: distribución + logros */}
      <section className="mb-10 grid gap-4 lg:grid-cols-2">
        <PeerDistributionChart dist={p.peer_distribution} userScore={p.overall_score} />
        <AchievementGrid achievements={p.achievements} />
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
            Diferencia entre optimizar y no hacer nada:{" "}
            <strong className="text-mint">{formatUSD(p.trajectory.difference_best_worst)}</strong>
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
            <span className="text-sm font-semibold text-coral">
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
        <p className="mb-4 text-sm text-white/60">Ordenados por Retorno sobre Acción (ROA) a 20 años.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {p.boosters.map((b) => (
            <BoosterCard key={b.id} booster={b} />
          ))}
        </div>
      </section>

      {/* CTA final + share */}
      <section className="mb-6">
        <GlassCard className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Comparte tu diagnóstico</h2>
          <p className="mb-4 text-sm text-white/70">
            Tu Yo del futuro te agradecerá que empieces la conversación hoy.
          </p>
          <div className="mb-6 flex justify-center">
            <ShareButtons share={p.share} />
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/compartir">
              <Button size="lg">Ver tarjeta compartible</Button>
            </Link>
            <Link href="/asesor">
              <Button size="lg" variant="secondary">
                Hablar con un asesor
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      <p className="mt-8 text-center text-xs text-white/40">
        Confianza del análisis: {p.confidence.toUpperCase()} · Generado{" "}
        {new Date(p.generated_at).toLocaleDateString("es-MX")}
      </p>
    </main>
  );
}
