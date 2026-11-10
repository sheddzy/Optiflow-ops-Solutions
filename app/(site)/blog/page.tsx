import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand } from "@/components/Blocks";
import { getPosts } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Blog | Business Operations, Automation and Digital Systems | OptiFlow",
  description: "Practical articles from OptiFlow on business operations, process improvement, automation, reporting, project management and digital systems.",
  alternates: { canonical: "/blog" },
};
export const revalidate = 60;

export const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "long", year: "numeric" });

export default async function Blog() {
  const posts = await getPosts();
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-navy sm:text-5xl">Ideas for running a better business</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">Practical articles on business operations, process improvement, automation, reporting, project management and digital systems.</p>
      </section>
      <section className="border-t border-line bg-white" aria-labelledby="posts-h">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 id="posts-h" className="sr-only">Latest articles</h2>
          {posts.length === 0 ? (
            <p className="text-slate">No articles have been published yet. Please check back soon.</p>
          ) : (
            <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-white transition hover:border-navy hover:shadow-md">
                    {p.coverUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.coverUrl} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />}
                    <span className="flex flex-1 flex-col p-6">
                      {p.category && <span className="text-sm font-semibold text-teal-text">{p.category}</span>}
                      <span className="mt-1 text-xl font-semibold text-ink">{p.title}</span>
                      {p.excerpt && <span className="mt-2 flex-1 text-slate">{p.excerpt}</span>}
                      <span className="mt-4 text-sm text-slate">{fmt(p.publishedAt)} · {p.author}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <CtaBand title="Want help putting this into practice?" text="Tell us what is slowing your business down and we will suggest where to start." />
    </>
  );
}
