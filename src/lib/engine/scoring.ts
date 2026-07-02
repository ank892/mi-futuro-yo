/**
 * Mi Futuro Yo — Scoring Engine (TypeScript port + boosters)
 *
 * Pipeline:
 *  Survey → sub-scores × 4 → weighted score → leaks → boosters → trajectory → benchmark
 */
import type {
  SurveyResponses, SubScore, WealthProfile, WealthLeak,
  WealthTrajectory, TrajectoryPoint, PeerBenchmark, WealthBooster,
  Country, Pillar, ScoreLabel, Confidence,
} from "../types";
import { MACRO_DATA, SCORING_CONFIG, GLOBAL_BENCHMARKS, HEALTH_COVERAGE_BY_COUNTRY, INSURANCE_CATALOG } from "../data/reference";
import {
  computeWealthLevel, computeAchievements, computePeerDistribution,
  computeNarrative, computeShareContent,
} from "./narrative";

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const round1 = (v: number) => Math.round(v * 10) / 10;
const round0 = (v: number) => Math.round(v);

// =====================================================
// SCORING ENGINE
// =====================================================

export function calculateWealthScore(r: SurveyResponses): WealthProfile {
  const country = MACRO_DATA[r.country];

  const s_ingreso = calcIngreso(r, country);
  const s_ahorro = calcAhorro(r);
  const s_crecimiento = calcCrecimiento(r);
  const s_blindaje = calcBlindaje(r, country);

  const weights = adjustedWeights(r);
  s_ingreso.weight = weights.ingreso;
  s_ahorro.weight = weights.ahorro;
  s_crecimiento.weight = weights.crecimiento;
  s_blindaje.weight = weights.blindaje;

  const raw =
    s_ingreso.value * weights.ingreso +
    s_ahorro.value * weights.ahorro +
    s_crecimiento.value * weights.crecimiento +
    s_blindaje.value * weights.blindaje;
  const overall_score = round1(clamp(raw));

  const leaks = detectLeaks(r, country);
  const total_leak_impact_20yr = leaks.reduce((a, l) => a + l.estimated_20yr_impact_usd, 0);

  const boosters = recommendBoosters(r, leaks);

  const trajectory = calcTrajectory(r, country);
  const peer_benchmark = calcPeerPercentile(r, overall_score, country);
  const confidence = assessConfidence(r);
  const score_label = labelScore(overall_score);

  const wealth_level = computeWealthLevel(overall_score);
  const peer_distribution = computePeerDistribution(overall_score, peer_benchmark.cohort_median_score, r.country);
  const achievements = computeAchievements(r, leaks, peer_benchmark, s_ingreso.value, s_blindaje.value);
  const narrative = computeNarrative(r, overall_score, wealth_level, leaks, boosters, trajectory, country.name, peer_benchmark.percentile);
  const share = computeShareContent(overall_score, wealth_level, peer_benchmark);

  return {
    overall_score,
    score_label,
    confidence,
    sub_scores: { ingreso: s_ingreso, ahorro: s_ahorro, crecimiento: s_crecimiento, blindaje: s_blindaje },
    detected_leaks: leaks,
    total_leak_impact_20yr: round0(total_leak_impact_20yr),
    boosters,
    trajectory,
    peer_benchmark,
    peer_distribution,
    wealth_level,
    achievements,
    narrative,
    share,
    survey_responses: r,
    country_context: {
      name: country.name,
      inflation: country.inflation_rate,
      health_oop: country.health_oop_percent,
      pension_system: country.pension_system,
    },
    generated_at: new Date().toISOString(),
  };
}

// ---------- Sub-scores ----------

function calcIngreso(r: SurveyResponses, country: typeof MACRO_DATA["MX"]): SubScore {
  const dist = country.income_percentiles[r.age_range];
  const income = r.monthly_income_usd;
  let pct: number;
  if (income >= dist.p90) pct = 95;
  else if (income >= dist.p75) pct = 75 + ((income - dist.p75) / (dist.p90 - dist.p75)) * 20;
  else if (income >= dist.p50) pct = 50 + ((income - dist.p50) / (dist.p75 - dist.p50)) * 25;
  else if (income >= dist.p25) pct = 25 + ((income - dist.p25) / (dist.p50 - dist.p25)) * 25;
  else pct = (income / dist.p25) * 25;

  let stability = 50;
  if (r.debt_relationship === "no_debt") stability += 30;
  else if (r.debt_relationship === "controlled") stability += 20;
  else if (r.debt_relationship === "pressured") stability -= 10;
  else stability -= 30;
  stability += (r.financial_plan_clarity - 5) * 3;
  stability = clamp(stability);

  const value = round1(clamp(pct * 0.6 + stability * 0.4));
  return {
    name: "Ingreso",
    value,
    weight: 0.25,
    label: subLabel(value),
    details: [
      `Percentil de ingreso estimado: ${Math.round(pct)}`,
      `Estabilidad financiera: ${Math.round(stability)}/100`,
    ],
  };
}

