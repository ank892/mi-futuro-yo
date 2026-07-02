import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
      <section className="text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
          <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
          Diagnóstico patrimonial con IA · Modelos financieros LATAM
        </div>
        <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Descubre tu <span className="text-gradient-mint">Índice de Riqueza Futura</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-white/70 sm:text-xl">
          12 preguntas. 90 segundos. Un plano claro de tus fugas de capital y los potenciadores
          que multiplican tu patrimonio a 20 años.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/quiz">
            <Button size="lg">Comenzar mi análisis →</Button>
          </Link>
          <span className="text-xs text-white/50">Gratis · Sin registro · 100% anónimo</span>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          { n: "01", t: "Responde 12 preguntas", d: "Sobre ingresos, ahorro, deuda y proyecciones. Sin nombre, sin email." },
          { n: "02", t: "Obtén tu Score 0–100", d: "Ingreso, Ahorro, Crecimiento y Blindaje. Con tu percentil vs. peers." },
          { n: "03", t: "Activa tus Potenciadores", d: "Hasta 3 acciones específicas con ROA calculado a 20 años." },
        ].map((s) => (
          <GlassCard key={s.n}>
            <div className="mb-3 text-4xl font-black text-mint">{s.n}</div>
            <h3 className="mb-2 text-lg font-bold">{s.t}</h3>
            <p className="text-sm text-white/60">{s.d}</p>
          </GlassCard>
        ))}
      </section>

      <section className="mt-20 text-center">
        <p className="mb-4 text-sm uppercase tracking-widest text-white/50">
          Basado en fuentes verificables
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-white/70">
          <span>· INEGI</span><span>· DANE</span><span>· BCCR</span>
          <span>· MSCI ACWI</span><span>· Modelo actuarial LATAM</span>
        </div>
      </section>

      <footer className="mt-20 text-center text-xs text-white/40">
        © 2026 Mi Futuro Yo · Análisis educativo, no constituye asesoría de inversión.
      </footer>
    </main>
  );
}
