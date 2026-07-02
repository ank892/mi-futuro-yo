# Mi Futuro Yo — Wealth Optimizer

Prototype webapp: 12-question quiz → Wealth Score (0-100) → Leak Detection → **Insurance Booster Recommendations with ROA** → 20-year Trajectory.

Público objetivo: profesionales LATAM (México, Colombia, Costa Rica), 25-40 años.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase** (Postgres, RLS, migraciones SQL)
- **Vercel** (deployment)
- **Recharts** (charting)

## Ejecutar local

```bash
cd mi-futuro-yo
npm install
npm run dev
```

Abre http://localhost:3000. **Funciona sin Supabase** — usa datos locales de fallback en `src/lib/data/reference.ts` (mismos datos que las migraciones seed).

## Configuración de Supabase

Project ref: `etnggjcfigvyxhvhstxh`

1. Crea `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://etnggjcfigvyxhvhstxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<obtén de Supabase dashboard → Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<obtén de Supabase dashboard → Settings → API>
```

2. Aplica migraciones vía el SQL Editor de Supabase (copia y pega el contenido):
   - `supabase/migrations/0001_init.sql` — 12 tablas + RLS
   - `supabase/migrations/0002_seed.sql` — datos reales (BMI, PALIG, VUMI, Redbridge)

O vía Supabase CLI:
```bash
supabase link --project-ref etnggjcfigvyxhvhstxh
supabase db push
```

## Deploy a Vercel

```bash
vercel link
vercel --prod
```

Añade las 3 env vars en el dashboard de Vercel (Settings → Environment Variables).

## Estructura clave

| Archivo | Función |
|---|---|
| `src/lib/engine/scoring.ts` | Engine completo: score, leaks, boosters, trajectory, benchmark |
| `src/lib/quiz-questions.ts` | Definición de las 12 preguntas |
| `src/lib/data/reference.ts` | Datos macro + catálogo de seguros (fallback local) |
| `src/app/api/score` | POST → calcula perfil, persiste en Supabase si hay env vars |
| `src/app/api/leads` | POST → captura lead encriptado |
| `src/components/results/*` | ScoreRing, TrajectoryChart, BoosterCard, LeakCard, SubScoreCard |

## Monetización: Potenciadores (Boosters)

El sistema mapea cada **fuga detectada** a un producto de seguro específico y calcula ROA:

```
ROA = impacto_20yr_fuga / (prima_anual × 20)
```

Los top-3 boosters se muestran ordenados por ROA. CTA → `/asesor` (lead capture).

Productos verificados:
- **BMI** (Meridian II, Serie 3000, Term Life Rider)
- **PALIG** (Acceso Mundial, Plan Oro/Diamante Pediátrico, Income Protection)
- **VUMI** (Optimum VIP)
- **Redbridge** (RedChoice Care I)

Precios extraídos de PDFs oficiales (ver `insurance_pricing` en migración seed).

## Reglas críticas de narrativa

**NUNCA** usar en textos AI-generated: *seguro*, *póliza*, *cobertura*, *protección*.
**Usar**: score, trayectoria, fuga, blindaje, optimización patrimonial, potenciador.

## Verificación funcional

Test de API con persona "MX 26-30, ingreso $1500, 1 dependiente, deuda presionada":
- Score: 24.1 / "Riesgo Crítico"
- Fugas detectadas: 7
- Boosters recomendados: 3 (BMI Vida Temporal ROA 42.9x, VUMI Optimum VIP 6.1x, RedChoice 4.1x)
- Trayectoria optimizada 20 años: $85,088 USD
