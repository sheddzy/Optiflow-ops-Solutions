import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/Blocks";
import { Markdown } from "@/lib/markdown";
import { getPost, getPosts } from "@/lib/cms";
import { SITE } from "@/lib/site";

export const dynamicParams = true; // new posts appear without a redeploy
export const revalidate = 60;
export const generateStaticParams = async () => (await getPosts(100).catch(() => [])).map((p) => ({ slug: p.slug }));

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getPost((await params).slug).catch(() => null);
  if (!p) return {};
  const title = p.seoTitle || `${p.title} | OptiFlow`;
  const description = (p.seoDescription || p.excerpt).slice(0, 300);
  return { title, description, alternates: { canonical: `/blog/${p.slug}` }, openGraph: { type: "article", title, description, ...(p.coverUrl ? { images: [{ url: p.coverUrl }] } : {}), publishedTime: p.publishedAt } };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  const ld = { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.excerpt, datePublished: p.publishedAt, author: { "@type": "Organization", name: p.author }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/brand/logo.png` } }, ...(p.coverUrl ? { image: p.coverUrl } : {}), mainEntityOfPage: `${SITE.url}/blog/${p.slug}` };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <article className="mx-auto max-w-3xl px-5 py-14 md:py-20">
        <Link href="/blog" className="text-sm font-semibold text-teal-text underline">All articles</Link>
        {p.category && <p className="mt-4 text-sm font-semibold text-teal-text">{p.category}</p>}
        <h1 className="mt-1 text-4xl font-bold leading-[1.12] text-navy sm:text-5xl">{p.title}</h1>
        <p className="mt-4 text-slate">{fmt(p.publishedAt)} · {p.author}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.coverUrl && <img src={p.coverUrl} alt="" className="mt-8 aspect-[16/9] w-full rounded-md object-cover" />}
        <div className="mt-8 text-lg"><Markdown source={p.body} /></div>
        {p.tags.length > 0 && <p className="mt-10 flex flex-wrap gap-2">{p.tags.map((t) => <span key={t} className="rounded bg-mist px-2.5 py-1 text-sm font-medium text-navy">{t}</span>)}</p>}
      </article>
      <CtaBand title="Want help putting this into practice?" text="Tell us what is slowing your business down and we will suggest where to start." />
    </>
  );
}
