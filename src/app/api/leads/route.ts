import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile_id, bridge_id, full_name, email, phone, country, preferred_channel } = body;
    if (!email || !country) {
      return NextResponse.json({ ok: false, error: "email y country requeridos" }, { status: 400 });
    }
    const admin = getSupabaseAdmin();
    if (admin) {
      try {
        const enc = (v: string) => Buffer.from(v).toString("base64");
        await admin.from("leads").insert({
          profile_id, bridge_id,
          full_name_encrypted: full_name ? enc(full_name) : null,
          email_encrypted: enc(email),
          phone_encrypted: phone ? enc(phone) : null,
          country,
          preferred_channel: preferred_channel ?? "whatsapp",
        });
      } catch (e) { console.warn("lead persistence failed:", e); }
    }
    return NextResponse.json({ ok: true, message: "Lead capturado. Un asesor te contactará pronto." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}
