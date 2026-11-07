import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { DeleteBox, Flash, PageTitle } from "@/components/admin/ui";
import { deleteService, saveService } from "../actions";

export const metadata = { title: "Edit service" };

export default async function EditService({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const isNew = id === "new";
  let s: Record<string, any> = { title: "", slug: "", description: "", category: "", features: [], sort_order: 0, published: false };
  if (!isNew) {
    if (!z.string().uuid().safeParse(id).success) notFound();
    const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    s = data;
  }
  return (
    <>
      <Link href="/admin/services" className="text-sm font-semibold text-teal-text underline">Back to services</Link>
      <div className="mt-3"><PageTitle title={isNew ? "Add service" : "Edit service"} /></div>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={saveService} className="max-w-2xl space-y-5">
        {!isNew && <input type="hidden" name="id" value={s.id} />}
        <div><label htmlFor="title" className="mb-1.5 block text-sm font-semibold">Title</label><input id="title" name="title" required defaultValue={s.title} className="field" /></div>
        <div><label htmlFor="slug" className="mb-1.5 block text-sm font-semibold">Web address (slug)</label><input id="slug" name="slug" defaultValue={s.slug} placeholder="Leave empty to create from the title" className="field" /></div>
        <div><label htmlFor="description" className="mb-1.5 block text-sm font-semibold">Description</label><textarea id="description" name="description" required rows={4} defaultValue={s.description} className="field" /></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><label htmlFor="category" className="mb-1.5 block text-sm font-semibold">Category</label><input id="category" name="category" defaultValue={s.category ?? ""} className="field" /></div>
          <div><label htmlFor="sort_order" className="mb-1.5 block text-sm font-semibold">Display order (lowest first)</label><input id="sort_order" name="sort_order" type="number" min={0} max={999} defaultValue={s.sort_order} className="field" /></div>
        </div>
        <div><label htmlFor="features" className="mb-1.5 block text-sm font-semibold">Bullet points (one per line)</label><textarea id="features" name="features" rows={6} defaultValue={(s.features ?? []).join("\n")} className="field" /></div>
        <label className="flex items-center gap-3"><input type="checkbox" name="published" defaultChecked={s.published} className="h-4 w-4 accent-navy" /><span>Published (visible on the website)</span></label>
        <button className="btn btn-primary" type="submit">Save service</button>
      </form>
      {!isNew && <DeleteBox id={s.id} action={deleteService} label="Delete this service" warning="The service is removed from the website and the database. This cannot be undone." />}
    </>
  );
}
