"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buySchema } from "@/lib/validation";
import { getPackageForCheckout } from "@/lib/cms";
import { initializeTransaction, paystackConfigured } from "@/lib/paystack";
import { SITE } from "@/lib/site";

export type BuyState = { status: "idle" | "error"; message?: string; errors?: Record<string, string> };

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 6;
}

/**
 * Starts a Paystack checkout. The price is read fresh from the server's own package list (the database when connected),
 * never from the browser. The amount we charge is stored with the payment so a later price change cannot confuse verification.
 */
export async function startPackagePayment(_prev: BuyState, form: FormData): Promise<BuyState> {
  if (String(form.get("hp_company_site") ?? "") !== "") return { status: "error", message: "Could not start payment." };

  const h = await headers();
  const ip = (h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };

  const parsed = buySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { status: "error", message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;

  if (!paystackConfigured()) return { status: "error", message: "Online payment is not available yet. Please send an enquiry instead and we will arrange payment with you." };

  const { pkg, error } = await getPackageForCheckout(d.package_id);
  if (error) return { status: "error", message: "Online payment is temporarily unavailable. Please send an enquiry instead and we will help you." };
  if (!pkg) return { status: "error", message: "This package is not available for online purchase. Please send an enquiry instead." };
  if (pkg.price <= 0) return { status: "error", message: "This package has no online price. Please send an enquiry instead." };

  const amountKobo = pkg.price * 100;
  const reference = `OPT-${pkg.id.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)}-${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const result = await initializeTransaction({
    email: d.email,
    amountKobo,
    reference,
    callbackUrl: `${SITE.url}/payment/callback`,
    metadata: {
      package: pkg.id, package_name: `${pkg.name} package`, expected_kobo: amountKobo, name: d.name, phone: d.phone, business: d.business ?? "", domain: d.domain ?? "",
      custom_fields: [{ display_name: "Package", variable_name: "package", value: pkg.name }, { display_name: "Customer", variable_name: "customer", value: d.name }],
    },
  });
  if (!result.ok) return { status: "error", message: "We could not start the payment. Please try again, or send an enquiry and we will help." };
  redirect(result.url); // to Paystack's secure payment page
}
