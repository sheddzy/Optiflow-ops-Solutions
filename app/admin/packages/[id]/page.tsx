import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { fmtDate, requireAdmin } from "@/lib/admin";
import { serializeFaq, serializeInclusions } from "@/lib/admin-format";
import { DeleteBox, Flash, PageTitle } from "@/components/admin/ui";
import { naira } from "@/lib/packages";
import { deletePackage, savePackage } from "../actions";

export const metadata = { title: "Edit package" };
const lab = "mb-1.5 block text-sm font-semibold";

export default async function EditPackage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let r: Record<string, any> = { slug: "", name: "", tag: "", summary: "", overview: [], price: 0, period: "year", billing_note: "Billed annually, paid upfront for 12 months", who_for_lead: "", who_for: [], inclusions_heading: "What is included", includes_all_of: null, inclusions: [], not_included: [], you_provide: [], faq: [], published: false, buyable: true, sort_order: 10 };
  let history: { old_price: number; new_price: number; changed_at: string }[] = [];
  const others = (await supabase.from("packages").select("slug,name").order("sort_order")).data ?? [];
  if (!isNew) {
    if (!z.string().uuid().safeParse(id).success) notFound();
    const { data } = await supabase.from("packages").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    r = data;
    history = (await supabase.from("price_history").select("old_price,new_price,changed_at").eq("package_id", id).order("changed_at", { ascending: false }).limit(20)).data ?? [];
  }
  return (
    <>
      <Link href="/admin/packages" className="text-sm font-semibold text-teal-text underline">Back to packages</Link>
      <div className="mt-3"><PageTitle title={isNew ? "New package" : `Edit ${r.name}`} /></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={savePackage} className="max-w-3xl space-y-5">
        {!isNew && <input type="hidden" name="id" value={r.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="name" className={lab}>Package name</label><input id="name" name="name" required defaultValue={r.name} className="field" /></div>
          <div><label htmlFor="slug" className={lab}>Web address (slug)</label><input id="slug" name="slug" defaultValue={r.slug} placeholder="Leave empty to create from the name" className="field" /></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div><label htmlFor="price" className={lab}>Price (₦, whole naira)</label><input id="price" name="price" type="number" min={0} step={1} required defaultValue={r.price} className="field" /></div>
          <div><label htmlFor="period" className={lab}>Billing period</label><select id="period" name="period" defaultValue={r.period} className="field"><option value="year">Per year</option><option value="month">Per month</option><option value="once">One-off</option></select></div>
          <div><label htmlFor="sort_order" className={lab}>Display order</label><input id="sort_order" name="sort_order" type="number" min={0} max={999} defaultValue={r.sort_order} className="field" /></div>
        </div>
        <div><label htmlFor="billing_note" className={lab}>Billing note (shown under the price)</label><input id="billing_note" name="billing_note" defaultValue={r.billing_note} className="field" /></div>
        <div><label htmlFor="tag" className={lab}>Short label (above the name)</label><input id="tag" name="tag" defaultValue={r.tag} className="field" /></div>
        <div><label htmlFor="summary" className={lab}>Summary (one or two sentences)</label><textarea id="summary" name="summary" rows={2} defaultValue={r.summary} className="field" /></div>
        <div><label htmlFor="overview" className={lab}>Overview (separate paragraphs with a blank line)</label><textarea id="overview" name="overview" rows={6} defaultValue={(r.overview ?? []).join("\n\n")} className="field" /></div>
        <div><label htmlFor="who_for_lead" className={lab}>Who it is for: introduction</label><input id="who_for_lead" name="who_for_lead" defaultValue={r.who_for_lead} className="field" /></div>
        <div><label htmlFor="who_for" className={lab}>Who it is for: list (one per line)</label><textarea id="who_for" name="who_for" rows={5} defaultValue={(r.who_for ?? []).join("\n")} className="field" /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="inclusions_heading" className={lab}>Heading above the included items</label><input id="inclusions_heading" name="inclusions_heading" defaultValue={r.inclusions_heading} className="field" /></div>
          <div><label htmlFor="includes_all_of" className={lab}>Also includes everything in</label>
            <select id="includes_all_of" name="includes_all_of" defaultValue={r.includes_all_of ?? ""} className="field"><option value="">Nothing (stands alone)</option>{others.filter((o) => o.slug !== r.slug).map((o) => <option key={o.slug} value={o.slug}>{o.name}</option>)}</select></div>
        </div>
        <div><label htmlFor="inclusions" className={lab}>What is included (one per line: Name | Description | Short label for the comparison table, optional)</label><textarea id="inclusions" name="inclusions" rows={10} defaultValue={serializeInclusions(r.inclusions ?? [])} className="field font-mono text-sm" /></div>
        <div><label htmlFor="not_included" className={lab}>What is not included (one per line)</label><textarea id="not_included" name="not_included" rows={6} defaultValue={(r.not_included ?? []).join("\n")} className="field" /></div>
        <div><label htmlFor="you_provide" className={lab}>What we will ask the customer for (one per line)</label><textarea id="you_provide" name="you_provide" rows={5} defaultValue={(r.you_provide ?? []).join("\n")} className="field" /></div>
        <div><label htmlFor="faq" className={lab}>Questions and answers (one per line: Question | Answer)</label><textarea id="faq" name="faq" rows={6} defaultValue={serializeFaq(r.faq ?? [])} className="field" /></div>
        <label className="flex items-center gap-3"><input type="checkbox" name="published" defaultChecked={r.published} className="h-4 w-4 accent-navy" /><span>Live (visible on the website)</span></label>
        <label className="flex items-center gap-3"><input type="checkbox" name="buyable" defaultChecked={r.buyable} className="h-4 w-4 accent-navy" /><span>Allow online purchase with Paystack (off means enquiry only)</span></label>
        <p className="text-sm text-slate">Customers already at Paystack's payment page are charged the price they were shown, even if you change the price while they pay.</p>
        <button className="btn btn-primary" type="submit">Save package</button>
      </form>

      {!isNew && (
        <section className="mt-12 max-w-3xl" aria-labelledby="hist-h">
          <h2 id="hist-h" className="text-xl font-semibold">Price history</h2>
          {history.length === 0 ? <p className="mt-3 text-slate">No price changes recorded yet.</p> : (
            <ul className="mt-3 divide-y divide-line rounded-md border border-line bg-white">{history.map((h, i) => <li key={i} className="flex flex-wrap justify-between gap-2 p-3 text-sm"><span>{naira(h.old_price)} to <strong>{naira(h.new_price)}</strong></span><span className="text-slate">{fmtDate(h.changed_at)}</span></li>)}</ul>
          )}
        </section>
      )}
      {!isNew && <DeleteBox id={r.id} action={deletePackage} label="Delete this package" warning="The package page is removed from the website. Payments already made are not affected, and stay in Paystack. This cannot be undone." />}
    </>
  );
}
