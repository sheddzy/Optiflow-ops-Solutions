import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { saveContent } from "./actions";

export const metadata = { title: "Site content" };

const LABELS: Record<string, string> = {
  home_hero: "Home page: main heading and introduction",
  home_why: "Home page: why work with OptiFlow",
  opspilot_intro: "OpsPilot: heading and introduction (also shown on Home)",
  about_intro: "About page: introduction",
  about_mission: "About page: mission",
  about_vision: "About page: vision",
};

export default async function Content({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("site_content").select("id,section,title,content").order("section");
  const rows = (data ?? []).filter((r) => LABELS[r.section]);
  return (
    <>
      <PageTitle title="Site content" />
      <p className="mb-6 max-w-2xl text-slate">Edit the main text on the website. Changes appear on the live site within a minute.</p>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Content could not be loaded. Refresh and try again.</p>}
      {!error && rows.length === 0 && <p className="rounded-md border border-line bg-white p-6 text-slate">No editable content found. Run the seed section of 001_schema.sql in Supabase.</p>}
      <div className="space-y-8">
        {rows.map((r) => (
          <form key={r.id} action={saveContent} className="max-w-2xl space-y-3 rounded-md border border-line bg-white p-5">
            <input type="hidden" name="id" value={r.id} />
            <h2 className="font-semibold">{LABELS[r.section]}</h2>
            <div><label htmlFor={`t-${r.id}`} className="mb-1 block text-sm text-slate">Heading</label><input id={`t-${r.id}`} name="title" defaultValue={r.title ?? ""} required className="field" /></div>
            <div><label htmlFor={`c-${r.id}`} className="mb-1 block text-sm text-slate">Text</label><textarea id={`c-${r.id}`} name="content" rows={4} defaultValue={r.content ?? ""} required className="field" /></div>
            <button className="btn btn-primary" type="submit">Save</button>
          </form>
        ))}
      </div>
    </>
  );
}
