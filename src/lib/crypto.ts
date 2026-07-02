/**
 * Cifrado AES-256-GCM para PII de leads.
 * Formato del ciphertext: base64(iv|tag|ciphertext)  (iv=12B, tag=16B)
 * Requiere LEAD_ENCRYPTION_KEY como base64 de 32 bytes.
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function getKey(): Buffer | null {
  const k = process.env.LEAD_ENCRYPTION_KEY;
  if (!k) return null;
  try {
    const buf = Buffer.from(k, "base64");
    if (buf.length !== 32) return null;
    return buf;
  } catch { return null; }
}

export function encryptPII(plaintext: string): string | null {
  if (!plaintext) return null;
  const key = getKey();
  if (!key) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptPII(ciphertext: string): string | null {
  const key = getKey();
  if (!key || !ciphertext) return null;
  try {
    const buf = Buffer.from(ciphertext, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function hasEncryptionKey(): boolean {
  return getKey() !== null;
}
