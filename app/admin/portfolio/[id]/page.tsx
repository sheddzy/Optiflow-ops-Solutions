import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PROJECT_TYPES, requireAdmin } from "@/lib/admin";
import { DeleteBox, Flash, PageTitle } from "@/components/admin/ui";
import { deletePortfolio, savePortfolio } from "../actions";

export const metadata = { title: "Edit project" };

export default async function EditProject({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let p: Record<string, any> = { title: "", slug: "", description: "", project_type: "Demonstration", technologies: [], image_url: null, published: false };
  if (!isNew) {
    if (!z.string().uuid().safeParse(id).success) notFound();
    const { data } = await supabase.from("portfolio").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    p = data;
  }
  return (
    <>
      <Link href="/admin/portfolio" className="text-sm font-semibold text-teal-text underline">Back to portfolio</Link>
      <div className="mt-3"><PageTitle title={isNew ? "Add project" : "Edit project"} /></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={savePortfolio} className="max-w-2xl space-y-5">
        {!isNew && <input type="hidden" name="id" value={p.id} />}
        <div><label htmlFor="title" className="mb-1.5 block text-sm font-semibold">Title</label><input id="title" name="title" required defaultValue={p.title} className="field" /></div>
        <div><label htmlFor="slug" className="mb-1.5 block text-sm font-semibold">Web address (slug)</label><input id="slug" name="slug" defaultValue={p.slug} placeholder="Leave empty to create from the title" className="field" /></div>
        <div><label htmlFor="project_type" className="mb-1.5 block text-sm font-semibold">Type (shown on the public card, so label demos and prototypes honestly)</label>
          <select id="project_type" name="project_type" defaultValue={p.project_type} className="field">{PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <div><label htmlFor="description" className="mb-1.5 block text-sm font-semibold">Description</label><textarea id="description" name="description" required rows={5} defaultValue={p.description} className="field" /></div>
        <div><label htmlFor="technologies" className="mb-1.5 block text-sm font-semibold">Technologies used (separate with commas)</label><input id="technologies" name="technologies" defaultValue={(p.technologies ?? []).join(", ")} className="field" /></div>
        <div>
          <label htmlFor="image" className="mb-1.5 block text-sm font-semibold">Image (JPG, PNG or WebP, up to 4 MB)</label>
          {p.image_url && (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image_url} alt="Current project" className="max-h-40 rounded border border-line" />
              <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="remove_image" className="accent-navy" />Remove this image</label>
            </div>
          )}
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="field" />
        </div>
        <label className="flex items-center gap-3"><input type="checkbox" name="published" defaultChecked={p.published} className="h-4 w-4 accent-navy" /><span>Published (visible on the website)</span></label>
        <button className="btn btn-primary" type="submit">Save project</button>
      </form>
      {!isNew && <DeleteBox id={p.id} action={deletePortfolio} label="Delete this project" warning="The project and its image are removed for good. This cannot be undone." />}
    </>
  );
}
