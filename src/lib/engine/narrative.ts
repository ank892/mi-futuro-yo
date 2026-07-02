/**
 * Mi Futuro Yo — Narrative Engine
 * Toma el WealthProfile base y genera: WealthLevel, Achievements[], PeerDistribution,
 * WealthNarrative (story), ShareContent. Se llama al final de calculateWealthScore.
 */
import type {
  SurveyResponses, WealthLeak, WealthBooster, WealthLevel, Achievement,
  PeerDistribution, WealthNarrative, ShareContent, WealthTrajectory, PeerBenchmark,
} from "../types";
import {
  WEALTH_LEVELS, NARRATIVE_TEMPLATES, ACHIEVEMENT_DEFS, SHARE_COPY, COHORT_SIZE_HINTS,
} from "../data/narrative-content";

function formatUSDShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M USD`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K USD`;
  return `$${Math.round(n)} USD`;
}

// -----------------------
// WEALTH LEVEL
// -----------------------
export function computeWealthLevel(score: number): WealthLevel {
  const level = WEALTH_LEVELS.find((l) => score >= l.min && score <= l.max) ?? WEALTH_LEVELS[0];
  const idx = WEALTH_LEVELS.indexOf(level);
  const next = idx < WEALTH_LEVELS.length - 1 ? WEALTH_LEVELS[idx + 1] : undefined;
  return {
    key: level.key,
    min: level.min,
    max: level.max,
    name: level.name,
    emoji: level.emoji,
    tagline: level.tagline,
    description: level.description,
    color: level.color,
    next_level_delta: next ? Math.max(1, next.min - Math.floor(score)) : undefined,
    next_level_name: next?.name,
  };
}

// -----------------------
// ACHIEVEMENTS
// -----------------------
export function computeAchievements(
  r: SurveyResponses,
  leaks: WealthLeak[],
  peer: PeerBenchmark,
  sub_ingreso: number,
  sub_blindaje: number,
): Achievement[] {
  const emergency_months_num =
    r.emergency_months === "0-1" ? 0.5 :
    r.emergency_months === "2-3" ? 2.5 :
    r.emergency_months === "4-6" ? 5 : 7;

  const conditions: Record<string, boolean> = {
    savings_ninja: r.savings_rate_pct >= 20,
    debt_free: r.debt_relationship === "no_debt",
    emergency_fortress: emergency_months_num >= 6,
    health_shielded: r.has_health_insurance === true,
    income_prodigy: false, // se setea abajo si tenemos percentil de ingreso
    master_plan: r.financial_plan_clarity >= 8,
    crypto_pioneer: r.savings_vehicles.includes("cripto"),
    north_star: !!r.financial_goal && r.financial_goal.trim().length > 5,
    // full_armor: alto blindaje Y sin fugas de protección abiertas
    full_armor:
      sub_blindaje >= 85 &&
      !leaks.some((l) => l.pillar_affected === "blindaje"),
    steady_investor: r.has_recurring_investment && r.recurring_investment_pct >= 5,
    zero_leaks: leaks.length === 0,
    top_percentile: peer.percentile >= 90,
  };

  // income_prodigy — usa sub-score de ingreso como proxy
  if (sub_ingreso >= 80) conditions.income_prodigy = true;

  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    emoji: def.emoji,
    description: def.description,
    rarity: def.rarity,
    unlocked: !!conditions[def.id],
  }));
}

// -----------------------
// PEER DISTRIBUTION (curva normal aproximada, 7 buckets)
// -----------------------
export function computePeerDistribution(
  user_score: number,
  cohort_median: number,
  country: string,
): PeerDistribution {
  // 7 buckets contiguos (usamos [lo, hi) para todos menos el último, que incluye 100)
  const ranges: [number, number][] = [
    [0, 20], [20, 35], [35, 50], [50, 65], [65, 78], [78, 89], [89, 100.01],
  ];
  const displayLabels = ["0–20", "20–35", "35–50", "50–65", "65–78", "78–89", "89–100"];
  // Densidades base tipo curva normal centrada en la mediana
  const base_densities = ranges.map(([lo, hi]) => {
    const mid = (lo + hi) / 2;
    const z = (mid - cohort_median) / 15;
    return Math.exp(-0.5 * z * z);
  });
  const sum = base_densities.reduce((a, b) => a + b, 0);
  const pcts = base_densities.map((d) => Math.round((d / sum) * 100));
  // Ajuste para que sumen 100
  const diff = 100 - pcts.reduce((a, b) => a + b, 0);
  pcts[3] += diff;

  // Buscar bucket: [lo, hi) excepto el último que incluye 100
  const user_idx = ranges.findIndex(([lo, hi], i) =>
    i === ranges.length - 1 ? user_score >= lo && user_score <= 100 : user_score >= lo && user_score < hi
  );
  const safe_idx = user_idx >= 0 ? user_idx : 0;

  const buckets = ranges.map(([lo, hi], i) => ({
    label: displayLabels[i],
    min: lo,
    max: Math.min(100, hi),
    peer_pct: Math.max(1, pcts[i]),
    is_user: i === safe_idx,
  }));

  let ahead = 0;
  for (let i = 0; i < safe_idx; i++) ahead += buckets[i].peer_pct;
  const [lo, hi] = ranges[safe_idx];
  const within = Math.max(0, Math.min(1, (user_score - lo) / Math.max(1, hi - lo)));
  ahead += buckets[safe_idx].peer_pct * within;

  return {
    buckets,
    user_bucket_index: safe_idx,
    ahead_of_pct: Math.max(1, Math.min(99, Math.round(ahead))),
    cohort_size_hint: COHORT_SIZE_HINTS[country] ?? "profesionales LATAM en tu cohorte",
  };
}