function calcAhorro(r: SurveyResponses): SubScore {
  const cfg = SCORING_CONFIG.ahorro;
  const rate_score = Math.min(100, (r.savings_rate_pct / cfg.savings_rate_target) * 100);

  let vehicle_score = 0;
  if (r.savings_vehicles.length) {
    const qualities = r.savings_vehicles.map(v => cfg.vehicle_quality[v] ?? 0.3);
    const best = Math.max(...qualities);
    const avg = qualities.reduce((a, b) => a + b, 0) / qualities.length;
    vehicle_score = (best * 0.6 + avg * 0.4) * 100;
  }

  const emergency_ratio = { "0-1": 0.083, "2-3": 0.417, "4-6": 0.833, "6+": 1 }[r.emergency_months];
  const emergency_score = Math.min(100, emergency_ratio * 100);

  let value = rate_score * 0.5 + vehicle_score * 0.3 + emergency_score * 0.2;
  if (r.debt_relationship === "uncontrolled") value -= 15;
  else if (r.debt_relationship === "pressured") value -= 8;
  if (r.savings_vehicles.length === 1 && r.savings_vehicles[0] === "colchon") value -= 10;

  value = round1(clamp(value));
  return {
    name: "Ahorro",
    value,
    weight: 0.25,
    label: subLabel(value),
    details: [
      `Tasa de ahorro: ${r.savings_rate_pct}% (meta: ${cfg.savings_rate_target}%)`,
      `Calidad de vehículos: ${Math.round(vehicle_score)}/100`,
      `Fondo de emergencia: ${Math.round(emergency_score)}/100`,
    ],
  };
}

function calcCrecimiento(r: SurveyResponses): SubScore {
  const cfg = SCORING_CONFIG.crecimiento;

  let investment = 10;
  if (r.has_recurring_investment) {
    investment = Math.min(100, cfg.has_recurring_base + r.recurring_investment_pct * cfg.investment_rate_bonus_per_pct);
  }

  const n = r.savings_vehicles.length;
  let diversification = 20;
  if (n >= 4) diversification = 80 + (cfg.diversification["4"] ?? 20);
  else if (n === 3) diversification = 60 + (cfg.diversification["3"] ?? 15);
  else if (n === 2) diversification = 40 + (cfg.diversification["2"] ?? 10);
  if (r.savings_vehicles.includes("inversion")) diversification += 15;
  diversification = Math.min(100, diversification);

  const pension =
    r.knows_pension === true ? 100 :
    r.knows_pension === null ? 60 : 20;

  const plan = (r.financial_plan_clarity / 10) * 100;

  const value = round1(clamp(
    investment * 0.35 + diversification * 0.25 + pension * 0.2 + plan * 0.2
  ));
  return {
    name: "Crecimiento",
    value,
    weight: 0.25,
    label: subLabel(value),
    details: [
      `Inversión recurrente: ${Math.round(investment)}/100`,
      `Diversificación: ${Math.round(diversification)}/100`,
      `Conocimiento pensión: ${pension}/100`,
      `Claridad de plan: ${Math.round(plan)}/100`,
    ],
  };
}

