import { NextRequest, NextResponse } from "next/server";
import { calculateWealthScore } from "@/lib/engine/scoring";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import type { SurveyResponses } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validación de enums antes de invocar el engine
    const validAge = ["20-25","26-30","31-35","36-40"];
    const validCountry = ["MX","CO","CR"];
    const validDebt = ["no_debt","controlled","pressured","uncontrolled"];
    const validEmergency = ["0-1","2-3","4-6","6+"];
    if (!validAge.includes(body.age_range)) {
      return NextResponse.json({ ok: false, error: "age_range inválido", field: "age_range" }, { status: 422 });
    }
    if (!validCountry.includes(body.country)) {
      return NextResponse.json({ ok: false, error: "country inválido (MX/CO/CR)", field: "country" }, { status: 422 });
    }
    if (!validDebt.includes(body.debt_relationship)) {
      return NextResponse.json({ ok: false, error: "debt_relationship inválido", field: "debt_relationship" }, { status: 422 });
    }
    if (!validEmergency.includes(body.emergency_months)) {
      return NextResponse.json({ ok: false, error: "emergency_months inválido", field: "emergency_months" }, { status: 422 });
    }
    const income = Number(body.monthly_income_usd);
    if (!Number.isFinite(income) || income < 100 || income > 100000) {
      return NextResponse.json({ ok: false, error: "monthly_income_usd fuera de rango", field: "monthly_income_usd" }, { status: 422 });
    }

    const responses = normalize(body);
    const profile = calculateWealthScore(responses);

    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        const { data: bridge } = await admin
          .from("uuid_bridge")
          .insert({ country_code: responses.country })
          .select("id")
          .single();
        if (bridge?.id) {
          const { data: fp } = await admin
            .from("financial_profiles")
            .insert({ bridge_id: bridge.id, ...responses })
            .select("id")
            .single();
          if (fp?.id) {
            await admin.from("scores_cache").insert({
              profile_id: fp.id,
              overall_score: profile.overall_score,
              score_label: profile.score_label,
              confidence: profile.confidence,
              s_ingreso: profile.sub_scores.ingreso.value,
              s_ahorro: profile.sub_scores.ahorro.value,
              s_crecimiento: profile.sub_scores.crecimiento.value,
              s_blindaje: profile.sub_scores.blindaje.value,
              w_ingreso: profile.sub_scores.ingreso.weight,
              w_ahorro: profile.sub_scores.ahorro.weight,
              w_crecimiento: profile.sub_scores.crecimiento.weight,
              w_blindaje: profile.sub_scores.blindaje.weight,
              percentile: profile.peer_benchmark.percentile,
              cohort_median: profile.peer_benchmark.cohort_median_score,
              total_leak_impact_20yr: profile.total_leak_impact_20yr,
              final_current: profile.trajectory.final_current,
              final_optimized: profile.trajectory.final_optimized,
              final_adverse: profile.trajectory.final_adverse,
              full_result: profile,
            });
          }
        }
      } catch (e) { console.warn("Supabase persistence failed:", e); }
    }

    return NextResponse.json({ ok: true, profile });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}

function normalize(body: any): SurveyResponses {
  return {
    age_range: body.age_range,
    country: body.country,
    monthly_income_usd: Number(body.monthly_income_usd),
    dependents: Number(body.dependents ?? 0),
    debt_relationship: body.debt_relationship,
    savings_rate_pct: Number(body.savings_rate_pct ?? 0),
    savings_vehicles: Array.isArray(body.savings_vehicles) ? body.savings_vehicles : [],
    has_recurring_investment: Boolean(body.has_recurring_investment),
    recurring_investment_pct: Number(body.recurring_investment_pct ?? 0),
    emergency_months: body.emergency_months,
    has_health_insurance: Boolean(body.has_health_insurance),
    knows_pension:
      body.knows_pension === null || body.knows_pension === "null" || body.knows_pension === undefined
        ? null
        : body.knows_pension === true || body.knows_pension === "true",
    financial_plan_clarity: Number(body.financial_plan_clarity ?? 5),
    financial_goal: body.financial_goal,
  };
}