// -----------------------
// NARRATIVE (personalized story paragraph)
// -----------------------
export function computeNarrative(
  r: SurveyResponses,
  score: number,
  level: WealthLevel,
  leaks: WealthLeak[],
  boosters: WealthBooster[],
  trajectory: WealthTrajectory,
  country_name: string,
  peer_percentile: number,
): WealthNarrative {
  const top_leak = leaks[0];
  const top_booster = boosters[0];
  const name = "Tú"; // opcional Q12 podría capturar nombre; por ahora "Tú"

  const template =
    score <= 30 ? NARRATIVE_TEMPLATES.critico :
    score <= 55 ? NARRATIVE_TEMPLATES.vulnerable :
    score <= 75 ? NARRATIVE_TEMPLATES.buen_camino :
    NARRATIVE_TEMPLATES.optimizado;

  const goal_text = r.financial_goal?.trim() || "tus metas";

  const story_paragraph = template
    .replace("{name}", name)
    .replace("{age_range}", r.age_range)
    .replace("{country_name}", country_name)
    .replace("{income}", `$${r.monthly_income_usd.toLocaleString()}`)
    .replace(/{savings_rate}/g, `${r.savings_rate_pct}%`)
    .replace(/{top_leak_name}/g, top_leak?.name ?? "una fuga por resolver")
    .replace(/{top_leak_impact}/g, formatUSDShort(top_leak?.estimated_20yr_impact_usd ?? 0))
    .replace(/{top_booster_name}/g, top_booster?.product.name ?? "un potenciador clave")
    .replace(/{future_wealth}/g, formatUSDShort(trajectory.final_optimized))
    .replace(/{leak_count}/g, String(leaks.length))
    .replace(/{financial_goal}/g, goal_text);

  const future_year = new Date().getFullYear() + 20;
  const future_self_message =
    score <= 55
      ? `Tu Yo del ${future_year} te está pidiendo un movimiento hoy — no perfección, solo el primer paso.`
      : score <= 75
      ? `Tu Yo del ${future_year} te agradece haber empezado. Ahora te pide que blindes lo construido.`
      : `Tu Yo del ${future_year} ya te felicitó. Ahora te reta a convertirte en referente para tu círculo.`;

  const urgency_hook =
    leaks.length > 0
      ? `Cada mes sin actuar te cuesta ~${formatUSDShort(
          leaks.reduce((a, l) => a + l.monthly_impact_usd, 0) * 12
        )} al año.`
      : "Sin fugas activas: ahora se trata de acelerar el crecimiento.";

  const celebration_hook = score >= 76 && peer_percentile >= 80
    ? `Estás en el top ${Math.max(1, 100 - peer_percentile)}% de LATAM.`
    : undefined;

  return {
    hero_headline:
      score <= 30 ? "Tu Futuro Yo está preocupado, pero hay salida" :
      score <= 55 ? "Vas por buen camino, con fugas que atender" :
      score <= 75 ? "Estás construyendo. Falta blindar." :
      "Estás en la élite. Aquí está tu último paso.",
    hero_subheadline: `${level.emoji} Nivel ${level.name} · ${level.tagline}`,
    story_paragraph,
    future_self_message,
    urgency_hook,
    celebration_hook,
  };
}

// -----------------------
// SHARE CONTENT (deep links + copy)
// -----------------------
export function computeShareContent(
  score: number,
  level: WealthLevel,
  peer: PeerBenchmark,
): ShareContent {
  const fill = (t: string) =>
    t
      .replace(/{score}/g, String(Math.round(score)))
      .replace(/{level_name}/g, level.name)
      .replace(/{percentile}/g, String(peer.percentile));

  return {
    headline: `${score}/100 · ${level.emoji} ${level.name}`,
    whatsapp_text: fill(SHARE_COPY.whatsapp),
    twitter_text: fill(SHARE_COPY.twitter),
    linkedin_text: fill(SHARE_COPY.linkedin),
    instagram_overlay: fill(SHARE_COPY.instagram_story),
    og_title: SHARE_COPY.og_title,
    og_description: SHARE_COPY.og_description,
    share_url: "https://mifuturoyo.app",
  };
}
