import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/Illustration";
import { Bullets, CtaBand } from "@/components/Blocks";
import { SERVICES } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "Our Services | Operations, Automation, Reporting and Digital Solutions",
  description: "Explore OptiFlow's business operations setup, workflow automation, reporting dashboards, project management, business email and website services.",
  alternates: { canonical: "/services" },
};

const CHOOSE = [
  ["If your business lacks documented procedures, start with", "business-operations-setup", "Business Operations Setup"],
  ["If your team spends too much time on repetitive activities, explore", "workflow-automation", "Workflow Automation"],
  ["If you cannot easily monitor business performance, consider", "dashboards-and-reporting", "Dashboards and Reporting"],
  ["If projects are difficult to coordinate, consider", "project-management", "Project Management"],
  ["If your business needs professional email, explore", "business-email-and-it-support", "Business Email and IT Support"],
  ["If customers cannot easily find your business online, consider", "website-and-digital-solutions", "Website and Digital Solutions"],
];

export default function Services() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-navy sm:text-5xl">Everything Your Business Needs to Operate More Effectively.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate">We help businesses organise their processes, automate routine work, improve reporting, coordinate projects and establish practical digital systems.</p>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="intro-h">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-2 md:py-16">
          <div className="space-y-4 text-slate">
            <h2 id="intro-h" className="text-2xl font-bold text-navy">Operational problems are usually connected</h2>
            <p>Businesses often approach operational problems as separate issues. A missed follow-up may appear to be a sales problem. Delayed work may appear to be an employee performance problem. Incomplete reports may appear to be a data problem.</p>
          </div>
          <div className="space-y-4 text-slate md:pt-12">
            <p>But many of these challenges are connected. A poorly documented process can affect employee performance. Disconnected tools can affect reporting. Unclear responsibilities can delay projects.</p>
            <p>OptiFlow takes a practical approach to these challenges by combining operations management and technology solutions.</p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-14"><h2 className="text-3xl font-bold text-navy">Our six service areas</h2>
        <nav aria-label="Jump to a service" className="mt-5 flex flex-wrap gap-2">{SERVICES.map((s) => (<a key={s.slug} href={`#${s.slug}`} className="rounded border border-line bg-white px-3 py-2 text-sm font-medium hover:border-navy">{s.title}</a>))}</nav>
      </div>

      {SERVICES.map((s, i) => (
        <section key={s.slug} id={s.slug} className={`mt-14 scroll-mt-24 border-t border-line ${i % 2 ? "bg-white" : ""}`} aria-labelledby={`${s.slug}-h`}>
          <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-14 md:grid-cols-2 md:py-16">
            <div className={i % 2 ? "md:order-2" : ""}><Illustration name={s.illustration} label={s.imageAlt} /></div>
            <div>
              <p className="text-sm font-semibold text-teal-text">{i + 1} of {SERVICES.length}</p>
              <h3 id={`${s.slug}-h`} className="mt-1 text-3xl font-bold text-navy">{s.title}</h3>
              <p className="mt-2 text-lg font-medium text-teal-text">{s.overview.tagline}</p>
              <p className="mt-3 text-slate">{s.overview.intro}</p>
              <h4 className="mt-5 font-semibold">Our work may include</h4>
              <div className="mt-2 text-slate"><Bullets items={s.overview.work} /></div>
              <p className="mt-5 rounded-md border-l-4 border-teal bg-mist/60 p-4 text-sm"><strong>Ideal for:</strong> {s.overview.ideal}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/services/${s.slug}`} className="btn btn-primary">Learn More</Link>
                <Link href={`/contact?service=${s.slug}`} className="btn btn-ghost">Enquire</Link>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-line bg-white" aria-labelledby="choose-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 id="choose-h" className="text-3xl font-bold text-navy">How to choose the right service</h2>
          <p className="mt-3 text-slate">Not sure where to begin?</p>
          <ul className="mt-5 space-y-3">
            {CHOOSE.map(([t, slug, name]) => (<li key={slug} className="text-slate">{t} <Link href={`/services/${slug}`} className="font-semibold text-teal-text underline">{name}</Link>.</li>))}
          </ul>
          <p className="mt-5 text-slate">We can also assess your requirements and recommend a combination of services.</p>
        </div>
      </section>
      <CtaBand title="Tell Us What Is Not Working in Your Business." text="We will help you identify a practical starting point." primary="Request a Consultation" />
    </>
  );
}
