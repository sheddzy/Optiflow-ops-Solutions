import Link from "next/link";
import { requireAdmin, STATUSES, fmtDate } from "@/lib/admin";
import { Flash, PageTitle, StatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Enquiries" };
const PAGE = 25;

export default async function Enquiries({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const sort = sp.sort === "old" ? "old" : "new";
  const q = (sp.q ?? "").replace(/[%,()*\\"'_]/g, " ").trim().slice(0, 80);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const promo = /^[0-9a-f-]{36}$/i.test(sp.promo ?? "") ? sp.promo! : "";

  let query = supabase.from("enquiries")
    .select("id,name,email,company,service_interest,status,created_at,promotion_id,domain", { count: "exact" })
    .order("created_at", { ascending: sort === "old" })
    .range((page - 1) * PAGE, page * PAGE - 1);
  if (status) query = query.eq("status", status);
  if (promo) query = query.eq("promotion_id", promo);
  if (q) query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,message.ilike.%${q}%`);
  const { data, count, error } = await query;

  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE));
  const link = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q); if (promo) u.set("promo", promo); if (status) u.set("status", status); if (sort === "old") u.set("sort", "old"); u.set("page", String(p));
    return `/admin/enquiries?${u}`;
  };

  return (
    <>
      <PageTitle title="Enquiries" />
      <Flash ok={sp.ok} err={sp.err} />
      {promo && <p className="mb-4 rounded-md bg-mist/60 p-3 text-sm">Showing claims for one promotion. <Link href="/admin/enquiries" className="font-semibold text-teal-text underline">Show all enquiries</Link></p>}
      <form className="mb-6 grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]" role="search">
        <div><label htmlFor="q" className="sr-only">Search</label><input id="q" name="q" defaultValue={q} placeholder="Search name, email, company or message" className="field" /></div>
        <div><label htmlFor="status" className="sr-only">Status</label>
          <select id="status" name="status" defaultValue={status ?? ""} className="field"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div><label htmlFor="sort" className="sr-only">Sort</label>
          <select id="sort" name="sort" defaultValue={sort} className="field"><option value="new">Newest first</option><option value="old">Oldest first</option></select></div>
        <button className="btn btn-primary" type="submit">Apply</button>
      </form>

      {error && <p role="alert" className="mb-6 text-[#b42318]">Enquiries could not be loaded. Refresh and try again.</p>}
      {!error && (data ?? []).length === 0 ? (
        <p className="rounded-md border border-line bg-white p-6 text-slate">{q || status ? "No enquiries match these filters." : "No enquiries yet. They appear here when someone uses the contact form."}</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-line bg-white">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-line bg-mist/60 text-sm"><tr><th className="p-3">Name</th><th className="p-3">Service</th><th className="p-3">Received</th><th className="p-3">Status</th></tr></thead>
            <tbody className="divide-y divide-line">
              {(data ?? []).map((e) => (
                <tr key={e.id} className="hover:bg-mist/40">
                  <td className="p-3"><Link href={`/admin/enquiries/${e.id}`} className="font-semibold text-navy underline">{e.name}</Link><br /><span className="text-sm text-slate">{e.company ? `${e.company} · ` : ""}{e.email}</span></td>
                  <td className="p-3 text-sm">{e.service_interest}{e.domain && <><br /><span className="text-slate">Domain: {e.domain}</span></>}</td>
                  <td className="whitespace-nowrap p-3 text-sm">{fmtDate(e.created_at)}</td>
                  <td className="p-3"><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <nav aria-label="Pages" className="mt-6 flex items-center gap-4">
          {page > 1 && <Link href={link(page - 1)} className="btn btn-ghost !py-2">Previous</Link>}
          <span className="text-sm text-slate">Page {page} of {pages} ({count} enquiries)</span>
          {page < pages && <Link href={link(page + 1)} className="btn btn-ghost !py-2">Next</Link>}
        </nav>
      )}
    </>
  );
}
