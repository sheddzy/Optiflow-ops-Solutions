import Link from "next/link";
import { requireAdmin, STATUSES, fmtDate, type Status } from "@/lib/admin";
import { PageTitle, StatusBadge } from "@/components/admin/ui";

export default async function Overview() {
  const { supabase } = await requireAdmin();
  const day = 86_400_000;
  const since = (d: number) => new Date(Date.now() - d * day).toISOString();

  const [counts, last7, last30, recent, claims, livePromos, posts, pkgs] = await Promise.all([
    Promise.all(STATUSES.map((s) => supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", s))),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", since(7)),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", since(30)),
    supabase.from("enquiries").select("id,name,company,service_interest,status,created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).not("promotion_id", "is", null),
    supabase.from("promotions").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("packages").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  const by = Object.fromEntries(STATUSES.map((s, i) => [s, counts[i].count ?? 0])) as Record<Status, number>;
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  const failed = counts.some((c) => c.error) || recent.error;

  const cards: [string, number][] = [["Total enquiries", total], ["New", by.New], ["Qualified leads", by.Qualified], ["Won", by.Won], ["Promotion claims", claims.count ?? 0], ["Live promotions", livePromos.count ?? 0], ["Live packages", pkgs.count ?? 0], ["Published articles", posts.count ?? 0]];

  return (
    <>
      <PageTitle title="Overview" />
      {failed && <p role="alert" className="mb-6 rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-3 text-sm text-[#b42318]">Some figures could not be loaded. Refresh the page, and check the database connection if this continues.</p>}
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map(([label, n]) => (
          <div key={label} className="rounded-md border border-line bg-white p-5">
            <dt className="text-sm text-slate">{label}</dt>
            <dd className="mt-1 text-3xl font-bold text-navy">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="recent-h">
          <h2 id="recent-h" className="text-xl font-semibold">Recent enquiries</h2>
          {(recent.data ?? []).length === 0 ? (
            <p className="mt-4 text-slate">No enquiries yet. They appear here as soon as someone uses the contact form.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line rounded-md border border-line bg-white">
              {recent.data!.map((e) => (
                <li key={e.id}>
                  <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-mist/50">
                    <span><span className="font-semibold">{e.name}</span>{e.company && <span className="text-slate"> at {e.company}</span>}<br /><span className="text-sm text-slate">{e.service_interest} · {fmtDate(e.created_at)}</span></span>
                    <StatusBadge status={e.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/enquiries" className="mt-4 inline-block font-semibold text-teal-text underline">All enquiries</Link>
        </section>

        <section aria-labelledby="stats-h">
          <h2 id="stats-h" className="text-xl font-semibold">Statistics</h2>
          <p className="mt-4 text-slate">Last 7 days: <strong className="text-ink">{last7.count ?? 0}</strong>. Last 30 days: <strong className="text-ink">{last30.count ?? 0}</strong>.</p>
          <ul className="mt-5 space-y-3">
            {STATUSES.map((s) => (
              <li key={s}>
                <div className="flex justify-between text-sm"><span>{s}</span><span className="font-semibold">{by[s]}</span></div>
                <div className="mt-1 h-2 rounded bg-mist"><div className="h-2 rounded bg-navy" style={{ width: total ? `${(by[s] / total) * 100}%` : 0 }} /></div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
