import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin, STATUSES, fmtDate } from "@/lib/admin";
import { DeleteBox, Flash, PageTitle, StatusBadge } from "@/components/admin/ui";
import { deleteEnquiry, updateEnquiry } from "../actions";

export const metadata = { title: "Enquiry" };

export default async function EnquiryDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const { data: e } = await supabase.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();

  const rows: [string, string][] = [["Email", e.email], ["Company", e.company || "Not given"], ["Phone", e.phone || "Not given"], ["Service or offer", e.service_interest || "Not given"], ...(e.domain ? ([["Domain", e.domain]] as [string, string][]) : []), ["Received", fmtDate(e.created_at)], ["Last updated", fmtDate(e.updated_at)]];

  return (
    <>
      <Link href="/admin/enquiries" className="text-sm font-semibold text-teal-text underline">Back to enquiries</Link>
      <div className="mt-3"><PageTitle title={e.name}><StatusBadge status={e.status} /></PageTitle></div>
      <Flash ok={sp.ok} err={sp.err} />
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="msg-h">
          <h2 id="msg-h" className="text-xl font-semibold">Message</h2>
          <p className="mt-3 whitespace-pre-wrap rounded-md border border-line bg-white p-5">{e.message}</p>
          <dl className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map(([k, v]) => <div key={k}><dt className="text-sm text-slate">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}
          </dl>
          <a href={`mailto:${e.email}?subject=${encodeURIComponent("Your enquiry to OptiFlow Ops Solutions")}`} className="btn btn-ghost mt-6">Reply by email</a>
        </section>

        <section aria-labelledby="manage-h">
          <h2 id="manage-h" className="text-xl font-semibold">Manage lead</h2>
          <form action={updateEnquiry} className="mt-3 space-y-4">
            <input type="hidden" name="id" value={e.id} />
            <div><label htmlFor="status" className="mb-1.5 block text-sm font-semibold">Status</label>
              <select id="status" name="status" defaultValue={e.status} className="field">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label htmlFor="notes" className="mb-1.5 block text-sm font-semibold">Internal notes (never shown publicly)</label>
              <textarea id="notes" name="internal_notes" rows={8} defaultValue={e.internal_notes ?? ""} className="field" /></div>
            <button className="btn btn-primary" type="submit">Save changes</button>
          </form>
        </section>
      </div>
      <DeleteBox id={e.id} action={deleteEnquiry} label="Delete this enquiry" warning="This removes the enquiry and your notes for good. It cannot be undone." />
    </>
  );
}
