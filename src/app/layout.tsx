import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Futuro Yo | ¿Cuánto vale tu futuro?",
  description:
    "12 preguntas, 3 minutos. Descubre tu Índice de Riqueza Futura, tus fugas de dinero y cómo se ve tu patrimonio en 20 años.",
  openGraph: {
    title: "Mi Futuro Yo | ¿Cuánto vale tu futuro?",
    description:
      "12 preguntas, 3 minutos. Descubre tu Índice de Riqueza Futura, tus fugas de dinero y cómo se ve tu patrimonio en 20 años.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Futuro Yo | ¿Cuánto vale tu futuro?",
    description: "Descubre tu Índice de Riqueza Futura en 3 minutos.",
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
