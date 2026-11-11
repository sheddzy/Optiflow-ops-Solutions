"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";

const htmlEntities: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => htmlEntities[char] ?? char);

export async function sendRecruitmentEmailAction(formData: FormData) {
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  const to = String(formData.get("to") ?? "").trim();
  let subject = String(formData.get("subject") ?? "").trim();
  let body = String(formData.get("body") ?? "").trim();
  const templateId = String(formData.get("template_id") ?? "").trim();
  const audience = String(formData.get("audience") ?? "candidate");
  const candidateId = String(formData.get("candidate_id") ?? "").trim() || null;
  const clientId = String(formData.get("client_id") ?? "").trim() || null;
  const applicationId = String(formData.get("application_id") ?? "").trim() || null;

  if (templateId) {
    const templates = await recruitmentData<{ subject: string; body: string }[]>(
      `communication_templates?select=subject,body&id=eq.${encodeURIComponent(templateId)}&agency_id=eq.${membership.agency_id}&is_active=eq.true&limit=1`,
    );
    if (!templates[0]) throw new Error("Selected email template is unavailable.");
    subject = templates[0].subject;
    body = templates[0].body;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new Error("Enter a valid recipient email.");
  if (!subject || subject.length > 150) throw new Error("Subject is required and must be under 150 characters.");
  if (!body || body.length > 20000) throw new Error("Email message is required and must be under 20,000 characters.");
  if (!["candidate", "client", "internal"].includes(audience)) throw new Error("Choose a valid audience.");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) throw new Error("Email is not configured. Add RESEND_API_KEY and RESEND_FROM to the Wasmer recruitment app environment.");

  const html = `<div style="font-family:Arial,sans-serif;color:#243b53;line-height:1.6;white-space:pre-wrap">${escapeHtml(body)}</div>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text: body, html }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  const responseBody = await response.json().catch(() => ({})) as { id?: string; message?: string };
  const status = response.ok ? "sent" : "failed";
  await recruitmentData("communication_logs", {
    method: "POST",
    body: {
      agency_id: membership.agency_id,
      candidate_id: candidateId,
      client_id: clientId,
      application_id: applicationId,
      recipient_email: to,
      subject,
      body_snapshot: body,
      provider: "resend",
      provider_message_id: responseBody.id ?? null,
      delivery_status: status,
      error_message: response.ok ? null : (responseBody.message ?? "Email provider rejected the message."),
      sent_at: response.ok ? new Date().toISOString() : null,
    },
    prefer: "return=minimal",
  });

  if (!response.ok) throw new Error(responseBody.message ?? "Email could not be sent. Check your Resend configuration.");
  revalidatePath("/app/communications");
  redirect("/app/communications?sent=1");
}

export async function saveCommunicationTemplateAction(formData: FormData) {
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const audience = String(formData.get("audience") ?? "candidate");
  const name = String(formData.get("name") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!["candidate", "client", "internal"].includes(audience) || name.length < 2 || !subject || !body) {
    throw new Error("Complete the template name, audience, subject and message.");
  }
  await recruitmentData("communication_templates", {
    method: "POST",
    body: { agency_id: membership.agency_id, audience, name, subject, body },
    prefer: "return=minimal",
  });
  revalidatePath("/app/communications");
  redirect("/app/communications?template=1");
}