function calcBlindaje(r: SurveyResponses, country: typeof MACRO_DATA["MX"]): SubScore {
  const cfg = SCORING_CONFIG.blindaje;

  let health = 100;
  if (!r.has_health_insurance) {
    const oop_factor = country.health_oop_percent / 50;
    health = Math.max(0, 30 - oop_factor * 20);
  }

  const emergency = cfg.emergency_scoring[r.emergency_months] ?? 30;

  const debt = { no_debt: 100, controlled: 75, pressured: 35, uncontrolled: 10 }[r.debt_relationship];

  const pension =
    r.knows_pension === true ? 100 :
    r.knows_pension === null ? 50 : 15;

  let value = health * 0.35 + emergency * 0.3 + debt * 0.2 + pension * 0.15;

  const dep_key = r.dependents >= 3 ? "3+" : String(r.dependents);
  const dep_mult = cfg.dependent_multiplier[dep_key] ?? 1;
  if (value < 60 && dep_mult > 1) {
    const penalty = (60 - value) * (dep_mult - 1);
    value -= penalty;
  }

  value = round1(clamp(value));
  return {
    name: "Blindaje",
    value,
    weight: 0.25,
    label: subLabel(value),
    details: [
      `Blindaje salud: ${Math.round(health)}/100`,
      `Fondo de emergencia: ${emergency}/100`,
      `Gestión de deuda: ${debt}/100`,
      `Preparación retiro: ${pension}/100`,
      `Dependientes: ${r.dependents} (ajuste ×${dep_mult})`,
    ],
  };
}

function adjustedWeights(r: SurveyResponses) {
  const base = SCORING_CONFIG.pillar_weights.age_adjustments[r.age_range] ?? SCORING_CONFIG.pillar_weights.base;
  const adj = { ...base };
  const dep_key = r.dependents >= 3 ? "3+" : String(r.dependents);
  const boost = SCORING_CONFIG.pillar_weights.dependent_boost[dep_key] ?? 0;
  if (boost > 0) {
    adj.blindaje += boost;
    const share = boost / 3;
    (["ingreso", "ahorro", "crecimiento"] as const).forEach(p => {
      adj[p] = Math.max(0.10, adj[p] - share);
    });
  }
  const sum = Object.values(adj).reduce((a, b) => a + b, 0);
  return {
    ingreso: adj.ingreso / sum,
    ahorro: adj.ahorro / sum,
    crecimiento: adj.crecimiento / sum,
    blindaje: adj.blindaje / sum,
  };
}

function assessConfidence(r: SurveyResponses): Confidence {
  let pts = 2;
  if (r.savings_rate_pct > 0) pts++;
  if (r.savings_vehicles.length > 1) pts++;
  if (r.has_recurring_investment && r.recurring_investment_pct > 0) pts++;
  if (r.financial_plan_clarity >= 7) pts++;
  if (r.knows_pension === true) pts++;
  if (pts >= 6) return "alta";
  if (pts >= 4) return "media";
  return "baja";
}

function labelScore(v: number): ScoreLabel {
  const d = SCORING_CONFIG.score_distribution;
  if (v <= d.critical[1]) return "Riesgo Crítico";
  if (v <= d.vulnerable[1]) return "Vulnerable";
  if (v <= d.good_with_leaks[1]) return "Buen camino, con fugas detectadas";
  return "Optimizado";
}

function subLabel(v: number): string {
  if (v >= 80) return "Excelente";
  if (v >= 60) return "Bueno";
  if (v >= 40) return "Necesita atención";
  return "Vulnerable";
}

// =====================================================
// LEAK DETECTOR
// =====================================================

const FV_FACTOR_20YR = ((1.0837 ** 20) - 1) / 0.0837;   // 47.96

