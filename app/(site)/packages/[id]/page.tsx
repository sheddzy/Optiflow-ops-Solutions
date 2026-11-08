import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Illustration from "@/components/Illustration";
import { Bullets, CtaBand, FaqList } from "@/components/Blocks";
import PackageActions from "@/components/PackageActions";
import { BILLING_NOTES, PACKAGES, STAGES, getPackage, naira } from "@/lib/packages";

export const dynamicParams = false;
export const generateStaticParams = () => PACKAGES.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getPackage((await params).id);
  if (!p) return {};
  const t = p.id === "launch" ? "Launch Package: Business Email and Domain Setup" : "Pro Package: Business Email, Domain and Website";
  const d = p.id === "launch"
    ? "OptiFlow's Launch package at ₦200,000 per year: domain registration support, up to two Zoho business email accounts, signatures, basic maintenance and renewal monitoring."
    : "OptiFlow's Pro package at ₦500,000 per year: business email, domain and a professional responsive website with contact form, WhatsApp integration, basic SEO and maintenance.";
  return { title: `${t} | OptiFlow`, description: d, alternates: { canonical: `/packages/${p.id}` }, openGraph: { title: t, description: d, url: `/packages/${p.id}` } };
}

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const p = getPackage((await params).id);
  if (!p) notFound();
  const other = PACKAGES.find((x) => x.id !== p.id)!;
  const art = p.id === "launch" ? "email" : "pro";
  const alt = p.id === "launch"
    ? "Illustration of a business email inbox beside an envelope with a verified badge and a company address, representing the Launch package"
    : "Illustration of a business website, a company email envelope, a domain name and a renewal calendar, representing the Pro package";
  const ld = { "@context": "https://schema.org", "@type": "Service", name: `${p.name} package`, description: p.summary, provider: { "@type": "Organization", name: "OptiFlow Ops Solutions Ltd" }, offers: { "@type": "Offer", price: String(p.price), priceCurrency: "NGN", description: "Annual package, billed annually and paid upfront" } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          <Link href="/packages" className="text-sm font-semibold text-teal-text underline">All packages</Link>
          <p className="mt-3 text-sm font-semibold text-teal-text">{p.tag}</p>
          <h1 className="mt-1 text-4xl font-bold leading-[1.1] text-navy sm:text-5xl">The {p.name} Package</h1>
          <p className="mt-4 text-4xl font-bold">{naira(p.price)}<span className="text-xl font-medium text-slate"> / year</span></p>
          <p className="mt-1 text-slate">Billed annually, paid upfront for a 12 month service period.</p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">{p.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#start" className="btn btn-teal">Buy {p.name} now</a>
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
          <p className="mt-4 max-w-3xl text-sm text-slate">Zoho storage, user limits and features are subject to the actual selected subscription.{p.id === "pro" ? " The number of Pro licensed users is confirmed in your proposal." : ""}</p>
        </div>
      </section>

      <section id="start" className="scroll-mt-24 mx-auto max-w-3xl px-5 py-14 md:py-16" aria-labelledby="start-h">
        <h2 id="start-h" className="text-3xl font-bold text-navy">Get the {p.name} package</h2>
        <p className="mb-8 mt-3 text-slate">Buy now and pay securely online, or send an enquiry first if you have questions.</p>
        <PackageActions packageId={p.id} />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="faq-h">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <h2 id="faq-h" className="mb-6 text-2xl font-bold text-navy">Questions about {p.name}</h2>
          <FaqList items={p.faq} />
          <p className="mt-8 text-slate">Comparing options? See the <Link href={`/packages/${other.id}`} className="font-semibold text-teal-text underline">{other.name} package</Link> ({naira(other.price)} per year) or the <Link href="/packages#compare" className="font-semibold text-teal-text underline">full comparison</Link>.</p>
        </div>
      </section>
      <CtaBand title={`Ready to start with ${p.name}?`} text="Buy online or talk to us first. Either way, we confirm your requirements before implementation begins." primary={`Get ${p.name}`} href={`/packages/${p.id}#start`} />
    </>
  );
}
