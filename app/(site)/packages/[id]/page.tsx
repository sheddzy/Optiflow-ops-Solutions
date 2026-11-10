import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Illustration from "@/components/Illustration";
import { Bullets, CtaBand, FaqList } from "@/components/Blocks";
import PackageActions from "@/components/PackageActions";
import { BILLING_NOTES, STAGES, naira, periodLabel } from "@/lib/packages";
import { getPackages } from "@/lib/cms";

export const dynamicParams = true; // packages you add in the dashboard appear without a redeploy
export const revalidate = 60;
export const generateStaticParams = async () => (await getPackages()).items.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { items } = await getPackages();
  const id = (await params).id;
  const p = items.find((x) => x.id === id);
  if (!p) return {};
  const t = `${p.name} Package: ${p.tag || "Business Email and Digital Setup"}`;
  const d = `${p.summary} ${naira(p.price)} ${periodLabel(p.period)}.`.slice(0, 300);
  return { title: `${t} | OptiFlow`, description: d, alternates: { canonical: `/packages/${p.id}` }, openGraph: { title: t, description: d } };
}

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { items: PACKAGES, source } = await getPackages();
  const id = (await params).id;
  const p = PACKAGES.find((x) => x.id === id);
  if (!p) notFound();
  const other = PACKAGES.find((x) => x.id !== p.id);
  const hasSite = [...p.inclusions].some((i) => /website/i.test(i.name));
  const art = hasSite ? "pro" : "email";
  const alt = hasSite
    ? `Illustration of a business website, a company email envelope, a domain name and a renewal calendar, representing the ${p.name} package`
    : `Illustration of a business email inbox beside an envelope with a verified badge and a company address, representing the ${p.name} package`;
  const canBuy = source !== "fallback" && p.buyable && p.price > 0;
  const buyOptions = canBuy ? [{ id: p.id, name: p.name, price: p.price, period: p.period, billingNote: p.billingNote }] : [];
  const ld = { "@context": "https://schema.org", "@type": "Service", name: `${p.name} package`, description: p.summary, provider: { "@type": "Organization", name: "OptiFlow Ops Solutions Ltd" }, offers: { "@type": "Offer", price: String(p.price), priceCurrency: "NGN", description: p.billingNote || "Package" } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          <Link href="/packages" className="text-sm font-semibold text-teal-text underline">All packages</Link>
          <p className="mt-3 text-sm font-semibold text-teal-text">{p.tag}</p>
          <h1 className="mt-1 text-4xl font-bold leading-[1.1] text-navy sm:text-5xl">The {p.name} Package</h1>
          <p className="mt-4 text-4xl font-bold">{naira(p.price)}<span className="text-xl font-medium text-slate"> {periodLabel(p.period)}</span></p>
          {p.billingNote && <p className="mt-1 text-slate">{p.billingNote}.</p>}
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">{p.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {canBuy && <a href="#start" className="btn btn-teal">Buy {p.name} now</a>}
            <a href="#start" className="btn btn-ghost">Send an enquiry first</a>
          </div>
        </div>
        <Illustration name={art} label={alt} />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="ov-h">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:py-16">
          <div><h2 id="ov-h" className="text-3xl font-bold text-navy">Overview</h2><div className="mt-4 space-y-4 text-lg leading-relaxed text-slate">{p.overview.map((t) => <p key={t}>{t}</p>)}</div></div>
          <div><h2 className="text-3xl font-bold text-navy">Who is it for?</h2><p className="mt-4 text-slate">{p.whoForLead}</p><div className="mt-3 text-slate"><Bullets items={p.whoFor} /></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="inc-h">
        <h2 id="inc-h" className="text-3xl font-bold text-navy">{p.inclusionsHeading}</h2>
        <dl className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
          {p.inclusions.map((i) => (<div key={i.name} className="border-l-4 border-teal pl-5"><dt className="font-semibold">{i.name}</dt><dd className="mt-1 text-slate">{i.text}</dd></div>))}
        </dl>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="ex-h">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:py-16">
          <div><h2 id="ex-h" className="text-2xl font-bold text-navy">What is not included</h2><div className="mt-4 text-slate"><Bullets items={p.notIncluded} tone="slate" /></div><p className="mt-4 text-sm text-slate">Items outside the package can be quoted separately.</p></div>
          <div><h2 className="text-2xl font-bold text-navy">What we will ask you for</h2><div className="mt-4 text-slate"><Bullets items={p.youProvide} /></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="how-h">
        <h2 id="how-h" className="text-3xl font-bold text-navy">How it works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (<li key={s.title}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{i + 1}</span><h3 className="mt-3 font-semibold">{s.title}</h3><p className="mt-1 text-sm text-slate">{s.text}</p></li>))}
        </ol>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="bill-h">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 id="bill-h" className="text-2xl font-bold text-navy">Annual billing and renewals</h2>
          <div className="mt-4 max-w-3xl text-slate"><Bullets items={BILLING_NOTES} /></div>
          <p className="mt-4 max-w-3xl text-sm text-slate">Zoho storage, user limits and features are subject to the actual selected subscription. Where a package has a licensed-user allowance, it is confirmed in your proposal.</p>
        </div>
      </section>

      <section id="start" className="scroll-mt-24 mx-auto max-w-3xl px-5 py-14 md:py-16" aria-labelledby="start-h">
        <h2 id="start-h" className="text-3xl font-bold text-navy">Get the {p.name} package</h2>
        <p className="mb-8 mt-3 text-slate">{canBuy ? "Buy now and pay securely online, or send an enquiry first if you have questions." : "Send us your details and we will arrange this package with you."}</p>
        <PackageActions buyOptions={buyOptions} packageId={p.id} enquiryService={/launch/i.test(p.id) ? "Launch Package" : /^pro$/i.test(p.id) ? "Pro Package" : "General Enquiry"} notice={!canBuy ? "This package is arranged through an enquiry. Send your details below and we will get back to you." : undefined} />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="faq-h">
        <div className="mx-auto max-w-4xl px-5 py-14">
          {p.faq.length > 0 && (<><h2 id="faq-h" className="mb-6 text-2xl font-bold text-navy">Questions about {p.name}</h2>
          <FaqList items={p.faq} /></>)}
          {other && <p className="mt-8 text-slate">Comparing options? See the <Link href={`/packages/${other.id}`} className="font-semibold text-teal-text underline">{other.name} package</Link> ({naira(other.price)} {periodLabel(other.period)}) or the <Link href="/packages#compare" className="font-semibold text-teal-text underline">full comparison</Link>.</p>}
        </div>
      </section>
      <CtaBand title={`Ready to start with ${p.name}?`} text="Buy online or talk to us first. Either way, we confirm your requirements before implementation begins." primary={`Get ${p.name}`} href={`/packages/${p.id}#start`} />
    </>
  );
}
