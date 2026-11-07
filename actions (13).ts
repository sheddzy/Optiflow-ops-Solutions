"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buySchema } from "@/lib/validation";
import { getPackage } from "@/lib/packages";
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
 * Starts a Paystack checkout. The price is read from our own package list on the server,
 * never from the browser, so it cannot be altered by the visitor.
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
  const pkg = getPackage(d.package_id);
  if (!pkg) return { status: "error", message: "Choose a package." };

  if (!paystackConfigured()) {
    return { status: "error", message: "Online payment is not available yet. Please send an enquiry instead and we will arrange payment with you." };
  }

  const reference = `OPT-${pkg.id.toUpperCase()}-${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const result = await initializeTransaction({
    email: d.email,
    amountKobo: pkg.price * 100,
    reference,
    callbackUrl: `${SITE.url}/payment/callback`,
    metadata: {
      package: pkg.id, package_name: `${pkg.name} package`, name: d.name, phone: d.phone, business: d.business ?? "", domain: d.domain ?? "",
      custom_fields: [{ display_name: "Package", variable_name: "package", value: `${pkg.name} (annual)` }, { display_name: "Customer", variable_name: "customer", value: d.name }],
    },
  });
  if (!result.ok) return { status: "error", message: "We could not start the payment. Please try again, or send an enquiry and we will help." };
  redirect(result.url); // to Paystack's secure payment page
}
