"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { publicClient } from "@/lib/supabase";
import { emailEnquirySchema } from "@/lib/validation";
import { notifyNewEnquiry } from "@/lib/email";
import { mailtoUrl } from "@/lib/enquiry-links";

export type FormState = {
  status: "idle" | "success" | "fallback" | "error";
  message?: string;
  errors?: Record<string, string>;
  mailto?: string;
};

// Best-effort per-instance limiter. The database trigger is the hard limit when the database is connected.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

/**
 * Email route. Order of preference:
 * 1. Email the enquiry through Resend to the enquiries mailbox (needs RESEND_API_KEY and RESEND_FROM). Only then does the visitor see the thank-you page.
 * 2. If that is not configured or fails, return a prefilled mailto link so the visitor can send it from their own email app.
 * A copy is also saved to the database when it is connected. That step never blocks the enquiry.
 */
export async function submitEmailEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  if (String(form.get("hp_company_site") ?? "") !== "") return { status: "success", message: "Thank you." }; // honeypot

  const h = await headers();
  const ip = (h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return { status: "error", message: "Too many attempts. Please wait a few minutes, or use the WhatsApp option." };

  const parsed = emailEnquirySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { status: "error", message: "Please fix the highlighted fields.", errors };
  }
  const d = parsed.data;

  const db = publicClient();
  if (db) {
    const { error } = await db.from("enquiries").insert({
      name: d.name, email: d.email, company: d.business || null, phone: d.phone || null,
      service_interest: d.service_interest, message: d.website ? `${d.message}\n\nBusiness website: ${d.website}` : d.message, consent: true,
    });
    if (error?.message.includes("rate_limited")) return { status: "error", message: "We have received several enquiries from this address recently. Please use the WhatsApp option instead." };
    if (error) console.error("submitEmailEnquiry: database copy not saved", error.message);
  }

  // Must be awaited: serverless functions can stop as soon as the response is sent.
  const sent = await notifyNewEnquiry({ name: d.name, email: d.email, business: d.business, phone: d.phone, website: d.website, service_interest: d.service_interest, message: d.message });
  if (sent) {
    (await cookies()).set("enq_ok", "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
    redirect("/thank-you"); // only reached after the backend confirmed the email was sent
  }

  return { status: "fallback", mailto: mailtoUrl({ name: d.name, business: d.business, email: d.email, phone: d.phone, website: d.website, service: d.service_interest, message: d.message }) };
}
