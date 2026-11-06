import { SITE } from "./site";

type Enquiry = { name: string; email: string; company?: string | null; phone?: string | null; service_interest: string; message: string };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Sends a new-enquiry alert through Resend's REST API.
 * Never throws: the enquiry is already saved, so an email problem must not fail the visitor's submission.
 */
export async function notifyNewEnquiry(e: Enquiry): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return false; // Email not configured yet: enquiries still land in the database.

  const to = process.env.ENQUIRY_NOTIFY_TO || SITE.email;
  const rows: [string, string][] = [
    ["Name", e.name], ["Email", e.email], ["Company", e.company || "Not given"],
    ["Phone", e.phone || "Not given"], ["Service", e.service_interest],
  ];
  const html = `<div style="font-family:Arial,sans-serif;color:#0f2440;max-width:560px">
<h2 style="color:#1b3a63;margin:0 0 12px">New website enquiry</h2>
<table style="border-collapse:collapse;width:100%">${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:bold;vertical-align:top">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("")}</table>
<p style="font-weight:bold;margin:16px 0 4px">Message</p>
<p style="white-space:pre-wrap;margin:0">${esc(e.message)}</p>
<p style="color:#4a5b70;font-size:13px;margin-top:20px">Reply to this email to answer the sender directly.</p></div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: e.email, subject: `New enquiry: ${e.service_interest}`.slice(0, 150), html }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) { console.error("notifyNewEnquiry: Resend responded", res.status); return false; }
    return true;
  } catch (err) {
    console.error("notifyNewEnquiry failed", err instanceof Error ? err.name : "unknown");
    return false;
  }
}
