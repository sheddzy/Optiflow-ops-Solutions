import Link from "next/link";
import { fmtDate, requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";

export const metadata = { title: "Blog" };

export default async function Blog({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("posts").select("id,slug,title,published,published_at,category").order("created_at", { ascending: false });
  const now = Date.now();
  return (
    <>
      <PageTitle title="Blog"><Link href="/admin/blog/new" className="btn btn-primary">New article</Link></PageTitle>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Articles could not be loaded. Run migration 003_cms.sql in Supabase if you have not yet.</p>}
      {!error && (data ?? []).length === 0 ? <p className="rounded-md border border-line bg-white p-6 text-slate">No articles yet. The Blog link appears on the website once the first article is live.</p> : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {(data ?? []).map((p) => {
            const scheduled = p.published && p.published_at && new Date(p.published_at).getTime() > now;
            const status = !p.published ? "Draft" : scheduled ? `Scheduled for ${fmtDate(p.published_at)}` : `Live since ${fmtDate(p.published_at)}`;
            return (<li key={p.id} className="p-4"><Link href={`/admin/blog/${p.id}`} className="font-semibold text-navy underline">{p.title}</Link><p className="text-sm text-slate">{status}{p.category ? ` · ${p.category}` : ""}{p.published && !scheduled ? <> · <Link href={`/blog/${p.slug}`} target="_blank" className="underline">View</Link></> : null}</p></li>);
          })}
        </ul>
      )}
    </>
  );
}
