"use client";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { WealthProfile } from "@/lib/types";

export default function Asesor() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", country: "MX", preferred_channel: "whatsapp" });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("mfy_profile");
    if (raw) {
      const p: WealthProfile = JSON.parse(raw);
      setForm((f) => ({ ...f, country: p.survey_responses.country }));
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (j.ok) { setStatus("ok"); setMsg(j.message); }
      else { setStatus("error"); setMsg(j.error); }
    } catch (e: any) {
      setStatus("error");
      setMsg(e.message);
    }
  };

  if (status === "ok") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
        <GlassCard className="w-full text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h2 className="mb-2 text-2xl font-bold">¡Listo!</h2>
          <p className="mb-6 text-white/70">{msg}</p>
          <Link href="/resultados"><Button variant="secondary">Volver a mis resultados</Button></Link>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-2 text-3xl font-black">Habla con un asesor</h1>
      <p className="mb-8 text-white/60">
        Un experto certificado te contactará para orquestar tu plan de optimización.
        Sin costo, sin compromiso.
      </p>

      <form onSubmit={submit} className="space-y-4">
        {[
          { k: "full_name", l: "Tu nombre", t: "text", req: true },
          { k: "email", l: "Email", t: "email", req: true },
          { k: "phone", l: "WhatsApp (opcional)", t: "tel", req: false },
        ].map((f) => (
          <div key={f.k}>
            <label className="mb-1 block text-sm text-white/80">{f.l}</label>
            <input
              type={f.t}
              required={f.req}
              value={(form as any)[f.k]}
              onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-mint"
            />
          </div>
        ))}
        <div>
          <label className="mb-1 block text-sm text-white/80">País</label>
          <select
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-mint"
          >
            <option value="MX">México</option>
            <option value="CO">Colombia</option>
            <option value="CR">Costa Rica</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-white/80">Canal preferido</label>
          <div className="grid grid-cols-2 gap-3">
            {["whatsapp", "email"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, preferred_channel: c })}
                className={`rounded-xl border p-3 text-sm capitalize ${
                  form.preferred_channel === c ? "border-mint bg-mint/10" : "border-white/10 bg-white/5"
                }`}
              >{c}</button>
            ))}
          </div>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Solicitar contacto"}
        </Button>
        {status === "error" && <p className="text-sm text-coral">Error: {msg}</p>}
      </form>

      <p className="mt-6 text-xs text-white/40">
        Datos confidenciales y encriptados. Se usan solo para este contacto.
      </p>
    </main>
  );
}
