import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { isoToLagos, serializeFaq } from "@/lib/admin-format";
import { DeleteBox, Flash, PageTitle } from "@/components/admin/ui";
import { DEFAULT_PROMO } from "@/lib/promo-default";
import { deletePromotion, savePromotion } from "../actions";

export const metadata = { title: "Edit promotion" };
const lab = "mb-1.5 block text-sm font-semibold";

export default async function EditPromotion({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  const d = DEFAULT_PROMO;
  let r: Record<string, any> = { slug: "", title: "", badge: "", subtitle: "", intro: [], eligibility: "", inclusions: [], conditions: "", faq: [], cta_label: "Get Started", ask_domain: true, banner_text: "", starts_at: null, ends_at: null, slot_limit: null, published: false };
  if (!isNew) {
    if (!z.string().uuid().safeParse(id).success) notFound();
    const { data } = await supabase.from("promotions").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    r = data;
  }
  return (
    <>
      <Link href="/admin/promotions" className="text-sm font-semibold text-teal-text underline">Back to promotions</Link>
      <div className="mt-3"><PageTitle title={isNew ? "New promotion" : "Edit promotion"} /></div>
      <Flash ok={sp.ok} err={sp.err} />
      {isNew && <p className="mb-6 max-w-2xl rounded-md bg-mist/60 p-4 text-sm">Tip: to start from the free email setup offer, copy the wording from an existing promotion, or save this one and edit it.</p>}
      <form action={savePromotion} className="max-w-3xl space-y-5">
        {!isNew && <input type="hidden" name="id" value={r.id} />}
        <div><label htmlFor="title" className={lab}>Title (the page heading)</label><input id="title" name="title" required defaultValue={r.title} placeholder={d.title} className="field" /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="slug" className={lab}>Web address (slug)</label><input id="slug" name="slug" defaultValue={r.slug} placeholder="Leave empty to create from the title" className="field" /><p className="mt-1 text-xs text-slate">The page will be at /offers/this-address</p></div>
          <div><label htmlFor="badge" className={lab}>Badge (big highlight)</label><input id="badge" name="badge" defaultValue={r.badge} placeholder={d.badge} className="field" /></div>
        </div>
        <div><label htmlFor="subtitle" className={lab}>Tagline</label><input id="subtitle" name="subtitle" defaultValue={r.subtitle} placeholder={d.subtitle} className="field" /></div>
        <div><label htmlFor="intro" className={lab}>Introduction (separate paragraphs with a blank line)</label><textarea id="intro" name="intro" rows={5} defaultValue={(r.intro ?? []).join("\n\n")} className="field" /></div>
        <div><label htmlFor="inclusions" className={lab}>What is included (one per line)</label><textarea id="inclusions" name="inclusions" rows={6} defaultValue={(r.inclusions ?? []).join("\n")} className="field" /></div>
        <div><label htmlFor="eligibility" className={lab}>Who is eligible (shown in a highlighted box)</label><input id="eligibility" name="eligibility" defaultValue={r.eligibility} className="field" /></div>
        <div><label htmlFor="conditions" className={lab}>Conditions (shown near the top, never hide these)</label><textarea id="conditions" name="conditions" rows={2} defaultValue={r.conditions} className="field" /></div>
        <div><label htmlFor="faq" className={lab}>Questions and answers (one per line: Question | Answer)</label><textarea id="faq" name="faq" rows={8} defaultValue={serializeFaq(r.faq ?? [])} className="field" /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="cta_label" className={lab}>Button text</label><input id="cta_label" name="cta_label" required defaultValue={r.cta_label} className="field" /></div>
          <div><label htmlFor="banner_text" className={lab}>Site-wide banner text (optional)</label><input id="banner_text" name="banner_text" defaultValue={r.banner_text} placeholder="Shown at the top of every page while live" className="field" /></div>
        </div>
        <fieldset className="rounded-md border border-line bg-white p-5">
          <legend className="px-2 text-sm font-semibold">Timing and limits (all optional, times are Lagos time)</legend>
          <div className="grid gap-5 sm:grid-cols-3">
            <div><label htmlFor="starts_at" className={lab}>Starts</label><input id="starts_at" name="starts_at" type="datetime-local" defaultValue={isoToLagos(r.starts_at)} className="field" /></div>
            <div><label htmlFor="ends_at" className={lab}>Ends</label><input id="ends_at" name="ends_at" type="datetime-local" defaultValue={isoToLagos(r.ends_at)} className="field" /></div>
            <div><label htmlFor="slot_limit" className={lab}>Number of places</label><input id="slot_limit" name="slot_limit" type="number" min={1} defaultValue={r.slot_limit ?? ""} placeholder="No limit" className="field" /></div>
          </div>
          <p className="mt-3 text-xs text-slate">Only set a deadline or a limit if it is real. The page and the database both stop accepting claims when time or places run out.</p>
        </fieldset>
        <label className="flex items-center gap-3"><input type="checkbox" name="ask_domain" defaultChecked={r.ask_domain} className="h-4 w-4 accent-navy" /><span>Ask the visitor for their domain name</span></label>
        <label className="flex items-center gap-3"><input type="checkbox" name="published" defaultChecked={r.published} className="h-4 w-4 accent-navy" /><span>Live (visible on the website)</span></label>
        <button className="btn btn-primary" type="submit">Save promotion</button>
      </form>
      {!isNew && <DeleteBox id={r.id} action={deletePromotion} label="Delete this promotion" warning="The landing page is removed. Claims already received stay in Enquiries. This cannot be undone." />}
    </>
  );
}
