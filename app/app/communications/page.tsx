import Link from "next/link";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getAgency, getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { signOutAction } from "../actions";
import { saveCommunicationTemplateAction, sendRecruitmentEmailAction } from "./actions";

export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
const value = (v: unknown) => v == null ? "" : String(v);

export default async function CommunicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ data: session }, query] = await Promise.all([neonAuth.getSession(), searchParams]);
  if (!session?.user) redirect("/auth/sign-in");
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const [agency, templates, logs] = await Promise.all([
    getAgency(membership.agency_id),
    recruitmentData<Row[]>(`communication_templates?select=id,name,audience,subject,body,is_active&agency_id=eq.${membership.agency_id}&order=created_at.desc&limit=100`).catch(() => []),
    recruitmentData<Row[]>(`communication_logs?select=id,recipient_email,subject,delivery_status,created_at,provider_message_id&agency_id=eq.${membership.agency_id}&order=created_at.desc&limit=30`).catch(() => []),
  ]);
  return <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf1] bg-white px-5 py-4 sm:px-8">
      <div><Link href="/app" className="text-sm font-bold text-[#1b3a63]">OptiFlow Recruitment</Link><h1 className="mt-1 text-xl font-bold">Communications centre</h1><p className="text-xs text-[#718096]">{agency?.name ?? "Agency workspace"}</p></div>
      <div className="flex gap-3"><Link href="/app" className="text-sm text-[#0b7886]">Workspace</Link><form action={signOutAction}><button className="text-sm text-[#52657d]">Sign out</button></form></div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      {query.sent === "1" ? <p className="mb-5 rounded-lg border border-[#cde5d6] bg-[#f1faf4] p-3 text-sm text-[#27643b]">Email accepted by Resend. Delivery confirmation may take additional time.</p> : null}
      {query.template === "1" ? <p className="mb-5 rounded-lg border border-[#cde5d6] bg-[#f1faf4] p-3 text-sm text-[#27643b]">Template saved.</p> : null}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-xl border border-[#e5ebf2] bg-white p-5 sm:p-6">
          <h2 className="font-bold text-[#1b3a63]">Send an email</h2><p className="mt-1 text-xs text-[#718096]">Send candidate, client or internal messages from your verified Resend sender address.</p>
          <form action={sendRecruitmentEmailAction} className="mt-5 grid gap-4">
            <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Audience<select name="audience" className="rounded-lg border border-[#dce4ed] p-3 text-sm"><option value="candidate">Candidate</option><option value="client">Client</option><option value="internal">Internal</option></select></label>
            <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Recipient email<input name="to" type="email" required placeholder="recipient@company.com" className="rounded-lg border border-[#dce4ed] p-3 text-sm font-normal"/></label>
            <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Use saved template (optional)<select name="template_id" className="rounded-lg border border-[#dce4ed] p-3 text-sm font-normal"><option value="">Write a new email</option>{templates.filter((t) => t.is_active).map((t) => <option key={value(t.id)} value={value(t.id)}>{value(t.name)} · {value(t.audience)}</option>)}</select></label>
            <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Subject<input name="subject" maxLength={150} placeholder="Required when no template is selected" className="rounded-lg border border-[#dce4ed] p-3 text-sm font-normal"/></label>
            <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Message<textarea name="body" rows={8} maxLength={20000} placeholder="Required when no template is selected. A selected template replaces this text." className="rounded-lg border border-[#dce4ed] p-3 text-sm font-normal"/></label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-xs text-[#52657d]">Candidate ID (optional)<input name="candidate_id" className="rounded-lg border border-[#dce4ed] p-2 text-xs"/></label>
              <label className="grid gap-1 text-xs text-[#52657d]">Client ID (optional)<input name="client_id" className="rounded-lg border border-[#dce4ed] p-2 text-xs"/></label>
              <label className="grid gap-1 text-xs text-[#52657d]">Application ID (optional)<input name="application_id" className="rounded-lg border border-[#dce4ed] p-2 text-xs"/></label>
            </div>
            <button className="w-fit rounded-lg bg-[#1b3a63] px-5 py-3 text-sm font-semibold text-white">Send email</button>
          </form>
        </section>
        <section className="rounded-xl border border-[#e5ebf2] bg-white p-5 sm:p-6">
          <h2 className="font-bold text-[#1b3a63]">Create a reusable template</h2>
          <form action={saveCommunicationTemplateAction} className="mt-4 grid gap-3">
            <input name="name" required placeholder="Template name" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/>
            <select name="audience" className="rounded-lg border border-[#dce4ed] p-3 text-sm"><option value="candidate">Candidate</option><option value="client">Client</option><option value="internal">Internal</option></select>
            <input name="subject" required placeholder="Email subject" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/>
            <textarea name="body" required rows={5} placeholder="Template message. Use plain text." className="rounded-lg border border-[#dce4ed] p-3 text-sm"/>
            <button className="w-fit rounded-lg border border-[#1b3a63] px-4 py-2.5 text-sm font-semibold text-[#1b3a63]">Save template</button>
          </form>
          <h3 className="mt-7 border-t border-[#edf1f5] pt-5 text-sm font-bold text-[#1b3a63]">Saved templates ({templates.length})</h3>
          <div className="mt-3 space-y-2">{templates.map((t) => <div key={value(t.id)} className="rounded-lg bg-[#f8fafc] p-3"><p className="text-sm font-semibold">{value(t.name)}</p><p className="mt-1 text-xs text-[#718096]">{value(t.audience)} · {value(t.subject)}</p></div>)}</div>
        </section>
      </div>
      <section className="mt-6 rounded-xl border border-[#e5ebf2] bg-white p-5 sm:p-6"><h2 className="font-bold text-[#1b3a63]">Recent email activity</h2><p className="mt-1 text-xs text-[#718096]">Accepted/sent status is recorded. Delivery webhooks are a separate configuration step.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b text-[#8391a2]"><th className="py-3">Recipient</th><th>Subject</th><th>Status</th><th>Date</th></tr></thead><tbody>{logs.map((log) => <tr key={value(log.id)} className="border-b border-[#edf1f5]"><td className="py-3">{value(log.recipient_email)}</td><td>{value(log.subject)}</td><td>{value(log.delivery_status)}</td><td>{log.created_at ? new Date(value(log.created_at)).toLocaleString("en-NG") : "—"}</td></tr>)}</tbody></table>{logs.length===0?<p className="py-6 text-sm text-[#718096]">No emails sent yet.</p>:null}</div>
      </section>
    </main>
  </div>;
}
