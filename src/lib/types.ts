/**
 * Mi Futuro Yo — Tipos compartidos
 */

export type AgeRange = "20-25" | "26-30" | "31-35" | "36-40";
export type Country = "MX" | "CO" | "CR";
export type DebtRelationship = "no_debt" | "controlled" | "pressured" | "uncontrolled";
export type EmergencyMonths = "0-1" | "2-3" | "4-6" | "6+";
export type SavingsVehicle = "banco" | "inversion" | "cripto" | "colchon";
export type Pillar = "ingreso" | "ahorro" | "crecimiento" | "blindaje";
export type ScoreLabel = "Riesgo Crítico" | "Vulnerable" | "Buen camino, con fugas detectadas" | "Optimizado";
export type Severity = "alta" | "media" | "baja";
export type Confidence = "alta" | "media" | "baja";

export interface SurveyResponses {
  age_range: AgeRange;
  country: Country;
  monthly_income_usd: number;
  dependents: number;                        // 0..3 (3 == 3+)
  debt_relationship: DebtRelationship;
  savings_rate_pct: number;                  // 0..50
  savings_vehicles: SavingsVehicle[];
  has_recurring_investment: boolean;
  recurring_investment_pct: number;          // % del ingreso
  emergency_months: EmergencyMonths;
  has_health_insurance: boolean;
  knows_pension: boolean | null;             // null = no aplica
  financial_plan_clarity: number;            // 1..10
  financial_goal?: string;                   // Q12 opcional
}

export interface SubScore {
  name: string;
  value: number;                             // 0..100
  weight: number;
  label: string;
  details: string[];
}

export interface WealthLeak {
  id: string;
  name: string;
  severity: Severity;
  estimated_20yr_impact_usd: number;
  monthly_impact_usd: number;
  description: string;
  pillar_affected: Pillar;
}

export interface TrajectoryPoint {
  year: number;
  current_path: number;
  optimized: number;
  adverse: number;
}

export interface WealthTrajectory {
  points: TrajectoryPoint[];
  final_current: number;
  final_optimized: number;
  final_adverse: number;
  difference_best_worst: number;
}

export interface PeerBenchmark {
  percentile: number;
  cohort_description: string;
  cohort_median_score: number;
  user_vs_median: "above" | "below" | "at";
}

/** Producto de seguro / póliza */
export interface InsuranceProduct {
  id?: string;
  code: string;
  provider_code: "BMI" | "PALIG" | "VUMI" | "REDBRIDGE";
  name: string;
  category: "health" | "life" | "catastrophic" | "pediatric" | "income_protection";
  max_coverage_usd: number | null;
  monthly_premium_usd: number;
  annual_premium_usd: number;
  description: string;
  features: string[];
  countries: Country[];
}

/**
 * POTENCIADOR (Booster) — recomendación de producto que cierra una fuga
 * Es EL diferencial monetizable del app.
 */
export interface WealthBooster {
  id: string;
  leak_id: string;                           // fuga que atiende
  product: InsuranceProduct;
  monthly_cost_usd: number;
  annual_cost_usd: number;
  leak_impact_covered_usd: number;           // impacto 20yr que "libera"
  roa_multiplier: number;                    // impacto_20yr / (annual_cost * 20)
  monthly_cost_range: string;                // "~$28-45/mes"
  rationale: string;                         // por qué este producto para este usuario
  rank: number;                              // 1..3
  pillar_boosted: Pillar;
}

export interface WealthProfile {
  overall_score: number;
  score_label: ScoreLabel;
  confidence: Confidence;
  sub_scores: {
    ingreso: SubScore;
    ahorro: SubScore;
    crecimiento: SubScore;
    blindaje: SubScore;
  };
  detected_leaks: WealthLeak[];
  total_leak_impact_20yr: number;
  boosters: WealthBooster[];                 // top-3 recomendaciones
  trajectory: WealthTrajectory;
  peer_benchmark: PeerBenchmark;
  survey_responses: SurveyResponses;
  country_context: {
    name: string;
    inflation: number;
    health_oop: number;
    pension_system: string;
  };
  generated_at: string;
}
