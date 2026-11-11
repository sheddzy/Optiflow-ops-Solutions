import Link from "next/link";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getAgency, getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { signOutAction } from "../actions";
import { queueVacancyForBoardsAction, updatePublicationAction } from "./actions";

export const dynamic = "force-dynamic";
type Row = Record<string, unknown>;
const val = (v: unknown) => v == null ? "" : String(v);
const boardName = (v: string) => ({ linkedin: "LinkedIn", indeed: "Indeed", jobberman: "Jobberman", other: "Other board" }[v] ?? v);

export default async function JobBoardsPage({ searchParams }: { searchParams: Promise<{ queued?: string; saved?: string }> }) {
  const [{ data: session }, query] = await Promise.all([neonAuth.getSession(), searchParams]);
  if (!session?.user) redirect("/auth/sign-in");
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const [agency, roles, publications] = await Promise.all([
    getAgency(membership.agency_id),
    recruitmentData<Row[]>(`roles?select=id,job_title,description,requirements,responsibilities,location,employment_type,workplace_type,salary_min,salary_max,salary_currency,status,application_deadline&agency_id=eq.${membership.agency_id}&status=eq.open&order=created_at.desc&limit=200`).catch(() => []),
    recruitmentData<Row[]>(`job_board_publications?select=id,role_id,provider,publication_status,public_url,published_at,last_error,created_at&agency_id=eq.${membership.agency_id}&order=created_at.desc&limit=100`).catch(() => []),
  ]);
  const roleById = new Map(roles.map((r) => [val(r.id), r]));
  return <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf1] bg-white px-5 py-4 sm:px-8"><div><Link href="/app" className="text-sm font-bold text-[#1b3a63]">OptiFlow Recruitment</Link><h1 className="mt-1 text-xl font-bold">Job-board publishing</h1><p className="text-xs text-[#718096]">{agency?.name ?? "Agency workspace"}</p></div><div className="flex gap-3"><Link href="/app" className="text-sm text-[#0b7886]">Workspace</Link><form action={signOutAction}><button className="text-sm text-[#52657d]">Sign out</button></form></div></header>
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      {query.queued?<p className="mb-5 rounded-lg border border-[#cde5d6] bg-[#f1faf4] p-3 text-sm text-[#27643b]">Vacancy publication tasks queued. Open each board and complete the posting, then record its live URL below.</p>:null}
      {query.saved?<p className="mb-5 rounded-lg border border-[#cde5d6] bg-[#f1faf4] p-3 text-sm text-[#27643b]">Publication record updated.</p>:null}
      <div className="rounded-xl border border-[#e5ebf2] bg-white p-5 sm:p-6"><h2 className="font-bold text-[#1b3a63]">Publish an open vacancy</h2><p className="mt-1 text-xs leading-5 text-[#718096]">Select one vacancy and queue it for multiple boards in one step. The current release tracks and prepares postings; direct posting APIs require approved partner access and board credentials.</p>
        <form action={queueVacancyForBoardsAction} className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Open vacancy<select name="role_id" required className="rounded-lg border border-[#dce4ed] p-3 text-sm"><option value="">Select vacancy</option>{roles.map((r)=><option key={val(r.id)} value={val(r.id)}>{val(r.job_title)}</option>)}</select></label>
          <fieldset className="grid grid-cols-2 gap-3 text-xs text-[#52657d]"><legend className="mb-2 font-semibold">Job boards</legend>{["linkedin","indeed","jobberman","other"].map((p)=><label key={p} className="flex items-center gap-2"><input type="checkbox" name="providers" value={p}/>{boardName(p)}</label>)}</fieldset>
          <button className="rounded-lg bg-[#1b3a63] px-5 py-3 text-sm font-semibold text-white">Queue selected boards</button>
        </form>
      </div>
      <section className="mt-6 rounded-xl border border-[#e5ebf2] bg-white p-5 sm:p-6"><h2 className="font-bold text-[#1b3a63]">Publication tracker</h2><p className="mt-1 text-xs text-[#718096]">Update each record after publishing on the external board.</p>
        <div className="mt-4 space-y-3">{publications.map((p)=><div key={val(p.id)} className="grid gap-3 rounded-lg border border-[#edf1f5] p-4 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-center"><div><p className="text-sm font-semibold text-[#1b3a63]">{boardName(val(p.provider))}</p><p className="text-xs text-[#718096]">{val(roleById.get(val(p.role_id))?.job_title) || "Vacancy"}</p></div><span className="text-xs font-semibold text-[#52657d]">{val(p.publication_status)}</span>{p.public_url?<a className="truncate text-xs text-[#0b7886] underline" href={val(p.public_url)} target="_blank" rel="noreferrer">{val(p.public_url)}</a>:<span className="text-xs text-[#98a4b3]">No live URL recorded</span>}
          <form action={updatePublicationAction} className="flex flex-wrap gap-2"><input type="hidden" name="id" value={val(p.id)}/><input name="public_url" defaultValue={val(p.public_url)} placeholder="https://board.com/job/..." className="min-w-36 rounded border border-[#dce4ed] px-2 py-1.5 text-xs"/><select name="status" defaultValue={val(p.publication_status)==="queued"?"published":val(p.publication_status)} className="rounded border border-[#dce4ed] px-2 py-1.5 text-xs"><option value="published">Published</option><option value="paused">Paused</option><option value="expired">Expired</option><option value="failed">Failed</option></select><button className="rounded bg-[#edf4fb] px-3 py-1.5 text-xs font-semibold text-[#1b3a63]">Save</button></form>
        </div>)}
        {publications.length===0?<p className="py-8 text-sm text-[#718096]">No publication tasks yet.</p>:null}</div>
      </section>
      <section className="mt-6 rounded-xl border border-[#e5ebf2] bg-white p-5 sm:p-6"><h2 className="font-bold text-[#1b3a63]">Board integration status</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["linkedin","indeed","jobberman","other"].map((p)=><div key={p} className="rounded-lg bg-[#f8fafc] p-4"><p className="text-sm font-semibold">{boardName(p)}</p><p className="mt-1 text-xs text-[#718096]">Posting API / partner access not configured</p></div>)}</div><p className="mt-4 text-xs leading-5 text-[#718096]">Google for Jobs is not a job board posting API. It indexes eligible public job pages using JobPosting structured data; it will require public vacancy pages and crawlable structured data rather than a “publish to Google” API call.</p></section>
    </main>
  </div>;
}
