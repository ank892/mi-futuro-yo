"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  "Consultando a tu Yo del 2045…",
  "Buscando las fugas que nadie te había mostrado…",
  "Comparándote con miles de profesionales LATAM…",
  "Calculando cuánto vale realmente tu futuro…",
  "Tu Futuro Yo está escribiendo su veredicto…",
];

export default function Calculando() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.push("/resultados"), 3200);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-8 h-24 w-24">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/10 border-t-mint" />
          <div className="absolute inset-3 rounded-full bg-mint/10 shadow-glow" />
        </div>
        <h2 className="mb-6 text-2xl font-bold">Construyendo tu Mi Futuro Yo</h2>
        <ul className="space-y-3 text-left">
          {STEPS.map((s, i) => (
            <li
              key={i}
              className="animate-fade-in-up rounded-xl bg-white/5 px-4 py-3 text-sm text-white/80"
              style={{ animationDelay: `${i * 500}ms`, opacity: 0 }}
            >
              <span className="mr-2 text-mint">◉</span>{s}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