export function detectLeaks(r: SurveyResponses, country: typeof MACRO_DATA["MX"]): WealthLeak[] {
  const leaks: WealthLeak[] = [];
  const annual = r.monthly_income_usd * 12;

  // 1. Deuda
  if (r.debt_relationship === "uncontrolled") {
    const annual_leak = annual * 0.25;
    const impact = annual_leak * FV_FACTOR_20YR;
    leaks.push({
      id: "debt_uncontrolled",
      name: "Deuda descontrolada de alto interés",
      severity: "alta",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(annual_leak / 12),
      description: `Tu deuda consume ~$${round0(annual_leak).toLocaleString()}/año que, invertidos, generarían ~$${round0(impact).toLocaleString()} en 20 años.`,
      pillar_affected: "ahorro",
    });
  } else if (r.debt_relationship === "pressured") {
    const annual_leak = annual * 0.15;
    const impact = annual_leak * FV_FACTOR_20YR;
    leaks.push({
      id: "debt_pressured",
      name: "Deuda que presiona tu flujo mensual",
      severity: "media",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(annual_leak / 12),
      description: `La deuda te quita ~$${round0(annual_leak).toLocaleString()}/año. Optimizándola liberas $${round0(annual_leak / 12).toLocaleString()}/mes para invertir.`,
      pillar_affected: "ahorro",
    });
  }

  // 2. Bajo rendimiento
  const only_low = r.savings_vehicles.length > 0 && r.savings_vehicles.every(v => v === "banco" || v === "colchon");
  if (r.savings_rate_pct > 0 && only_low && !r.has_recurring_investment) {
    const monthly = r.monthly_income_usd * (r.savings_rate_pct / 100);
    const months = 240;
    const rl = 0.04 / 12;
    const rh = 0.0837 / 12;
    const fv_l = monthly * (((1 + rl) ** months - 1) / rl);
    const fv_h = monthly * (((1 + rh) ** months - 1) / rh);
    const impact = fv_h - fv_l;
    if (impact > 5000) {
      leaks.push({
        id: "low_yield_savings",
        name: "Ahorro en instrumentos de bajo rendimiento",
        severity: impact < 50000 ? "media" : "alta",
        estimated_20yr_impact_usd: round0(impact),
        monthly_impact_usd: round0(impact / 240),
        description: `Ahorras $${round0(monthly).toLocaleString()}/mes al 4% en banco. Invertido al 8.37% (MSCI EM LatAm), la diferencia son ~$${round0(impact).toLocaleString()} en 20 años.`,
        pillar_affected: "crecimiento",
      });
    }
  }

  // 3. Sin seguro de salud
  if (!r.has_health_insurance) {
    const prob = country.catastrophic_health_probability;
    const catastrophic_cost = annual * 3;
    const expected = prob * catastrophic_cost * 20;
    const oop_extra = annual * 0.05 * 20;
    const impact = expected + oop_extra;
    const severity = country.health_oop_percent > 30 ? "alta" : "media";
    leaks.push({
      id: "no_health_insurance",
      name: "Sin blindaje médico mayor",
      severity,
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(impact / 240),
      description: `En ${country.name}, el gasto de bolsillo en salud es ${country.health_oop_percent}%. Un evento médico grave puede costar ~$${round0(catastrophic_cost).toLocaleString()}. Riesgo acumulado a 20 años: ~$${round0(impact).toLocaleString()}.`,
      pillar_affected: "blindaje",
    });
  }

  // 4. Sin seguro de vida (si hay dependientes)
  if (r.dependents > 0) {
    const impact = annual * 8;   // ~8 años de ingreso protegido (viudo/a + hijos)
    leaks.push({
      id: "no_life_insurance",
      name: `Sin blindaje de vida para ${r.dependents} dependiente${r.dependents > 1 ? "s" : ""}`,
      severity: "alta",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(impact / 240),
      description: `Si tú faltas, tus ${r.dependents} dependiente${r.dependents > 1 ? "s" : ""} enfrentaría${r.dependents > 1 ? "n" : ""} una pérdida de $${round0(impact).toLocaleString()} de ingresos futuros. Un potenciador de vida temporal cierra esa brecha por ~$12-16/mes.`,
      pillar_affected: "blindaje",
    });
  }

  // 5. Fondo de emergencia
  if (r.emergency_months === "0-1") {
    const emergency_debt = r.monthly_income_usd * 3 * 0.3;
    const opportunity = r.monthly_income_usd * 2 * 20 * 0.05;
    const impact = emergency_debt * 0.8 * 5 + opportunity;
    leaks.push({
      id: "no_emergency_fund",
      name: "Fondo de emergencia insuficiente",
      severity: "alta",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(impact / 240),
      description: `Con 0-1 meses de reserva, cualquier imprevisto te fuerza a deuda cara o liquidar inversiones. Impacto 20 años: ~$${round0(impact).toLocaleString()}.`,
      pillar_affected: "blindaje",
    });
  } else if (r.emergency_months === "2-3") {
    const impact = r.monthly_income_usd * 12 * 0.15;
    leaks.push({
      id: "low_emergency_fund",
      name: "Fondo de emergencia por debajo del objetivo",
      severity: "baja",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(impact / 240),
      description: `Tienes 2-3 meses cubiertos (meta: 6). Impacto potencial: ~$${round0(impact).toLocaleString()}.`,
      pillar_affected: "blindaje",
    });
  }

  // 6. Pensión no optimizada
  if (r.knows_pension === false) {
    const low = country.pension_avg_return_low;
    const high = country.pension_avg_return_high;
    const contrib = annual * 0.065;
    const fv_l = contrib * (((1 + low) ** 20 - 1) / low);
    const fv_h = contrib * (((1 + high) ** 20 - 1) / high);
    const impact = fv_h - fv_l;
    leaks.push({
      id: "pension_unaware",
      name: `No conoces tu ${country.pension_system}`,
      severity: "media",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(impact / 240),
      description: `La diferencia entre la peor y mejor opción de ${country.pension_system} son ~$${round0(impact).toLocaleString()} en 20 años (${(low * 100).toFixed(1)}% vs ${(high * 100).toFixed(1)}% anual).`,
      pillar_affected: "crecimiento",
    });
  }

  // 7. Sin plan financiero
  if (r.financial_plan_clarity <= 3) {
    const impact = annual * 0.05 * FV_FACTOR_20YR;
    leaks.push({
      id: "no_financial_plan",
      name: "Sin plan financiero definido a largo plazo",
      severity: "media",
      estimated_20yr_impact_usd: round0(impact),
      monthly_impact_usd: round0(impact / 240),
      description: `Decisiones sin plan cuestan ~5% del ingreso anual en gastos hormiga y timing subóptimo. A 20 años compuesto: ~$${round0(impact).toLocaleString()}.`,
      pillar_affected: "crecimiento",
    });
  }

  return leaks.sort((a, b) => b.estimated_20yr_impact_usd - a.estimated_20yr_impact_usd);
}

