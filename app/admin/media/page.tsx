import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { deleteMedia, uploadMedia } from "./actions";

export const metadata = { title: "Media" };

export default async function Media({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const d = new Date();
  const months = [0, 1, 2].map((m) => { const x = new Date(d.getFullYear(), d.getMonth() - m, 1); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; });
  const lists = await Promise.all(months.map(async (m) => ((await supabase.storage.from("media").list(m, { limit: 100, sortBy: { column: "created_at", order: "desc" } })).data ?? []).filter((f) => f.name && f.id).map((f) => ({ path: `${m}/${f.name}`, url: supabase.storage.from("media").getPublicUrl(`${m}/${f.name}`).data.publicUrl }))));
  const files = lists.flat();
  return (
    <>
      <PageTitle title="Media" />
      <p className="mb-6 max-w-2xl text-slate">Upload images for articles and pages, then paste the link into your text as <code className="rounded bg-mist px-1.5 py-0.5 text-sm">![describe the image](link)</code>. Images are JPG, PNG or WebP, up to 4 MB.</p>
      <Flash ok={sp.ok} err={sp.err} />
      <form action={uploadMedia} className="mb-10 flex max-w-xl flex-wrap items-end gap-3">
        <div className="flex-1"><label htmlFor="file" className="mb-1.5 block text-sm font-semibold">Image</label><input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="field" /></div>
        <button className="btn btn-primary" type="submit">Upload</button>
      </form>
      <h2 className="mb-4 text-xl font-semibold">Recent uploads (last three months)</h2>
      {files.length === 0 ? <p className="text-slate">No images uploaded yet.</p> : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((f) => (
            <li key={f.path} className="overflow-hidden rounded-md border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
              <div className="p-3">
                <label htmlFor={`u-${f.path}`} className="sr-only">Image link</label>
                <input id={`u-${f.path}`} readOnly value={f.url} className="field !py-2 text-xs" />
                <form action={deleteMedia} className="mt-2"><input type="hidden" name="path" value={f.path} /><button className="text-sm font-semibold text-[#b42318] underline" type="submit">Delete</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
