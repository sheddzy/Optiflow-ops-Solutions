import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { togglePortfolio } from "./actions";

export const metadata = { title: "Portfolio" };

export default async function Portfolio({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("portfolio").select("id,title,project_type,published,created_at").order("created_at", { ascending: false });
  return (
    <>
      <PageTitle title="Portfolio"><Link href="/admin/portfolio/new" className="btn btn-primary">Add project</Link></PageTitle>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Projects could not be loaded. Refresh and try again.</p>}
      {!error && (data ?? []).length === 0 ? <p className="rounded-md border border-line bg-white p-6 text-slate">No projects yet. Add one to show it on the Portfolio page. Label demonstrations and prototypes honestly.</p> : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {(data ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><Link href={`/admin/portfolio/${p.id}`} className="font-semibold text-navy underline">{p.title}</Link><p className="text-sm text-slate">{p.project_type} · {p.published ? "Published" : "Draft (hidden from the site)"}</p></div>
              <form action={togglePortfolio}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="publish" value={p.published ? "0" : "1"} />
                <button className="btn btn-ghost !py-2" type="submit">{p.published ? "Unpublish" : "Publish"}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