// =====================================================
// BOOSTERS ENGINE (recomendaciones monetizables)
// =====================================================

/**
 * Motor de Potenciadores: para cada fuga detectada, encuentra el producto ideal
 * en el catálogo y calcula ROA (Return on Action).
 *
 * ROA = impacto_20yr_evitado / (annual_cost * 20)
 *
 * Devuelve top-3 ordenados por ROA descendente.
 */
export function recommendBoosters(r: SurveyResponses, leaks: WealthLeak[]): WealthBooster[] {
  const catalog = INSURANCE_CATALOG.filter(p => p.countries.includes(r.country));
  const boosters: WealthBooster[] = [];

  // Mapa fuga → producto candidato
  const leakToProduct: Record<string, string[]> = {
    no_health_insurance: r.dependents > 1 ? ["BMI_MERIDIAN_II", "PALIG_ACCESO_MUNDIAL"] : ["BMI_SERIE_3000", "RB_REDCHOICE_CARE_I", "VUMI_OPTIMUM_VIP"],
    no_life_insurance: ["BMI_TERM_LIFE_RIDER"],
    no_emergency_fund: [],                    // no atendido por seguro (plan de ahorro)
    low_emergency_fund: [],
    debt_uncontrolled: [],                    // requiere consolidación, no seguro
    debt_pressured: [],
    low_yield_savings: [],                    // requiere asesor de inversiones
    pension_unaware: [],                      // asesor pensión (no seguro)
    no_financial_plan: [],                    // asesor
  };

  for (const leak of leaks) {
    const candidate_codes = leakToProduct[leak.id] || [];
    for (const code of candidate_codes) {
      const product = catalog.find(p => p.code === code);
      if (!product) continue;

      // Ajuste de prima por edad (base es 30-39 = 1.0)
      const ageFactor = ageMultiplier(r.age_range, product.category);
      const annual = Math.round(product.annual_premium_usd * ageFactor);
      const monthly = Math.round(product.monthly_premium_usd * ageFactor);
      const total_20yr = annual * 20;
      const roa = total_20yr > 0 ? leak.estimated_20yr_impact_usd / total_20yr : 0;

      // Producto con precios ajustados a la edad del usuario (no mutamos el catálogo global)
      const pricedProduct = { ...product, annual_premium_usd: annual, monthly_premium_usd: monthly };

      boosters.push({
        id: `${leak.id}__${code}`,
        leak_id: leak.id,
        product: pricedProduct,
        monthly_cost_usd: monthly,
        annual_cost_usd: annual,
        leak_impact_covered_usd: leak.estimated_20yr_impact_usd,
        roa_multiplier: round1(roa),
        monthly_cost_range: monthlyCostRange(monthly),
        rationale: rationaleFor(leak, pricedProduct, r),
        rank: 0,
        pillar_boosted: leak.pillar_affected,
      });
    }
  }

  // Ordenar por ROA descendente y asignar rank
  boosters.sort((a, b) => b.roa_multiplier - a.roa_multiplier);
  const top = boosters.slice(0, 3).map((b, i) => ({ ...b, rank: i + 1 }));

  // Fallbacks: si no hay 3, añadimos "boosters no-seguro" (educacionales)
  if (top.length < 3) {
    const fallbacks = generateNonInsuranceBoosters(r, leaks, top.length);
    return [...top, ...fallbacks].slice(0, 3).map((b, i) => ({ ...b, rank: i + 1 }));
  }

  return top;
}

