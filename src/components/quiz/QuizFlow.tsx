"use client";
import { useState } from "react";
import { QUESTIONS, QuizQuestion } from "@/lib/quiz-questions";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useRouter } from "next/navigation";

type Answers = Record<string, any>;

export function QuizFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    savings_vehicles: [],
    dependents: 0,
    savings_rate_pct: 10,
    monthly_income_usd: 1500,
    has_recurring_investment: false,
    recurring_investment_pct: 0,
    financial_plan_clarity: 5,
    has_health_insurance: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[step];
  const canProceed = validate(q, answers);

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch("/api/score", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(answers),
        });
        const j = await res.json();
        if (j.ok) {
          sessionStorage.setItem("mfy_profile", JSON.stringify(j.profile));
          router.push("/calculando");
        } else {
          alert("Error: " + j.error);
          setSubmitting(false);
        }
      } catch (e: any) {
        alert("Error de red: " + e.message);
        setSubmitting(false);
      }
    }
  };

  const setValue = (v: any) => setAnswers({ ...answers, [q.variable]: v });
  const setSecondary = (v: any) => q.secondary_variable && setAnswers({ ...answers, [q.secondary_variable]: v });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-6 py-8">
      <ProgressBar current={step + 1} total={QUESTIONS.length} />

      <GlassCard className="mt-8 flex-1 animate-fade-in-up" key={step}>
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-mint">
            Pregunta {step + 1}
          </p>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{q.text}</h2>
          <p className="mt-2 text-sm text-white/60">{q.help}</p>
        </div>

        <QuestionInput q={q} answers={answers} onChange={setValue} onSecondaryChange={setSecondary} />
      </GlassCard>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={submitting}>
            ← Atrás
          </Button>
        )}
        <Button
          fullWidth
          onClick={handleNext}
          disabled={!canProceed || submitting}
        >
          {submitting ? "Calculando..." : step === QUESTIONS.length - 1 ? "Ver mi Score →" : "Siguiente →"}
        </Button>
      </div>
    </div>
  );
}

function validate(q: QuizQuestion, a: Answers): boolean {
  const v = a[q.variable];
  if (q.type === "multi_select") return Array.isArray(v);
  if (q.type === "slider") return v !== undefined && v !== null;
  if (q.type === "yes_no_amount") return v !== undefined;
  if (q.type === "yes_no") return v !== undefined && v !== null;
  if (q.type === "three_way") return v !== undefined;
  return v !== undefined && v !== null && v !== "";
}

function QuestionInput({
  q, answers, onChange, onSecondaryChange,
}: {
  q: QuizQuestion; answers: Answers; onChange: (v: any) => void; onSecondaryChange: (v: any) => void;
}) {
  const v = answers[q.variable];

  if (q.type === "segmented" || q.type === "selector") {
    return (
      <div className={q.type === "segmented" ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "space-y-3"}>
        {q.options?.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(q.variable === "dependents" ? Number(o.value) : o.value)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              (q.variable === "dependents" ? String(v) : v) === o.value
                ? "border-mint bg-mint/10 text-white shadow-glow"
                : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
            }`}
          >
            {o.icon && <span className="mr-2 text-xl">{o.icon}</span>}
            <span className="font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    );
  }

  if (q.type === "slider") {
    const val = v ?? q.default ?? q.min ?? 0;
    return (
      <div>
        <div className="mb-4 text-center text-4xl font-black text-mint">
          {q.format ? q.format(val) : val}
        </div>
        <input
          type="range"
          min={q.min}
          max={q.max}
          step={q.step}
          value={val}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-mint"
        />
        <div className="mt-2 flex justify-between text-xs text-white/50">
          <span>{q.format ? q.format(q.min!) : q.min}</span>
          <span>{q.format ? q.format(q.max!) : q.max}</span>
        </div>
      </div>
    );
  }

  if (q.type === "multi_select") {
    const arr: string[] = Array.isArray(v) ? v : [];
    return (
      <div className="space-y-3">
        {q.options?.map((o) => {
          const on = arr.includes(o.value);
          return (
            <button
              key={o.value}
              onClick={() =>
                onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])
              }
              className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                on ? "border-mint bg-mint/10 text-white" : "border-white/10 bg-white/5 text-white/80 hover:border-white/30"
              }`}
            >
              <span className="font-medium">{o.label}</span>
              <span className={`h-5 w-5 rounded-md border-2 ${on ? "border-mint bg-mint" : "border-white/30"}`}>
                {on && <svg viewBox="0 0 20 20" fill="#0F1B3D"><path d="M5 10l3 3 7-7" stroke="#0F1B3D" strokeWidth="2" fill="none" /></svg>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === "yes_no") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[{ v: true, l: "Sí" }, { v: false, l: "No" }].map((o) => (
          <button
            key={String(o.v)}
            onClick={() => onChange(o.v)}
            className={`rounded-2xl border p-6 text-lg font-medium transition-all ${
              v === o.v ? "border-mint bg-mint/10 text-white shadow-glow" : "border-white/10 bg-white/5 text-white/80"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    );
  }

  if (q.type === "three_way") {
    return (
      <div className="space-y-3">
        {q.options?.map((o) => {
          const parsed = o.value === "null" ? null : o.value === "true";
          const sel = v === parsed;
          return (
            <button
              key={o.value}
              onClick={() => onChange(parsed)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                sel ? "border-mint bg-mint/10" : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === "yes_no_amount") {
    const has = v === true;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ v: true, l: "Sí" }, { v: false, l: "No" }].map((o) => (
            <button
              key={String(o.v)}
              onClick={() => onChange(o.v)}
              className={`rounded-2xl border p-6 text-lg font-medium transition-all ${
                v === o.v ? "border-mint bg-mint/10 text-white shadow-glow" : "border-white/10 bg-white/5 text-white/80"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
        {has && (
          <div className="animate-fade-in-up">
            <label className="mb-2 block text-sm text-white/70">¿Qué porcentaje de tu ingreso inviertes?</label>
            <input
              type="range" min={1} max={30} step={1}
              value={answers[q.secondary_variable!] ?? 5}
              onChange={(e) => onSecondaryChange(Number(e.target.value))}
              className="w-full accent-mint"
            />
            <div className="mt-1 text-center text-2xl font-bold text-mint">
              {answers[q.secondary_variable!] ?? 5}%
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
