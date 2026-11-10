import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/Illustration";
import { Bullets, CtaBand, FaqList } from "@/components/Blocks";
import PackageActions from "@/components/PackageActions";
import { BILLING_NOTES, PACKAGE_FAQ, STAGES, buildComparison, naira, periodLabel } from "@/lib/packages";
import { getPackages } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Business Email and Website Packages | OptiFlow",
  description: "Explore OptiFlow's annual Launch and Pro packages for business domain registration, Zoho email setup, website development and digital infrastructure.",
  alternates: { canonical: "/packages" },
};

export const revalidate = 60;

export default async function Packages() {
  const { items: PACKAGES, source } = await getPackages();
  const buyOptions = source === "fallback" ? [] : PACKAGES.filter((p) => p.buyable && p.price > 0).map((p) => ({ id: p.id, name: p.name, price: p.price, period: p.period, billingNote: p.billingNote }));
  const cmp = buildComparison(PACKAGES);
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] text-navy sm:text-5xl">Your Business Digital Foundation, Organised Into One Annual Package.</h1>
          <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-slate">
            <p>Establish professional business email, domain infrastructure and a business website through straightforward annual service packages.</p>
            <p>Whether you are starting a business or improving your existing digital presence, OptiFlow helps you put the essential systems in place.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#compare" className="btn btn-primary">Compare Our Packages</a>
            <a href="#start" className="btn btn-ghost">Buy or Enquire</a>
          </div>
        </div>
        <Illustration name="pro" label="Illustration of a business website, a company email envelope with a verified badge, a domain name and a renewal calendar, representing the elements of the annual packages" />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="why-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 id="why-h" className="text-3xl font-bold text-navy">Why these packages?</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-lg text-slate">
            <p>Businesses often need several digital services at the same time. A domain must be registered. Business email must be configured. A website may need to be designed, deployed and maintained.</p>
            <p>Managing these activities separately can create unnecessary coordination. Our packages combine selected services into a structured annual arrangement.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="choose-h">
        <h2 id="choose-h" className="sr-only">Launch and Pro</h2>
        <div className="grid gap-8 lg:grid-cols-2">
          {PACKAGES.map((p) => (
            <article key={p.id} className="flex flex-col rounded-md border border-line bg-white p-7">
              <p className="text-sm font-semibold text-teal-text">{p.tag}</p>
              <h3 className="mt-1 text-3xl font-bold text-navy">{p.name} Package</h3>
              <p className="mt-2 text-3xl font-bold">{naira(p.price)}<span className="text-lg font-medium text-slate"> {periodLabel(p.period)}</span></p>
              {p.billingNote && <p className="mt-1 text-sm text-slate">{p.billingNote}</p>}
              <p className="mt-4 text-slate">{p.summary}</p>
              <h4 className="mt-5 font-semibold">Highlights</h4>
              <div className="mt-2 text-slate"><Bullets items={p.inclusions.slice(0, 5).map((i) => i.name)} /></div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/packages/${p.id}`} className="btn btn-primary">View {p.name} details</Link>
                <Link href={`/packages/${p.id}#start`} className="btn btn-ghost">{p.buyable && p.price > 0 && source !== "fallback" ? `Buy ${p.name}` : `Enquire about ${p.name}`}</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {PACKAGES.length > 1 && (
        <section id="compare" className="scroll-mt-24 border-y border-line bg-white" aria-labelledby="cmp-h">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
            <h2 id="cmp-h" className="text-3xl font-bold text-navy">Package comparison</h2>
            <div className="mt-8 overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[560px] text-left">
                <caption className="sr-only">Comparison of the packages</caption>
                <thead className="border-b border-line bg-mist/60"><tr><th scope="col" className="p-3">Feature</th>{cmp.heads.map((h) => <th key={h} scope="col" className="p-3">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-line">{cmp.rows.map((r) => (<tr key={r.feature}><th scope="row" className="p-3 font-medium">{r.feature}</th>{r.cells.map((c, k) => <td key={k} className="p-3 text-slate">{c}</td>)}</tr>))}</tbody>
              </table>
            </div>
            <p className="mt-4 max-w-3xl text-sm text-slate">Zoho storage, user limits and features are subject to the actual selected subscription. Where a package has a licensed-user allowance, it is confirmed in the proposal.</p>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="how-h">
        <h2 id="how-h" className="text-3xl font-bold text-navy">How onboarding works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (<li key={s.title}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{i + 1}</span><h3 className="mt-3 font-semibold">Stage {i + 1}: {s.title}</h3><p className="mt-1 text-sm text-slate">{s.text}</p></li>))}
        </ol>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="bill-h">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 id="bill-h" className="text-3xl font-bold text-navy">Important annual billing information</h2>
          <div className="mt-5 max-w-3xl text-slate"><Bullets items={BILLING_NOTES} /></div>
        </div>
      </section>

      <section id="start" className="scroll-mt-24 mx-auto max-w-3xl px-5 py-14 md:py-16" aria-labelledby="start-h">
        <h2 id="start-h" className="text-3xl font-bold text-navy">Get started</h2>
        <p className="mb-8 mt-3 text-slate">Buy a package now and pay securely online, or send an enquiry first if you would like to talk it through.</p>
        <PackageActions buyOptions={buyOptions} notice={source === "fallback" ? "Online payment is temporarily unavailable. You can still send an enquiry below." : undefined} />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="faq-h">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <h2 id="faq-h" className="mb-6 text-3xl font-bold text-navy">Frequently asked questions</h2>
          <FaqList items={PACKAGE_FAQ} />
        </div>
      </section>
      <CtaBand title="Give Your Business the Digital Infrastructure It Needs." text="Choose the package that matches your current requirements." primary="Request a Package" href="/packages#start" />
    </>
  );
}