/**
 * Factor multiplicador de la prima según la edad del asegurado.
 * Base = tramo 30-39 = 1.0.
 * Categorías con tarificación más agresiva por edad: life, income_protection.
 * Salud/catastrófico: pendiente moderada.
 */
function ageMultiplier(age_range: string, category: string): number {
  const isLife = category === "life" || category === "income_protection";
  const map: Record<string, [number, number]> = {
    // [salud/catastrófico, vida/income]
    "20-25": [0.78, 0.55],
    "26-30": [0.88, 0.75],
    "31-35": [0.96, 0.90],
    "36-40": [1.10, 1.20],
  };
  const t = map[age_range] ?? [1.0, 1.0];
  return isLife ? t[1] : t[0];
}

function monthlyCostRange(m: number): string {
  const low = Math.round(m * 0.85);
  const high = Math.round(m * 1.15);
  return `~$${low}-${high}/mes`;
}

function rationaleFor(leak: WealthLeak, product: any, r: SurveyResponses): string {
  const country = MACRO_DATA[r.country];
  if (leak.id === "no_health_insurance") {
    return `En ${country.name}, sin blindaje médico, un evento grave puede costar ~$${round0(r.monthly_income_usd * 12 * 3).toLocaleString()}. ${product.name} te da hasta $${product.max_coverage_usd?.toLocaleString() ?? "capital ilimitado"} desde ${product.monthly_premium_usd < 50 ? "menos de $50/mes" : `~$${product.monthly_premium_usd}/mes`}.`;
  }
  if (leak.id === "no_life_insurance") {
    return `Con ${r.dependents} dependiente${r.dependents > 1 ? "s" : ""}, tu vida productiva vale ~$${round0(r.monthly_income_usd * 12 * 8).toLocaleString()}. Este blindaje temporal cierra esa brecha por ~$${product.monthly_premium_usd}/mes.`;
  }
  return `${product.name}: potenciador ideal para el gap detectado.`;
}

