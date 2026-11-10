"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { publicClient } from "@/lib/supabase";
import { claimSchema } from "@/lib/validation";
import { getPromotionForClaim } from "@/lib/cms";
import { notifyNewEnquiry } from "@/lib/email";
import { SITE } from "@/lib/site";
import type { FormState } from "../../contact/actions";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const lines = (v: { name: string; business?: string; email: string; phone: string; domain?: string; title: string; message?: string }) =>
  [`Offer: ${v.title}`, `Name: ${v.name}`, `Business: ${v.business || "Not given"}`, `Email: ${v.email}`, `Phone: ${v.phone}`, `Domain: ${v.domain || "Not given"}`, "", v.message || "I would like to claim this offer."].join("\n");

/**
 * Claim a promotion. The server re-checks that the offer is open (published, in its dates, slots left) and the database enforces the same rules.
 * The claim is saved when the database is connected, emailed through Resend, and falls back to a prefilled email if Resend is not available.
 */
export async function claimPromotion(_prev: FormState, form: FormData): Promise<FormState> {
  if (String(form.get("hp_company_site") ?? "") !== "") return { status: "success", message: "Thank you." };

  const h = await headers();
  const ip = (h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return { status: "error", message: "Too many attempts. Please wait a few minutes, or use the WhatsApp option." };

  const slug = String(form.get("promo_slug") ?? "");
  const parsed = claimSchema.safeParse(Object.fromEntries(form));
  const { promo, open, db, error } = await getPromotionForClaim(slug);
  if (error) return { status: "error", message: "This offer is temporarily unavailable. Please try again shortly, or use the WhatsApp option." };
  if (!promo) return { status: "error", message: "This offer could not be found." };
  if (!open) return { status: "error", message: "Sorry, this offer is no longer available. See our packages, or send us an enquiry and we will help." };

  const errors: Record<string, string> = {};
  if (!parsed.success) for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
  if (promo.askDomain && !(parsed.success ? (parsed.data.domain ?? "") : String(form.get("domain") ?? "")).trim()) errors.domain ??= "Enter your domain, for example yourcompany.com.";
  if (!parsed.success || Object.keys(errors).length) return { status: "error", message: "Please fix the highlighted fields.", errors };
  const d = parsed.data;

  if (db) {
    const client = publicClient({ revalidate: false });
    const { error: dbErr } = await client!.from("enquiries").insert({
      name: d.name, email: d.email, company: d.business || null, phone: d.phone || null, domain: d.domain || null,
      service_interest: `Promotion: ${promo.title}`.slice(0, 160), promotion_id: promo.id, consent: true,
      message: d.message ? d.message : `Claiming the ${promo.title} offer.`,
    });
    if (dbErr?.message.includes("promotion_closed")) return { status: "error", message: "Sorry, this offer has just closed or run out of places. See our packages, or send us an enquiry." };
    if (dbErr?.message.includes("rate_limited")) return { status: "error", message: "We have received several requests from this address recently. Please use the WhatsApp option instead." };
    if (dbErr) console.error("claimPromotion: database copy not saved", dbErr.message);
  }

  const sent = await notifyNewEnquiry({ name: d.name, email: d.email, business: d.business, phone: d.phone, domain: d.domain, service_interest: `Promotion: ${promo.title}`, message: d.message || `Claiming the ${promo.title} offer.` });
  if (sent) {
    (await cookies()).set("enq_ok", "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
    redirect("/thank-you");
  }
  const body = lines({ ...d, title: promo.title });
  return { status: "fallback", mailto: `mailto:${SITE.enquiryEmail}?subject=${encodeURIComponent(`Offer claim: ${promo.title}`)}&body=${encodeURIComponent(body)}` };
}
