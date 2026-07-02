/**
 * Mi Futuro Yo — Datos de referencia (fallback local; espeja seed de Supabase)
 * Estos datos permiten al app funcionar standalone sin conexión a Supabase.
 */
import type { Country, InsuranceProduct } from "../types";

export const MACRO_DATA: Record<Country, {
  name: string;
  currency: string;
  currency_symbol: string;
  exchange_rate_usd: number;
  inflation_rate: number;
  ppp_factor: number;
  health_oop_percent: number;
  medical_inflation_rate: number;
  financial_inclusion_rate: number;
  pension_system: string;
  pension_avg_return_low: number;
  pension_avg_return_high: number;
  catastrophic_health_probability: number;
  disability_probability_annual: number;
  income_percentiles: Record<string, { p25: number; p50: number; p75: number; p90: number }>;
}> = {
  MX: {
    name: "México", currency: "MXN", currency_symbol: "$", exchange_rate_usd: 17.2,
    inflation_rate: 0.042, ppp_factor: 0.7467, health_oop_percent: 41.24,
    medical_inflation_rate: 0.08, financial_inclusion_rate: 0.67,
    pension_system: "AFORE", pension_avg_return_low: 0.04, pension_avg_return_high: 0.09,
    catastrophic_health_probability: 0.042, disability_probability_annual: 0.008,
    income_percentiles: {
      "20-25": { p25: 500, p50: 900, p75: 1600, p90: 2800 },
      "26-30": { p25: 650, p50: 1200, p75: 2200, p90: 3500 },
      "31-35": { p25: 800, p50: 1500, p75: 2800, p90: 4500 },
      "36-40": { p25: 900, p50: 1800, p75: 3200, p90: 5200 },
    },
  },
  CO: {
    name: "Colombia", currency: "COP", currency_symbol: "$", exchange_rate_usd: 4200,
    inflation_rate: 0.055, ppp_factor: 0.7237, health_oop_percent: 16.0,
    medical_inflation_rate: 0.065, financial_inclusion_rate: 0.73,
    pension_system: "AFP (Colpensiones/Privado)", pension_avg_return_low: 0.035, pension_avg_return_high: 0.08,
    catastrophic_health_probability: 0.025, disability_probability_annual: 0.007,
    income_percentiles: {
      "20-25": { p25: 350, p50: 700, p75: 1300, p90: 2200 },
      "26-30": { p25: 500, p50: 950, p75: 1700, p90: 2900 },
      "31-35": { p25: 600, p50: 1100, p75: 2200, p90: 3800 },
      "36-40": { p25: 700, p50: 1300, p75: 2600, p90: 4200 },
    },
  },
  CR: {
    name: "Costa Rica", currency: "CRC", currency_symbol: "₡", exchange_rate_usd: 510,
    inflation_rate: 0.025, ppp_factor: 0.8976, health_oop_percent: 24.13,
    medical_inflation_rate: 0.055, financial_inclusion_rate: 0.72,
    pension_system: "IVM-CCSS + Complementaria", pension_avg_return_low: 0.04, pension_avg_return_high: 0.075,
    catastrophic_health_probability: 0.020, disability_probability_annual: 0.006,
    income_percentiles: {
      "20-25": { p25: 550, p50: 1000, p75: 1800, p90: 3000 },
      "26-30": { p25: 700, p50: 1300, p75: 2300, p90: 3700 },
      "31-35": { p25: 850, p50: 1600, p75: 2900, p90: 4600 },
      "36-40": { p25: 950, p50: 1800, p75: 3200, p90: 5500 },
    },
  },
};

export const GLOBAL_BENCHMARKS = {
  msci_em_latam_10yr_return: 0.0837,
  msci_em_latam_volatility: 0.2611,
  latam_savings_rate_avg: 0.12,
  latam_emergency_coverage_avg_months: 1.8,
  latam_health_insurance_penetration_25_40: 0.28,
  latam_pension_awareness_rate: 0.35,
  latam_recurring_investment_rate_25_40: 0.18,
};

export const HEALTH_COVERAGE_BY_COUNTRY: Record<Country, number> = {
  MX: 0.25, CO: 0.85, CR: 0.78,
};

/**
 * CATÁLOGO DE PÓLIZAS — Fallback local (idéntico al seed SQL)
 * Precios promedio anuales para edad 30-39, individual sin dependientes.
 * En producción: leer desde `insurance_products` + `insurance_pricing` de Supabase.
 */