function generateNonInsuranceBoosters(r: SurveyResponses, leaks: WealthLeak[], startRank: number): WealthBooster[] {
  const items: WealthBooster[] = [];
  const country = MACRO_DATA[r.country];

  for (const leak of leaks) {
    if (leak.id === "no_emergency_fund" || leak.id === "low_emergency_fund") {
      const target = r.monthly_income_usd * 6;
      const monthly_save = Math.round(target / 24);      // meta: fondo en 24 meses
      items.push({
        id: `${leak.id}__savings_plan`,
        leak_id: leak.id,
        product: {
          code: "SAVINGS_PLAN_6M",
          provider_code: "BMI",
          name: "Plan de Ahorro Fondo Emergencia",
          category: "health",
          max_coverage_usd: 0,
          monthly_premium_usd: monthly_save,
          annual_premium_usd: monthly_save * 12,
          description: `Ahorra $${monthly_save}/mes en un fondo líquido para llegar a 6 meses de gastos en 24 meses.`,
          features: ["Liquidez alta", "Cuenta remunerada", "Auto-débito"],
          countries: ["MX", "CO", "CR"],
        },
        monthly_cost_usd: monthly_save,
        annual_cost_usd: monthly_save * 12,
        leak_impact_covered_usd: leak.estimated_20yr_impact_usd,
        roa_multiplier: round1(leak.estimated_20yr_impact_usd / (monthly_save * 12 * 2)),
        monthly_cost_range: `~$${monthly_save}/mes`,
        rationale: `Constrúyelo en 24 meses con $${monthly_save}/mes en cuenta líquida. Meta: 6 meses de gastos.`,
        rank: 0,
        pillar_boosted: "blindaje",
      });
    }
    if (leak.id === "debt_uncontrolled" || leak.id === "debt_pressured") {
      items.push({
        id: `${leak.id}__debt_consolidation`,
        leak_id: leak.id,
        product: {
          code: "DEBT_PLAN",
          provider_code: "BMI",
          name: "Consolidación y Refinanciamiento de Deuda",
          category: "health",
          max_coverage_usd: 0,
          monthly_premium_usd: 0,
          annual_premium_usd: 0,
          description: "Plan de reordenamiento de deuda con asesor financiero certificado.",
          features: ["Análisis de deudas", "Negociación con bancos", "Plan de pago único"],
          countries: ["MX", "CO", "CR"],
        },
        monthly_cost_usd: 0,
        annual_cost_usd: 0,
        leak_impact_covered_usd: leak.estimated_20yr_impact_usd,
        roa_multiplier: 999,
        monthly_cost_range: "Sin costo mensual",
        rationale: `Reordena tu deuda con un asesor certificado y libera $${round0(r.monthly_income_usd * (leak.id === "debt_uncontrolled" ? 0.25 : 0.15) / 12 * 12).toLocaleString()}/año.`,
        rank: 0,
        pillar_boosted: "ahorro",
      });
    }
    if (leak.id === "low_yield_savings") {
      const monthly = Math.round(r.monthly_income_usd * (r.savings_rate_pct / 100));
      items.push({
        id: `${leak.id}__etf_dca`,
        leak_id: leak.id,
        product: {
          code: "ETF_DCA_PLAN",
          provider_code: "BMI",
          name: "Plan de Inversión Automática (DCA en ETFs)",
          category: "health",
          max_coverage_usd: 0,
          monthly_premium_usd: monthly,
          annual_premium_usd: monthly * 12,
          description: `Aportación automática mensual a portafolio diversificado global (VTI + BND + ETF LatAm).`,
          features: ["DCA mensual", "Diversificación global", "Retorno esperado 8.37% real"],
          countries: ["MX", "CO", "CR"],
        },
        monthly_cost_usd: monthly,
        annual_cost_usd: monthly * 12,
        leak_impact_covered_usd: leak.estimated_20yr_impact_usd,
        roa_multiplier: round1(leak.estimated_20yr_impact_usd / (monthly * 12 * 20)),
        monthly_cost_range: `~$${monthly}/mes (mismo ahorro, mejor vehículo)`,
        rationale: `Redirige tus $${monthly}/mes del banco a un portafolio diversificado. Es el mismo esfuerzo, con retorno esperado de 8.37% real.`,
        rank: 0,
        pillar_boosted: "crecimiento",
      });
    }
    if (leak.id === "pension_unaware") {
      items.push({
        id: `${leak.id}__pension_review`,
        leak_id: leak.id,
        product: {
          code: "PENSION_REVIEW",
          provider_code: "BMI",
          name: `Revisión y Cambio de ${country.pension_system}`,
          category: "health",
          max_coverage_usd: 0,
          monthly_premium_usd: 0,
          annual_premium_usd: 0,
          description: `Análisis de tu ${country.pension_system} actual y traspaso a la mejor opción disponible.`,
          features: ["Análisis histórico", "Comparativa", "Traspaso asistido"],
          countries: ["MX", "CO", "CR"],
        },
        monthly_cost_usd: 0,
        annual_cost_usd: 0,
        leak_impact_covered_usd: leak.estimated_20yr_impact_usd,
        roa_multiplier: 999,
        monthly_cost_range: "Sin costo (una vez)",
        rationale: `Una revisión de 30 minutos puede añadir ~$${round0(leak.estimated_20yr_impact_usd).toLocaleString()} a tu retiro en 20 años.`,
        rank: 0,
        pillar_boosted: "crecimiento",
      });
    }
  }
  return items;
}

// =====================================================
// TRAJECTORY
// =====================================================

export function calcTrajectory(r: SurveyResponses, country: typeof MACRO_DATA["MX"]): WealthTrajectory {
  const cfg = SCORING_CONFIG.trajectory;
  const income = r.monthly_income_usd;
  const monthly_saving = income * (r.savings_rate_pct / 100);
  const current_return = estimateCurrentReturn(r);
  const real_current = Math.max(0, current_return - country.inflation_rate);
  const real_optimized = Math.max(0, cfg.optimized_return - country.inflation_rate);

  const current_path = projectScenario(monthly_saving, real_current, cfg.real_wage_growth, cfg.years);
  const opt_saving = income * Math.min(0.5, r.savings_rate_pct / 100 + cfg.optimized_savings_increase);
  const optimized = projectScenario(opt_saving, real_optimized, cfg.real_wage_growth * 1.2, cfg.years);
  const shock_cost = income * 0.7 * cfg.adverse_medical_cost_months;
  const adverse = projectScenario(monthly_saving, real_current, cfg.real_wage_growth, cfg.years, 5, cfg.adverse_income_interruption_months, shock_cost);

  const points: TrajectoryPoint[] = [];
  const base_year = new Date().getFullYear();
  for (let i = 0; i <= cfg.years; i++) {
    points.push({
      year: base_year + i,
      current_path: round0(current_path[i]),
      optimized: round0(optimized[i]),
      adverse: round0(adverse[i]),
    });
  }
  return {
    points,
    final_current: round0(current_path[cfg.years]),
    final_optimized: round0(optimized[cfg.years]),
    final_adverse: round0(adverse[cfg.years]),
    difference_best_worst: round0(optimized[cfg.years] - adverse[cfg.years]),
  };
}

