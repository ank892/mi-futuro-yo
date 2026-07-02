import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { encryptPII, hasEncryptionKey } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile_id, bridge_id, full_name, email, phone, country, preferred_channel } = body;
    if (!email || !country) {
      return NextResponse.json({ ok: false, error: "email y country requeridos" }, { status: 400 });
    }

    // Enforce that PII is actually encrypted at rest when persisting.
    // Sin LEAD_ENCRYPTION_KEY configurada, no persistimos PII (política zero-plaintext).
    const admin = getSupabaseAdmin();
    if (admin) {
      if (!hasEncryptionKey()) {
        console.warn("Lead recibido pero LEAD_ENCRYPTION_KEY no configurada — no se persiste PII.");
      } else {
        try {
          await admin.from("leads").insert({
            profile_id, bridge_id,
            full_name_encrypted: full_name ? encryptPII(full_name) : null,
            email_encrypted: encryptPII(email),
            phone_encrypted: phone ? encryptPII(phone) : null,
            country,
            preferred_channel: preferred_channel ?? "whatsapp",
          });
        } catch (e) { console.warn("lead persistence failed:", e); }
      }
    }
    return NextResponse.json({ ok: true, message: "Lead capturado. Un asesor te contactará pronto." });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 400 });
  }
}
