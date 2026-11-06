import Link from "next/link";
import FlowLines from "@/components/FlowLines";
import ProjectGrid from "@/components/ProjectGrid";
import { getBlocks, getProjects, getServices } from "@/lib/content";

export const revalidate = 60;

const DEFAULTS = {
  home_hero: { title: "Better Systems. Better Business.", content: "OptiFlow helps businesses improve how they operate through better processes, smarter systems, workflow automation and digital solutions." },
  home_why: { title: "Why work with OptiFlow", content: "We reduce operational inefficiencies, improve productivity, establish accountability and give you better visibility into your operations." },
  opspilot_intro: { title: "OpsPilot", content: "OpsPilot is a business operations management product developed by OptiFlow Ops Solutions Ltd." },
};

const WHY = [
  ["Fewer inefficiencies", "We find where work stalls or repeats and redesign it."],
  ["Higher productivity", "Clear processes and automation free your team for work that matters."],
  ["Clear accountability", "Every task, owner and deadline is visible and tracked."],
  ["Real visibility", "Dashboards and reports show how the business is performing."],
];

export default async function Home() {
  const [b, services, projects] = await Promise.all([getBlocks(DEFAULTS), getServices(), getProjects(2)]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-6xl">{b.home_hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">{b.home_hero.content}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-primary">Talk to us about your operations</Link>
            <Link href="/services" className="btn btn-ghost">See our services</Link>
          </div>
        </div>
        <FlowLines className="w-full" />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="services-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="services-h" className="max-w-2xl text-3xl font-bold text-navy">What we do</h2>
          {services.length === 0 ? (
            <p className="mt-8 text-slate">Our services are being updated. Please check back shortly, or <Link href="/contact" className="font-semibold text-teal-text underline">contact us</Link>.</p>
          ) : (
            <ul className="mt-10 divide-y divide-line border-y border-line">
              {services.map((s) => (
                <li key={s.id} className="grid gap-3 py-7 md:grid-cols-[1fr_1.2fr] md:gap-10">
                  <h3 className="text-xl font-semibold text-ink">{s.title}</h3>
                  <p className="text-slate">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
          <Link href="/services" className="mt-8 inline-block font-semibold text-teal-text underline underline-offset-4">Full service details</Link>
        </div>
      </section>

      <section className="bg-deep text-white" aria-labelledby="ops-h">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-[1fr_1fr] md:py-20">
          <div>
            <h2 id="ops-h" className="text-3xl font-bold">{b.opspilot_intro.title}</h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">{b.opspilot_intro.content}</p>
            <p className="mt-4 max-w-lg text-white/70">OpsPilot is in development. We are taking enquiries from businesses that want early access.</p>
          </div>
          <div className="flex items-end md:justify-end">
            <Link href="/opspilot" className="btn btn-teal">Learn about OpsPilot</Link>
          </div>
        </div>
      </section>

      {projects.length > 0 && (
        <section aria-labelledby="work-h" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="work-h" className="text-3xl font-bold text-navy">Selected work</h2>
          <div className="mt-10"><ProjectGrid projects={projects} /></div>
          <Link href="/portfolio" className="mt-8 inline-block font-semibold text-teal-text underline underline-offset-4">View the portfolio</Link>
        </section>
      )}

      <section aria-labelledby="why-h" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <h2 id="why-h" className="text-3xl font-bold text-navy">{b.home_why.title}</h2>
        <p className="mt-4 max-w-2xl text-lg text-slate">{b.home_why.content}</p>
        <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2">
          {WHY.map(([t, d]) => (
            <div key={t} className="border-l-4 border-teal pl-5">
              <dt className="text-lg font-semibold">{t}</dt>
              <dd className="mt-1 text-slate">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
          <h2 className="max-w-xl text-3xl font-bold">Tell us where your operations are slowing you down.</h2>
          <Link href="/contact" className="btn btn-teal">Send an enquiry</Link>
        </div>
      </section>
    </>
  );
}
