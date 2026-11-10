import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { periodLabel, type Pkg } from "@/lib/packages";
import { togglePackage, updatePrice } from "./actions";

export const metadata = { title: "Packages and prices" };

export default async function Packages({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("packages").select("id,slug,name,price,period,published,buyable,sort_order").order("sort_order");
  return (
    <>
      <PageTitle title="Packages and prices"><Link href="/admin/packages/new" className="btn btn-primary">New package</Link></PageTitle>
      <p className="mb-6 max-w-2xl text-slate">Change a price here and it updates everywhere on the website and at checkout. Every change is recorded in the price history on the package's page.</p>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Packages could not be loaded. Run migration 003_cms.sql in Supabase if you have not yet.</p>}
      {!error && (data ?? []).length === 0 ? <p className="rounded-md border border-line bg-white p-6 text-slate">No packages yet.</p> : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {(data ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <Link href={`/admin/packages/${p.id}`} className="font-semibold text-navy underline">{p.name}</Link>
                <p className="text-sm text-slate">{p.published ? "Live" : "Hidden"} · {p.buyable ? "Online purchase on" : "Enquiry only"} · <Link href={`/packages/${p.slug}`} target="_blank" className="underline">/packages/{p.slug}</Link></p>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <form action={updatePrice} className="flex items-end gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <div><label htmlFor={`pr-${p.id}`} className="block text-xs font-semibold text-slate">Price (₦) {periodLabel(p.period as Pkg["period"])}</label><input id={`pr-${p.id}`} name="price" type="number" min={0} step={1} defaultValue={p.price} className="field !w-36" /></div>
                  <button className="btn btn-primary !px-4 !py-2.5" type="submit">Update price</button>
                </form>
                <form action={togglePackage}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="publish" value={p.published ? "0" : "1"} /><button className="btn btn-ghost !px-4 !py-2.5" type="submit">{p.published ? "Hide" : "Show"}</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
