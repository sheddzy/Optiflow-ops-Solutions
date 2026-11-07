import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Illustration from "@/components/Illustration";
import { CtaBand, FaqList, RichBlocks } from "@/components/Blocks";
import { SERVICES, getService } from "@/lib/services-data";
import { SITE } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => SERVICES.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s) return {};
  return { title: `${s.seoTitle} | OptiFlow`, description: s.seoDescription, alternates: { canonical: `/services/${s.slug}` }, openGraph: { title: s.seoTitle, description: s.seoDescription } };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const others = SERVICES.filter((x) => x.slug !== s.slug);
  const ld = { "@context": "https://schema.org", "@type": "Service", name: s.title, description: s.seoDescription, provider: { "@type": "Organization", name: SITE.name, url: SITE.url } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          <Link href="/services" className="text-sm font-semibold text-teal-text underline">All services</Link>
          <h1 className="mt-3 text-4xl font-bold leading-[1.1] text-navy sm:text-5xl">{s.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">{s.heroText}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/contact?service=${s.slug}`} className="btn btn-primary">{s.heroCta}</Link>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Ask on WhatsApp</a>
          </div>
        </div>
        <Illustration name={s.illustration} label={s.imageAlt} />
      </section>

      {s.sections.map((sec, i) => (
        <section key={sec.heading} className={`border-t border-line ${i % 2 === 0 ? "bg-white" : ""}`} aria-labelledby={`sec-${i}`}>
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
            <h2 id={`sec-${i}`} className="mb-6 text-2xl font-bold text-navy sm:text-3xl">{sec.heading}</h2>
            <RichBlocks blocks={sec.blocks} />
          </div>
        </section>
      ))}

      <section className="border-t border-line" aria-labelledby="faq-h">
        <div className="mx-auto max-w-4xl px-5 py-12 md:py-14">
          <h2 id="faq-h" className="mb-6 text-2xl font-bold text-navy sm:text-3xl">Frequently asked questions</h2>
          <FaqList items={s.faq} />
        </div>
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="more-h">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 id="more-h" className="text-2xl font-bold text-navy">Other services</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => (<li key={o.slug}><Link href={`/services/${o.slug}`} className="block rounded-md border border-line p-4 font-semibold hover:border-navy">{o.title}</Link></li>))}
          </ul>
        </div>
      </section>
      <CtaBand title={s.finalTitle} primary={s.finalCta} href={`/contact?service=${s.slug}`} />
    </>
  );
}
