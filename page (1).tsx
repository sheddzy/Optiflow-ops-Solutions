import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { toggleService } from "./actions";

export const metadata = { title: "Services" };

export default async function Services({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("services").select("id,title,category,published,sort_order").order("sort_order");
  return (
    <>
      <PageTitle title="Services"><Link href="/admin/services/new" className="btn btn-primary">Add service</Link></PageTitle>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Services could not be loaded. Refresh and try again.</p>}
      {!error && (data ?? []).length === 0 ? <p className="rounded-md border border-line bg-white p-6 text-slate">No services yet. Add your first service.</p> : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {(data ?? []).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><Link href={`/admin/services/${s.id}`} className="font-semibold text-navy underline">{s.title}</Link><p className="text-sm text-slate">{s.category || "No category"} · {s.published ? "Published" : "Draft (hidden from the site)"}</p></div>
              <form action={toggleService}>
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="publish" value={s.published ? "0" : "1"} />
                <button className="btn btn-ghost !py-2" type="submit">{s.published ? "Unpublish" : "Publish"}</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
