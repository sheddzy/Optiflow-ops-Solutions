import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.paystack.co";

/** Paystack is enabled only when the secret key is set on the server. The key is never sent to the browser. */
export const paystackConfigured = () => Boolean(process.env.PAYSTACK_SECRET_KEY);

const headers = () => ({ Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" });

export async function initializeTransaction(input: { email: string; amountKobo: number; reference: string; callbackUrl: string; metadata: Record<string, unknown> }): Promise<{ ok: true; url: string } | { ok: false }> {
  try {
    const res = await fetch(`${API}/transaction/initialize`, {
      method: "POST", headers: headers(), signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ email: input.email, amount: input.amountKobo, currency: "NGN", reference: input.reference, callback_url: input.callbackUrl, metadata: input.metadata }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.status || !json?.data?.authorization_url) { console.error("paystack initialize failed", res.status, json?.message); return { ok: false }; }
    return { ok: true, url: json.data.authorization_url as string };
  } catch (e) {
    console.error("paystack initialize error", e instanceof Error ? e.name : "unknown");
    return { ok: false };
  }
}

export type Verified = { ok: boolean; status?: string; amountKobo?: number; currency?: string; email?: string; paidAt?: string; metadata?: Record<string, any> };

/** Always confirm a payment with Paystack itself. Never trust the browser's redirect alone. */
export async function verifyTransaction(reference: string): Promise<Verified> {
  if (!/^[A-Za-z0-9._=-]{6,100}$/.test(reference)) return { ok: false };
  try {
    const res = await fetch(`${API}/transaction/verify/${encodeURIComponent(reference)}`, { headers: headers(), signal: AbortSignal.timeout(10000), cache: "no-store" });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.status || !json?.data) return { ok: false };
    const d = json.data;
    return { ok: true, status: d.status, amountKobo: d.amount, currency: d.currency, email: d.customer?.email, paidAt: d.paid_at, metadata: typeof d.metadata === "object" && d.metadata ? d.metadata : {} };
  } catch {
    return { ok: false };
  }
}

/** Webhook authenticity: HMAC SHA512 of the raw request body, using the secret key. */
export function validSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
