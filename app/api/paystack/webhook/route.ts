import { NextResponse } from "next/server";
import { getPackage } from "@/lib/packages";
import { validSignature } from "@/lib/paystack";
import { notifyPayment } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Paystack calls this when a payment succeeds, even if the customer closes the browser early.
 * The request is trusted only if its HMAC SHA512 signature matches our secret key.
 * Set the URL in Paystack: Settings > API Keys & Webhooks > Live (and Test) Webhook URL.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-paystack-signature"))) return new NextResponse("Invalid signature", { status: 401 });

  let event: any;
  try { event = JSON.parse(raw); } catch { return new NextResponse("Bad request", { status: 400 }); }

  if (event?.event === "charge.success" && event?.data?.status === "success") {
    const d = event.data;
    const md = (typeof d.metadata === "object" && d.metadata) || {};
    const pkg = getPackage(String(md.package ?? ""));
    const amountKobo = Number(d.amount) || 0;
    await notifyPayment({
      reference: String(d.reference ?? ""),
      packageName: pkg ? `${pkg.name} package` : String(md.package_name ?? "Unknown package"),
      amountNaira: amountKobo / 100,
      amountMatches: !!pkg && amountKobo === pkg.price * 100 && d.currency === "NGN",
      name: md.name, email: String(d.customer?.email ?? ""), phone: md.phone, business: md.business, domain: md.domain, paidAt: d.paid_at,
    });
  }
  return NextResponse.json({ received: true });
}
