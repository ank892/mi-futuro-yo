/**
 * Mi Futuro Yo — Definición de las 12 preguntas del quiz
 */
export interface QuizQuestion {
  id: number;
  text: string;
  help: string;
  variable: string;
  type: "segmented" | "selector" | "slider" | "multi_select" | "yes_no" | "yes_no_amount" | "three_way" | "text";
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  step?: number;
  default?: number | string;
  feeds_pillar: string[];
  secondary_variable?: string;
  format?: (v: number) => string;
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "¿Cuál es tu rango de edad?",
    help: "Tu edad determina cuánto tiempo compuesto tienes para crecer tu patrimonio.",
    variable: "age_range",
    type: "segmented",
    options: [
      { value: "20-25", label: "20–25" },
      { value: "26-30", label: "26–30" },
      { value: "31-35", label: "31–35" },
      { value: "36-40", label: "36–40" },
    ],
    feeds_pillar: ["all"],
  },
  {
    id: 2,
    text: "¿En qué país resides?",
    help: "Ajustamos el análisis al costo de vida y sistema financiero de tu país.",
    variable: "country",
    type: "selector",
    options: [
      { value: "MX", label: "México", icon: "🇲🇽" },
      { value: "CO", label: "Colombia", icon: "🇨🇴" },
      { value: "CR", label: "Costa Rica", icon: "🇨🇷" },
    ],
    feeds_pillar: ["all"],
  },
  {
    id: 3,
    text: "¿Cuál es tu ingreso mensual aproximado?",
    help: "Tu ingreso bruto mensual en USD (o equivalente). No necesitas ser exacto.",
    variable: "monthly_income_usd",
    type: "slider",
    min: 500,
    max: 6000,
    step: 100,
    default: 1500,
    format: (v) => `$${v.toLocaleString()} USD/mes`,
    feeds_pillar: ["ingreso"],
  },
  {
    id: 4,
    text: "¿Cuántas personas dependen económicamente de ti?",
    help: "Incluye hijos, padres o cualquier persona que sostienes económicamente.",
    variable: "dependents",
    type: "segmented",
    options: [
      { value: "0", label: "0" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3+" },
    ],
    feeds_pillar: ["blindaje"],
  },
  {
    id: 5,
    text: "¿Cómo describirías tu relación con la deuda?",
    help: "Incluye tarjetas, préstamos personales, hipoteca, etc.",
    variable: "debt_relationship",
    type: "selector",
    options: [
      { value: "no_debt", label: "No tengo deudas" },
      { value: "controlled", label: "Deuda controlada, pago puntual" },
      { value: "pressured", label: "Deuda que me presiona cada mes" },
      { value: "uncontrolled", label: "Deuda que no sé cómo voy a pagar" },
    ],
    feeds_pillar: ["ahorro", "blindaje"],
  },
  {
    id: 6,
    text: "¿Cuánto ahorras al mes (% de tu ingreso)?",
    help: "El porcentaje de tu ingreso que logras guardar cada mes.",
    variable: "savings_rate_pct",
    type: "slider",
    min: 0,
    max: 50,
    step: 1,
    default: 10,
    format: (v) => `${v}%`,
    feeds_pillar: ["ahorro"],
  },
  {
    id: 7,
    text: "¿Dónde tienes tu dinero ahorrado?",
    help: "Selecciona todas las que apliquen.",
    variable: "savings_vehicles",
    type: "multi_select",
    options: [
      { value: "banco", label: "Cuenta bancaria" },
      { value: "inversion", label: "Fondos / ETFs" },
      { value: "cripto", label: "Criptomonedas" },
      { value: "colchon", label: "Efectivo / bajo el colchón" },
    ],
    feeds_pillar: ["ahorro", "crecimiento"],
  },
  {
    id: 8,
    text: "¿Tienes alguna inversión recurrente (automática o manual)?",
    help: "Aportación mensual a inversiones (fondos, ETFs, cripto, etc.).",
    variable: "has_recurring_investment",
    type: "yes_no_amount",
    secondary_variable: "recurring_investment_pct",
    feeds_pillar: ["crecimiento"],
  },
  {
    id: 9,
    text: "Si mañana no pudieras trabajar, ¿cuántos meses podrías cubrir tus gastos?",
    help: "Con tus ahorros actuales, sin ingresos.",
    variable: "emergency_months",
    type: "segmented",
    options: [
      { value: "0-1", label: "0–1 meses" },
      { value: "2-3", label: "2–3 meses" },
      { value: "4-6", label: "4–6 meses" },
      { value: "6+", label: "Más de 6" },
    ],
    feeds_pillar: ["ahorro", "blindaje"],
  },
  {
    id: 10,
    text: "¿Tienes un seguro de gastos médicos mayores?",
    help: "Cobertura hospitalaria/cirugías (privado o laboral).",
    variable: "has_health_insurance",
    type: "yes_no",
    feeds_pillar: ["blindaje"],
  },
  {
    id: 11,
    text: "¿Conoces tu AFORE/pensión y cuánto tienes?",
    help: "En México: AFORE. En Colombia: AFP. En Costa Rica: complementaria CCSS.",
    variable: "knows_pension",
    type: "three_way",
    options: [
      { value: "true", label: "Sí, lo conozco" },
      { value: "false", label: "No lo sé" },
      { value: "null", label: "No aplica para mi país" },
    ],
    feeds_pillar: ["crecimiento", "blindaje"],
  },
  {
    id: 12,
    text: "En una escala del 1–10, ¿qué tan claro tienes tu plan financiero a 20 años?",
    help: "1 = ningún plan. 10 = plan detallado con metas específicas.",
    variable: "financial_plan_clarity",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    default: 5,
    format: (v) => `${v}/10`,
    feeds_pillar: ["crecimiento"],
  },
];