function projectScenario(
  monthly_contribution: number, annual_return: number, wage_growth: number,
  years: number, shock_year: number | null = null, shock_months: number = 0, shock_cost: number = 0
): number[] {
  const balances = [0];
  let current = monthly_contribution;
  for (let y = 1; y <= years; y++) {
    // wage_growth is ANNUAL — apply once per year (fix from POC bug)
    current *= 1 + wage_growth;
    const annual_contrib = current * 12;
    const prev = balances[balances.length - 1];
    const year_return = prev * annual_return;
    const contrib_return = annual_contrib * (annual_return / 2);
    let new_bal = prev + year_return + annual_contrib + contrib_return;
    if (shock_year && y === shock_year) {
      new_bal -= shock_cost + current * shock_months;
      new_bal = Math.max(0, new_bal);
    }
    balances.push(new_bal);
  }
  return balances;
}

function estimateCurrentReturn(r: SurveyResponses): number {
  const returns = { colchon: 0, banco: 0.04, inversion: 0.0837, cripto: 0.10 };
  if (!r.savings_vehicles.length) return 0.02;
  let total = 0, weight = 0;
  for (const v of r.savings_vehicles) {
    const ret = returns[v] ?? 0.04;
    const w = (v === "inversion" || v === "cripto") && r.has_recurring_investment ? 2 : 1;
    total += ret * w;
    weight += w;
  }
  return weight ? total / weight : 0.04;
}

// =====================================================
// PEER BENCHMARK
// =====================================================

export function calcPeerPercentile(r: SurveyResponses, user_score: number, country: typeof MACRO_DATA["MX"]): PeerBenchmark {
  const cohort_median = estimateCohortMedian(r, country);
  const std_devs: Record<string, number> = { "20-25": 18, "26-30": 16, "31-35": 15, "36-40": 14 };
  const std = std_devs[r.age_range] ?? 16;
  const z = (user_score - cohort_median) / std;
  const percentile = Math.max(1, Math.min(99, Math.round(normalCDF(z) * 100)));
  const position: PeerBenchmark["user_vs_median"] =
    user_score > cohort_median + 3 ? "above" :
    user_score < cohort_median - 3 ? "below" : "at";
  return {
    percentile,
    cohort_description: `Profesionales ${r.age_range} años en ${country.name}, $${r.monthly_income_usd.toLocaleString()}/mes`,
    cohort_median_score: round1(cohort_median),
    user_vs_median: position,
  };
}

function estimateCohortMedian(r: SurveyResponses, country: typeof MACRO_DATA["MX"]): number {
  const avg_ingreso = 50;
  const avg_savings_rate = 12;
  let avg_ahorro = (avg_savings_rate / 30 * 100) * 0.5;
  avg_ahorro += 50 * 0.3;
  avg_ahorro += (1.8 / 6 * 100) * 0.2;
  avg_ahorro = Math.min(100, avg_ahorro);

  const avg_crecimiento = 15 * 0.35 + 30 * 0.25 + 35 * 0.2 + 40 * 0.2;

  const health = HEALTH_COVERAGE_BY_COUNTRY[r.country] ?? 0.3;
  const avg_blindaje = (health * 100) * 0.35 + 30 * 0.3 + 55 * 0.2 + 30 * 0.15;

  let median = (avg_ingreso + avg_ahorro + avg_crecimiento + avg_blindaje) / 4;
  const pct_data = country.income_percentiles[r.age_range];
  if (r.monthly_income_usd > pct_data.p75) median += 5;
  else if (r.monthly_income_usd > pct_data.p50) median += 2;
  return Math.max(30, Math.min(65, median));
}

function normalCDF(z: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z >= 0 ? 1 : -1;
  const az = Math.abs(z) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * az);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-az * az);
  return 0.5 * (1.0 + sign * y);
}
