import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Flash, PageTitle } from "@/components/admin/ui";
import { togglePage } from "./actions";

export const metadata = { title: "Pages" };

export default async function Pages({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const { data, error } = await supabase.from("pages").select("id,slug,title,published,show_in_footer,updated_at").order("title");
  return (
    <>
      <PageTitle title="Pages"><Link href="/admin/pages/new" className="btn btn-primary">New page</Link></PageTitle>
      <p className="mb-6 max-w-2xl text-slate">Create extra pages such as a service explainer or a campaign page. Each lives at its own address, for example /my-page, and can be linked from the footer.</p>
      <Flash ok={sp.ok} err={sp.err} />
      {error && <p role="alert" className="text-[#b42318]">Pages could not be loaded. Run migration 003_cms.sql in Supabase if you have not yet.</p>}
      {!error && (data ?? []).length === 0 ? <p className="rounded-md border border-line bg-white p-6 text-slate">No pages yet.</p> : (
        <ul className="divide-y divide-line rounded-md border border-line bg-white">
          {(data ?? []).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div><Link href={`/admin/pages/${p.id}`} className="font-semibold text-navy underline">{p.title}</Link><p className="text-sm text-slate">{p.published ? "Live" : "Draft"}{p.show_in_footer ? " · In footer" : ""} · <Link href={`/${p.slug}`} target="_blank" className="underline">/{p.slug}</Link></p></div>
              <form action={togglePage}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="publish" value={p.published ? "0" : "1"} /><button className="btn btn-ghost !px-4 !py-2" type="submit">{p.published ? "Hide" : "Publish"}</button></form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
