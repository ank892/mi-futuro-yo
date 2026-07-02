"use client";
import { useEffect, useRef, useState } from "react";
import type { WealthProfile } from "@/lib/types";
import { ShareCard } from "@/components/results/ShareCard";
import { ShareButtons } from "@/components/results/ShareButtons";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function Compartir() {
  const [p, setP] = useState<WealthProfile | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("mfy_profile");
    if (raw) {
      try {
        setP(JSON.parse(raw));
      } catch {
        /* noop */
      }
    }
  }, []);

  const downloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#05081A",
      });
      const link = document.createElement("a");
      link.download = `mi-futuro-yo-${p?.overall_score ?? "score"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("PNG export failed", e);
      alert("No se pudo generar la imagen. Toma una captura manual.");
    } finally {
      setDownloading(false);
    }
  };

  if (!p) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
        <div className="w-full text-center">
          <p className="mb-4 text-white/60">Necesitas completar el análisis primero.</p>
          <Link href="/quiz">
            <Button>Comenzar</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-black">Comparte tu Futuro Yo</h1>
        <p className="mt-1 text-sm text-white/60">
          Descarga la tarjeta o envíala directo a tus redes.
        </p>
      </div>

      {/* Card visual */}
      <div className="mb-6 flex justify-center">
        <ShareCard ref={cardRef} profile={p} />
      </div>

      {/* Botón descarga */}
      <div className="mb-4 flex justify-center">
        <Button size="lg" onClick={downloadPng} disabled={downloading}>
          {downloading ? "Generando…" : "📥 Descargar imagen"}
        </Button>
      </div>

      {/* Botones sociales */}
      <div className="mb-6 flex justify-center">
        <ShareButtons share={p.share} />
      </div>

      <div className="text-center">
        <Link href="/resultados">
          <Button variant="secondary">Volver a resultados</Button>
        </Link>
      </div>
    </main>
  );
}