export const INSURANCE_CATALOG: InsuranceProduct[] = [
  {
    code: "BMI_MERIDIAN_II",
    provider_code: "BMI",
    name: "BMI Meridian II",
    category: "health",
    max_coverage_usd: 7_000_000,
    monthly_premium_usd: 104,   // ~$1250/año
    annual_premium_usd: 1250,
    description: "Plan médico integral con blindaje mundial de $7M, libre elección de médicos, maternidad y transplantes.",
    features: ["Blindaje mundial $7M", "Libre elección", "Maternidad $7.5K", "Booster vida opcional"],
    countries: ["MX","CO","CR"],
  },
  {
    code: "BMI_SERIE_3000",
    provider_code: "BMI",
    name: "BMI Serie 3000",
    category: "health",
    max_coverage_usd: null,
    monthly_premium_usd: 68,    // ~$820/año
    annual_premium_usd: 820,
    description: "Blindaje sin límite anual, deducible flexible desde $2K. Ideal como primer potenciador internacional.",
    features: ["Sin límite anual", "Deducible flexible", "Waiver por accidente"],
    countries: ["MX","CO","CR"],
  },
  {
    code: "PALIG_ACCESO_MUNDIAL",
    provider_code: "PALIG",
    name: "PALIG Acceso Mundial",
    category: "health",
    max_coverage_usd: 5_000_000,
    monthly_premium_usd: 165,   // ~$1980/año
    annual_premium_usd: 1980,
    description: "Plan premium con blindaje mundial $5M. Incluye padres e hijos políticos, segunda opinión médica.",
    features: ["Padres/in-laws", "Segunda opinión", "Multilingüe", "Maternidad $10K"],
    countries: ["MX","CO","CR"],
  },
  {
    code: "VUMI_OPTIMUM_VIP",
    provider_code: "VUMI",
    name: "VUMI Optimum VIP",
    category: "catastrophic",
    max_coverage_usd: 1_000_000,
    monthly_premium_usd: 43,    // ~$520/año
    annual_premium_usd: 520,
    description: "Plan catastrófico económico. Blinda 8 condiciones críticas (cáncer, infarto, ACV, insuficiencia renal, etc.) hasta $1M por condición.",
    features: ["8 condiciones críticas", "Cleveland Clinic segunda opinión", "Blindaje mundial", "Bajo costo"],
    countries: ["MX","CO","CR"],
  },
  {
    code: "RB_REDCHOICE_CARE_I",
    provider_code: "REDBRIDGE",
    name: "RedChoice Care I",
    category: "health",
    max_coverage_usd: 1_000_000,
    monthly_premium_usd: 65,    // ~$780/año
    annual_premium_usd: 780,
    description: "Plan internacional con blindaje mundial de $1M. Múltiples redes (Prime, Max, Ultra), soporte 24/7 multilingüe.",
    features: ["Multi-red", "24/7 multilingüe", "Booster medicamentos", "Booster accidentes"],
    countries: ["MX","CO","CR"],
  },
  {
    code: "BMI_TERM_LIFE_RIDER",
    provider_code: "BMI",
    name: "BMI Vida Temporal",
    category: "life",
    max_coverage_usd: 500_000,
    monthly_premium_usd: 14,    // ~$168/año para 30-39
    annual_premium_usd: 168,
    description: "Blindaje de vida temporal hasta $500K de capital, renovable, con múltiples beneficiarios.",
    features: ["Suma hasta $500K", "Renovable", "Múltiples beneficiarios"],
    countries: ["MX","CO","CR"],
  },
  {
    code: "PALIG_INCOME_PROTECTION",
    provider_code: "PALIG",
    name: "PALIG Protección de Ingreso",
    category: "income_protection",
    max_coverage_usd: 0,
    monthly_premium_usd: 26,    // ~$312/año
    annual_premium_usd: 312,
    description: "Blindaje de invalidez / continuidad de ingreso. Reemplaza hasta 70% del salario ante incapacidad temporal o permanente.",
    features: ["Hasta 70% salario", "Corto y largo plazo", "Independientes elegibles"],
    countries: ["MX","CO","CR"],
  },
];

/** Pesos y umbrales del scoring engine */
export const SCORING_CONFIG = {
  pillar_weights: {
    base: { ingreso: 0.25, ahorro: 0.25, crecimiento: 0.25, blindaje: 0.25 },
    age_adjustments: {
      "20-25": { ingreso: 0.20, ahorro: 0.20, crecimiento: 0.35, blindaje: 0.25 },
      "26-30": { ingreso: 0.22, ahorro: 0.23, crecimiento: 0.30, blindaje: 0.25 },
      "31-35": { ingreso: 0.25, ahorro: 0.25, crecimiento: 0.25, blindaje: 0.25 },
      "36-40": { ingreso: 0.25, ahorro: 0.25, crecimiento: 0.20, blindaje: 0.30 },
    } as Record<string, Record<string, number>>,
    dependent_boost: { "0": 0, "1": 0.05, "2": 0.08, "3+": 0.12 } as Record<string, number>,
  },
  ahorro: {
    savings_rate_target: 30,
    vehicle_quality: { inversion: 1.0, cripto: 0.7, banco: 0.5, colchon: 0.1 } as Record<string, number>,
    emergency_target_months: 6,
  },
  crecimiento: {
    has_recurring_base: 40,
    investment_rate_bonus_per_pct: 2.0,
    diversification: { "1": 0, "2": 10, "3": 15, "4": 20 } as Record<string, number>,
  },
  blindaje: {
    emergency_scoring: { "0-1": 10, "2-3": 30, "4-6": 60, "6+": 80 } as Record<string, number>,
    dependent_multiplier: { "0": 1.0, "1": 1.1, "2": 1.2, "3+": 1.3 } as Record<string, number>,
  },
  trajectory: {
    years: 20,
    optimized_savings_increase: 0.10,
    optimized_return: 0.0837,
    return_cash: 0.04,
    return_investment: 0.0837,
    return_crypto: 0.10,
    return_mattress: 0,
    real_wage_growth: 0.02,
    adverse_income_interruption_months: 6,
    adverse_medical_cost_months: 12,
  },
  score_distribution: {
    critical: [0, 25], vulnerable: [26, 50], good_with_leaks: [51, 75], optimized: [76, 100],
  } as Record<string, [number, number]>,
};
