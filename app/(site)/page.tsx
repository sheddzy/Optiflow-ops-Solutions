import type { Metadata } from "next";
import Link from "next/link";
import FlowLines from "@/components/FlowLines";
import { CtaBand, ServiceCard } from "@/components/Blocks";
import Illustration from "@/components/Illustration";
import { SERVICES } from "@/lib/services-data";
import { naira, periodLabel } from "@/lib/packages";
import { getPackages, getSiteChrome } from "@/lib/cms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "OptiFlow Ops Solutions | Business Operations & Technology" },
  description: "We help growing businesses organise operations, improve reporting, automate repetitive work and build practical digital systems.",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

const PROBLEMS = [
  ["Manual work", "Reduce repetitive admin, data entry and customer follow-ups."],
  ["Unclear processes", "Give your team documented steps, clear ownership and consistent workflows."],
  ["Limited visibility", "Bring tasks, sales and performance information into useful reports."],
];

const STEPS = [
  ["Tell us what is not working", "We learn about your business and the problem you need to solve."],
  ["Agree on a practical solution", "We confirm the scope, deliverables, tools and any third-party costs."],
  ["Implement and hand over", "We configure the solution, test it and show your team how to use it."],
];

export default async function Home() {
  const [{ items: PACKAGES }, { banner }] = await Promise.all([getPackages(), getSiteChrome()]);
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/brand/logo.png`,
    email: SITE.enquiryEmail,
    telephone: SITE.phoneDisplay,
    slogan: "Better systems. Smoother operations.",
    sameAs: [SITE.linkedin, SITE.instagram, SITE.facebook],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[.16em] text-teal-text">OptiFlow Ops Solutions</p>
          <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.6rem]">
            Better systems. Smoother operations.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate">
            We help growing businesses organise work, improve reporting and automate repetitive tasks.
          </p>
          <Link href="/services" className="mt-7 inline-flex min-h-11 items-center font-semibold text-teal-text underline decoration-2 underline-offset-4 hover:text-navy">
            Explore our services <span aria-hidden="true" className="ml-2">→</span>
          </Link>
          <p className="mt-6 text-sm text-slate">Operations setup · Automation · Dashboards · Business technology</p>
        </div>
        <FlowLines className="w-full" />
      </section>

      {banner && (
        <section className="border-y border-line bg-white" aria-label="Current offer">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3 text-sm">
            <span className="font-semibold text-navy">Current offer:</span>
            <Link href={banner.href} className="font-medium text-teal-text underline underline-offset-4 hover:text-navy">{banner.text}</Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="problems-h">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-text">What we improve</p>
          <h2 id="problems-h" className="mt-2 text-3xl font-bold text-navy">Make day-to-day work easier to manage.</h2>
          <p className="mt-3 text-slate">When a business grows, informal processes and manual work can slow the team down. We help fix the systems behind the work.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PROBLEMS.map(([title, description]) => (
            <article key={title} className="rounded-md border border-line bg-white p-5">
              <h3 className="text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-slate">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="services-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-text">Our services</p>
              <h2 id="services-h" className="mt-2 text-3xl font-bold text-navy">Practical support for your business.</h2>
              <p className="mt-3 text-slate">Choose the support you need. We shape the work around your business and existing tools.</p>
            </div>
            <Link href="/services" className="font-semibold text-teal-text underline underline-offset-4">View all services</Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => <ServiceCard key={service.slug} s={service} />)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="how-h">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-text">How it works</p>
          <h2 id="how-h" className="mt-2 text-3xl font-bold text-navy">Three steps from problem to solution.</h2>
        </div>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(([title, description], index) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{index + 1}</span>
              <div>
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-slate">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="packages-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-text">Business packages</p>
            <h2 id="packages-h" className="mt-2 text-3xl font-bold text-navy">Start with the right digital foundation.</h2>
            <p className="mt-3 text-slate">Annual packages for businesses that need professional email, a website and essential digital setup.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {PACKAGES.map((item) => (
              <article key={item.id} className="flex flex-col rounded-md border border-line p-6">
                <h3 className="text-xl font-bold text-navy">{item.name}</h3>
                <p className="mt-2 text-2xl font-bold text-ink">{naira(item.price)} <span className="text-sm font-medium text-slate">{periodLabel(item.period)}</span></p>
                <p className="mt-3 flex-1 text-slate">{item.summary}</p>
                <Link href={`/packages/${item.id}`} className="mt-5 inline-flex min-h-11 items-center font-semibold text-teal-text underline underline-offset-4">View package details <span aria-hidden="true" className="ml-2">→</span></Link>
              </article>
            ))}
          </div>
          <Link href="/packages" className="mt-6 inline-flex min-h-11 items-center font-semibold text-navy underline underline-offset-4">Compare all packages</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-2 md:py-16" aria-label="OptiFlow products and portfolio">
        <article className="rounded-md border border-line bg-white p-6">
          <Illustration name="opspilot" label="OpsPilot operational dashboard illustration" />
          <h2 className="mt-5 text-2xl font-bold text-navy">Meet OpsPilot.</h2>
          <p className="mt-2 text-slate">OpsPilot is our developing business operations product for organising leads, tasks, sales and reporting.</p>
          <Link href="/opspilot" className="mt-4 inline-flex min-h-11 items-center font-semibold text-teal-text underline underline-offset-4">Explore OpsPilot →</Link>
        </article>
        <article className="rounded-md border border-line bg-white p-6">
          <Illustration name="portfolio" label="Examples of business documentation, dashboard and project board" />
          <h2 className="mt-5 text-2xl font-bold text-navy">See practical examples.</h2>
          <p className="mt-2 text-slate">Explore sample dashboards, workflows and systems built around everyday business needs.</p>
          <Link href="/portfolio" className="mt-4 inline-flex min-h-11 items-center font-semibold text-teal-text underline underline-offset-4">View our portfolio →</Link>
        </article>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="why-h">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
          <h2 id="why-h" className="text-2xl font-bold text-navy">Why OptiFlow?</h2>
          <ul className="mt-6 grid gap-4 text-slate sm:grid-cols-3">
            <li><strong className="text-ink">Practical first.</strong> We solve the process problem before adding tools.</li>
            <li><strong className="text-ink">Clear scope.</strong> You know what will be delivered and what it costs.</li>
            <li><strong className="text-ink">Built to fit.</strong> Solutions reflect your team, resources and current systems.</li>
          </ul>
        </div>
      </section>

      <CtaBand title="Ready to make work easier?" text="Tell us what is slowing your business down. We will help you identify a practical next step." primary="Contact OptiFlow" />
    </>
  );
}
