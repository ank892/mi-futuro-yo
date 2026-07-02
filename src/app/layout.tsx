import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Futuro Yo — Analiza tu trayectoria patrimonial en 90 segundos",
  description:
    "Descubre tu Score de Riqueza, detecta tus fugas de capital y recibe potenciadores personalizados para optimizar tu patrimonio a 20 años.",
  openGraph: {
    title: "Mi Futuro Yo",
    description: "Tu diagnóstico patrimonial en 90 segundos",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-hero-radial text-white antialiased">
        {children}
      </body>
    </html>
  );
}
