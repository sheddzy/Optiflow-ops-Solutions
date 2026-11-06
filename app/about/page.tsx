import type { Metadata } from "next";
import Link from "next/link";
import { getBlocks } from "@/lib/content";

export const metadata: Metadata = { title: "About", description: "About OptiFlow Ops Solutions Ltd., a business operations, process optimisation, automation and technology solutions company.", alternates: { canonical: "/about" } };
export const revalidate = 60;

const DEFAULTS = {
  about_intro: { title: "About OptiFlow Ops Solutions", content: "OptiFlow Ops Solutions Ltd. is a business operations, process optimisation, automation and technology solutions company." },
  about_mission: { title: "Our mission", content: "To help businesses run better by combining sound operations practice with practical technology." },
  about_vision: { title: "Our vision", content: "Businesses that operate with clarity, accountability and visibility, supported by systems that scale with them." },
};

const APPROACH = [
  ["Understand how work really happens", "We start by mapping your current processes and finding where time, money or accountability leaks."],
  ["Redesign before automating", "We fix the process first, because automating a broken process only makes it fail faster."],
  ["Build the system", "We document procedures, set up workflows and connect the tools your team already uses."],
  ["Measure and improve", "We set KPIs and reporting so you can see what is working and keep improving."],
];
const VALUES = [
  ["Clarity", "Plain language, clear ownership and processes people can follow."],
  ["Accountability", "Work with a named owner, a deadline and a visible status."],
  ["Practicality", "Solutions sized to your business, not borrowed from a larger one."],
  ["Honesty", "We tell you what works, what does not and what is still in development."],
];

export default async function About() {
  const b = await getBlocks(DEFAULTS);
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <h1 className="max-w-3xl text-4xl font-bold text-navy sm:text-5xl">{b.about_intro.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">{b.about_intro.content}</p>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <section><h2 className="text-2xl font-bold text-navy">{b.about_mission.title}</h2><p className="mt-3 text-slate">{b.about_mission.content}</p></section>
        <section><h2 className="text-2xl font-bold text-navy">{b.about_vision.title}</h2><p className="mt-3 text-slate">{b.about_vision.content}</p></section>
      </div>

      <section className="mt-16" aria-labelledby="approach-h">
        <h2 id="approach-h" className="text-2xl font-bold text-navy">How we solve business problems</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-2">
          {APPROACH.map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{i + 1}</span>
              <div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-slate">{d}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16" aria-labelledby="values-h">
        <h2 id="values-h" className="text-2xl font-bold text-navy">Our values</h2>
        <dl className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
          {VALUES.map(([t, d]) => <div key={t} className="border-l-4 border-teal pl-5"><dt className="font-semibold">{t}</dt><dd className="mt-1 text-slate">{d}</dd></div>)}
        </dl>
      </section>

      <section className="mt-16 max-w-3xl" aria-labelledby="exp-h">
        <h2 id="exp-h" className="text-2xl font-bold text-navy">Operations and technology together</h2>
        <p className="mt-3 text-slate">Our work sits where business operations meets technology: process design, SOPs and KPIs on one side, automation, dashboards, IT support and software development on the other. That combination lets us improve how a business runs and build the systems that keep it running that way.</p>
        <Link href="/contact" className="btn btn-primary mt-8">Start a conversation</Link>
      </section>
    </div>
  );
}
