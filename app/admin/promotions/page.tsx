import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { promoState } from "@/lib/cms";
import { togglePromotion } from "./actions";

export const metadata = { title: "Promotions" };

export default async function Promotions({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false });
  const rows = await Promise.all((data ?? []).map(async (r) => {
    const c = await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("promotion_id", r.id);
    const claimed = c.count ?? 0;
    const st = promoState({ startsAt: r.starts_at, endsAt: r.ends_at, slotLimit: r.slot_limit } as never, claimed);
    const label = !r.published ? "Off (draft)" : st.state === "open" ? "Live" : st.state === "upcoming" ? "Scheduled" : st.state === "ended" ? "Ended" : "Full";
    return { ...r, claimed, label };
  }));
  return (
    <>
      <PageTitle title="Promotions"><Link href="/admin/promotions/new" className="btn btn-primary">New promotion</Link></PageTitle>
      <p className="mb-6 max-w-2xl text-slate">Each promotion gets its own landing page at /offers/your-address, a claim form, and an optional banner across the site. Claims arrive in Enquiries.</p>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Promotions could not be loaded. Run migration 003_cms.sql in Supabase if you have not yet.</p>}
      {!error && rows.length === 0 ? <p className="rounded-md border border-line bg-white p-6 text-slate">No promotions yet.</p> : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link href={`/admin/promotions/${r.id}`} className="font-semibold text-navy underline">{r.title}</Link>
                <p className="text-sm text-slate"><span className="font-semibold">{r.label}</span> · {r.claimed} claim{r.claimed === 1 ? "" : "s"}{r.slot_limit ? ` of ${r.slot_limit} places` : ""} · <Link href={`/offers/${r.slug}`} target="_blank" className="underline">/offers/{r.slug}</Link></p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/enquiries?promo=${r.id}`} className="btn btn-ghost !px-4 !py-2">View claims</Link>
                <form action={togglePromotion}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="publish" value={r.published ? "0" : "1"} /><button className="btn btn-ghost !px-4 !py-2" type="submit">{r.published ? "Switch off" : "Switch on"}</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
