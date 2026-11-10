import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CtaBand, FaqList, PageHero } from "@/components/Blocks";
import { Markdown } from "@/lib/markdown";
import { getPage, listPageSlugs } from "@/lib/cms";
import { RESERVED_SLUGS } from "@/lib/reserved";
import type { IllustrationKey } from "@/lib/services-data";

export const dynamicParams = true; // pages you create in the dashboard appear without a redeploy
export const revalidate = 60;
export const generateStaticParams = async () => (await listPageSlugs()).map((slug) => ({ slug }));

const ART: IllustrationKey[] = ["operations", "automation", "dashboards", "projects", "email", "website", "about", "contact", "opspilot", "pro", "portfolio", "faq", "legal", "thanks"];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  if (RESERVED_SLUGS.has(slug)) return {};
  const p = await getPage(slug).catch(() => null);
  if (!p) return {};
  const title = p.seoTitle || `${p.title} | OptiFlow`;
  const description = (p.seoDescription || p.heroText).slice(0, 300);
  return { title, description, alternates: { canonical: `/${p.slug}` }, openGraph: { title, description } };
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (RESERVED_SLUGS.has(slug)) notFound();
  const p = await getPage(slug);
  if (!p) notFound();
  const art = (ART as string[]).includes(p.illustration) ? (p.illustration as IllustrationKey) : "about";
  return (
    <>
      <PageHero title={p.heroTitle || p.title} art={art} alt={`Illustration for the page ${p.title}`} intro={p.heroText}>
        {p.ctaLabel && p.ctaHref && <Link href={p.ctaHref} className="btn btn-primary">{p.ctaLabel}</Link>}
      </PageHero>
      {p.body.trim() && (<section className="border-t border-line bg-white"><div className="mx-auto max-w-3xl px-5 py-14 text-lg"><Markdown source={p.body} /></div></section>)}
      {p.faq.length > 0 && (<section aria-labelledby="faq-h"><div className="mx-auto max-w-4xl px-5 py-14"><h2 id="faq-h" className="mb-6 text-3xl font-bold text-navy">Frequently asked questions</h2><FaqList items={p.faq} /></div></section>)}
      <CtaBand title="Ready to talk?" text="Tell us what you need and we will suggest where to start." />
    </>
  );
}
