import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { isoToLagos } from "@/lib/admin-format";
import { DeleteBox, Flash, PageTitle } from "@/components/admin/ui";
import { ArticleBodyEditor } from "@/components/admin/ArticleBodyEditor";
import { deletePost, savePost } from "../actions";

export const metadata = { title: "Edit article" };
const lab = "mb-1.5 block text-sm font-semibold";

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let r: Record<string, any> = { slug: "", title: "", excerpt: "", body_md: "", cover_url: null, category: "", tags: [], author: "OptiFlow Team", seo_title: "", seo_description: "", published: false, published_at: null };
  if (!isNew) {
    if (!z.string().uuid().safeParse(id).success) notFound();
    const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    r = data;
  }
  return (
    <>
      <Link href="/admin/blog" className="text-sm font-semibold text-teal-text underline">Back to blog</Link>
      <div className="mt-3"><PageTitle title={isNew ? "New article" : "Edit article"} /></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={savePost} className="max-w-3xl space-y-5">
        {!isNew && <input type="hidden" name="id" value={r.id} />}
        <div><label htmlFor="title" className={lab}>Title</label><input id="title" name="title" required defaultValue={r.title} className="field" /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="slug" className={lab}>Web address (slug)</label><input id="slug" name="slug" defaultValue={r.slug} placeholder="Leave empty to create from the title" className="field" /><p className="mt-1 text-xs text-slate">The article will be at /blog/this-address</p></div>
          <div><label htmlFor="category" className={lab}>Category</label><input id="category" name="category" defaultValue={r.category} className="field" /></div>
        </div>
        <div><label htmlFor="excerpt" className={lab}>Short summary (shown on the blog list and in search results)</label><textarea id="excerpt" name="excerpt" rows={3} defaultValue={r.excerpt} className="field" /></div>
        <div>
          <label htmlFor="body_md" className={lab}>Article</label>
          <ArticleBodyEditor initialValue={r.body_md ?? ""} />
          <p className="mt-1 text-xs text-slate">Formatting: ## Heading, ### Smaller heading, **bold**, *italic*, [link text](https://example.com), - list item, 1. numbered item, &gt; quote, ![description](image link). You can also place your cursor anywhere and use Add image at cursor. HTML is not allowed.</p>
        </div>
        <div>
          <label htmlFor="cover" className={lab}>Cover image (JPG, PNG or WebP, up to 4 MB)</label>
          {r.cover_url && (<div className="mb-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={r.cover_url} alt="Current cover" className="max-h-40 rounded border border-line" /><label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="remove_cover" className="accent-navy" />Remove this image</label></div>)}
          <input id="cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="field" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="author" className={lab}>Author</label><input id="author" name="author" required defaultValue={r.author} className="field" /></div>
          <div><label htmlFor="tags" className={lab}>Tags (separate with commas)</label><input id="tags" name="tags" defaultValue={(r.tags ?? []).join(", ")} className="field" /></div>
        </div>
        <fieldset className="rounded-md border border-line bg-white p-5">
          <legend className="px-2 text-sm font-semibold">Search results</legend>
          <div className="space-y-4">
            <div><label htmlFor="seo_title" className={lab}>Search title (under 70 characters)</label><input id="seo_title" name="seo_title" defaultValue={r.seo_title} className="field" /></div>
            <div><label htmlFor="seo_description" className={lab}>Search description (under 170 characters)</label><textarea id="seo_description" name="seo_description" rows={2} defaultValue={r.seo_description} className="field" /></div>
          </div>
        </fieldset>
        <fieldset className="rounded-md border border-line bg-white p-5">
          <legend className="px-2 text-sm font-semibold">Publishing</legend>
          <label className="flex items-center gap-3"><input type="checkbox" name="published" defaultChecked={r.published} className="h-4 w-4 accent-navy" /><span>Publish this article</span></label>
          <div className="mt-4 max-w-xs"><label htmlFor="published_at" className={lab}>Publish date and time (Lagos time)</label><input id="published_at" name="published_at" type="datetime-local" defaultValue={isoToLagos(r.published_at)} className="field" /><p className="mt-1 text-xs text-slate">Leave empty to publish now. A future date schedules the article, and it appears on that date.</p></div>
        </fieldset>
        <button className="btn btn-primary" type="submit">Save article</button>
      </form>
      {!isNew && <DeleteBox id={r.id} action={deletePost} label="Delete this article" warning="The article and its cover image are removed for good. This cannot be undone." />}
    </>
  );
}
