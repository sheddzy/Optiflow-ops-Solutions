"use server";

import { headers } from "next/headers";
import { publicClient } from "@/lib/supabase";
import { enquirySchema } from "@/lib/validation";
import { notifyNewEnquiry } from "@/lib/email";

export type FormState = { status: "idle" | "success" | "error"; message?: string; errors?: Record<string, string> };

// Best-effort per-instance limiter. The database trigger is the hard limit.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function submitEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  // Honeypot: real people never fill this hidden field. Pretend success so bots learn nothing.
  if (String(form.get("website") ?? "") !== "") return { status: "success" };

  const h = await headers();
  // Netlify supplies the visitor address in x-nf-client-connection-ip.
  const ip = (h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (limited(ip)) return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };

  const parsed = enquirySchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { status: "error", message: "Please fix the highlighted fields.", errors };
  }

  const db = publicClient();
  if (!db) return { status: "error", message: `The enquiry service is not available right now. Please email ${"operations@optiflowops.online"} instead.` };

  const d = parsed.data;
  const { error } = await db.from("enquiries").insert({
    name: d.name,
    email: d.email,
    company: d.company || null,
    phone: d.phone || null,
    service_interest: d.service_interest,
    message: d.message,
    consent: true,
  });

  if (error) {
    console.error("submitEnquiry", error.message);
    if (error.message.includes("rate_limited")) return { status: "error", message: "We have received several enquiries from this address recently. Please email operations@optiflowops.online." };
    return { status: "error", message: "Your enquiry could not be sent. Please try again, or email operations@optiflowops.online." };
  }
  // Must be awaited: serverless functions can stop as soon as the response is sent.
  await notifyNewEnquiry(d);
  return { status: "success" };
}
