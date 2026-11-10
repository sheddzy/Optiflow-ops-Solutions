import { SITE } from "./site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function send(subject: string, html: string, replyTo?: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return false; // Email not configured yet
  const to = SITE.enquiryEmail;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], ...(replyTo ? { reply_to: replyTo } : {}), subject: subject.slice(0, 150), html }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) { console.error("email: Resend responded", res.status); return false; }
    return true;
  } catch (err) {
    console.error("email failed", err instanceof Error ? err.name : "unknown");
    return false;
  }
}

const table = (rows: [string, string][]) =>
  `<table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("")}</table>`;
const wrap = (title: string, body: string) => `<div style="font-family:Arial,sans-serif;color:#0f2440;max-width:560px"><h2 style="color:#1b3a63;margin:0 0 12px">${esc(title)}</h2>${body}</div>`;

type Enquiry = { name: string; email: string; business?: string | null; phone?: string | null; website?: string | null; domain?: string | null; service_interest: string; message: string };

/** New-enquiry alert. Never throws: the visitor's submission must not fail because of email. */
export async function notifyNewEnquiry(e: Enquiry): Promise<boolean> {
  const html = wrap("New website enquiry", table([
    ["Name", e.name], ["Email", e.email], ["Business", e.business || "Not given"], ["Phone", e.phone || "Not given"],
    ["Website", e.website || "Not given"], ...(e.domain ? ([["Domain", e.domain]] as [string, string][]) : []), ["Service or product", e.service_interest],
  ]) + `<p style="font-weight:bold;margin:16px 0 4px">Message</p><p style="white-space:pre-wrap;margin:0">${esc(e.message)}</p><p style="color:#4a5b70;font-size:13px;margin-top:20px">Reply to this email to answer the sender directly.</p>`);
  return send(`New enquiry: ${e.service_interest}`, html, e.email);
}

/** Payment alert, sent from the verified Paystack webhook. */
export async function notifyPayment(p: { reference: string; packageName: string; amountNaira: number; amountMatches: boolean; name?: string; email: string; phone?: string; business?: string; domain?: string; paidAt?: string }): Promise<boolean> {
  const html = wrap("Package payment received", table([
    ["Package", p.packageName], ["Amount", `\u20A6${p.amountNaira.toLocaleString("en-NG")}`], ["Matches package price", p.amountMatches ? "Yes" : "NO. Check this payment in Paystack"],
    ["Paystack reference", p.reference], ["Paid at", p.paidAt || "Not given"], ["Name", p.name || "Not given"], ["Email", p.email],
    ["Phone", p.phone || "Not given"], ["Business", p.business || "Not given"], ["Preferred domain", p.domain || "Not given"],
  ]) + `<p style="margin-top:16px">Next step: contact the client to confirm requirements, the service agreement and, for Pro, the number of licensed email users.</p>`);
  return send(`Payment received: ${p.packageName} package`, html, p.email);
}
