import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { serializeFaq } from "@/lib/admin-format";
import { DeleteBox, Flash, PageTitle } from "@/components/admin/ui";
import { PAGE_ILLUSTRATIONS as ILLUSTRATIONS } from "@/lib/reserved";
import { deletePage, savePage } from "../actions";

export const metadata = { title: "Edit page" };
const lab = "mb-1.5 block text-sm font-semibold";

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let r: Record<string, any> = { slug: "", title: "", seo_title: "", seo_description: "", hero_title: "", hero_text: "", cta_label: "", cta_href: "", illustration: "about", body_md: "", faq: [], show_in_footer: false, published: false };
  if (!isNew) {
    if (!z.string().uuid().safeParse(id).success) notFound();
    const { data } = await supabase.from("pages").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    r = data;
  }
  return (
    <>
      <Link href="/admin/pages" className="text-sm font-semibold text-teal-text underline">Back to pages</Link>
      <div className="mt-3"><PageTitle title={isNew ? "New page" : "Edit page"} /></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={savePage} className="max-w-3xl space-y-5">
        {!isNew && <input type="hidden" name="id" value={r.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="title" className={lab}>Page title</label><input id="title" name="title" required defaultValue={r.title} className="field" /></div>
          <div><label htmlFor="slug" className={lab}>Web address (slug)</label><input id="slug" name="slug" defaultValue={r.slug} placeholder="Leave empty to create from the title" className="field" /><p className="mt-1 text-xs text-slate">The page will be at /this-address</p></div>
        </div>
        <div><label htmlFor="hero_title" className={lab}>Big heading (optional, defaults to the title)</label><input id="hero_title" name="hero_title" defaultValue={r.hero_title} className="field" /></div>
        <div><label htmlFor="hero_text" className={lab}>Introduction under the heading</label><textarea id="hero_text" name="hero_text" rows={3} defaultValue={r.hero_text} className="field" /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="cta_label" className={lab}>Button text (optional)</label><input id="cta_label" name="cta_label" defaultValue={r.cta_label} className="field" /></div>
          <div><label htmlFor="cta_href" className={lab}>Button link</label><input id="cta_href" name="cta_href" defaultValue={r.cta_href} placeholder="/contact" className="field" /></div>
        </div>
        <div><label htmlFor="illustration" className={lab}>Picture beside the heading</label><select id="illustration" name="illustration" defaultValue={r.illustration} className="field">{ILLUSTRATIONS.map((i) => <option key={i} value={i}>{i}</option>)}</select></div>
        <div>
          <label htmlFor="body_md" className={lab}>Page content</label>
          <textarea id="body_md" name="body_md" rows={16} defaultValue={r.body_md} className="field font-mono text-sm" />
          <p className="mt-1 text-xs text-slate">Formatting: ## Heading, ### Smaller heading, **bold**, *italic*, [link text](https://example.com), - list item, 1. numbered item, &gt; quote, ![description](image link). Upload images in Media and paste their link. HTML is not allowed.</p>
        </div>
        <div><label htmlFor="faq" className={lab}>Questions and answers (optional, one per line: Question | Answer)</label><textarea id="faq" name="faq" rows={5} defaultValue={serializeFaq(r.faq ?? [])} className="field" /></div>
        <fieldset className="rounded-md border border-line bg-white p-5">
          <legend className="px-2 text-sm font-semibold">Search results</legend>
          <div className="space-y-4">
            <div><label htmlFor="seo_title" className={lab}>Search title (under 70 characters)</label><input id="seo_title" name="seo_title" defaultValue={r.seo_title} className="field" /></div>
            <div><label htmlFor="seo_description" className={lab}>Search description (under 170 characters)</label><textarea id="seo_description" name="seo_description" rows={2} defaultValue={r.seo_description} className="field" /></div>
          </div>
        </fieldset>
        <label className="flex items-center gap-3"><input type="checkbox" name="show_in_footer" defaultChecked={r.show_in_footer} className="h-4 w-4 accent-navy" /><span>Show a link in the website footer</span></label>
        <label className="flex items-center gap-3"><input type="checkbox" name="published" defaultChecked={r.published} className="h-4 w-4 accent-navy" /><span>Live (visible on the website)</span></label>
        <button className="btn btn-primary" type="submit">Save page</button>
      </form>
      {!isNew && <DeleteBox id={r.id} action={deletePage} label="Delete this page" warning="The page is removed from the website. This cannot be undone." />}
    </>
  );
}
