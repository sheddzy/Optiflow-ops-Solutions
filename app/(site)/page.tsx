import type { Metadata } from "next";
import Link from "next/link";
import FlowLines from "@/components/FlowLines";
import { CtaBand, ServiceCard } from "@/components/Blocks";
import Illustration from "@/components/Illustration";
import { SERVICES } from "@/lib/services-data";
import { PACKAGES, naira } from "@/lib/packages";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "OptiFlow Ops Solutions | Business Operations & Technology Solutions" },
  description: "OptiFlow helps businesses improve operations through process documentation, workflow automation, reporting dashboards, project management and digital solutions.",
  alternates: { canonical: "/" },
};

const PROBLEMS = [
  ["Too Much Manual Work", "Your team repeatedly enters the same information, sends routine messages, updates spreadsheets and follows up with customers manually.", "We identify repetitive activities and develop practical automation workflows that reduce unnecessary manual effort."],
  ["Disorganised Business Processes", "Employees perform tasks differently because procedures are not documented or responsibilities are unclear.", "We create SOPs, process maps, workflows and operational documentation that establish more consistent ways of working."],
  ["Poor Performance Visibility", "You have business information but cannot easily understand sales performance, expenses, project progress or employee activities.", "We organise relevant information into dashboards and reports that support better operational decisions."],
  ["Difficult Project Coordination", "Projects experience delays because deadlines, responsibilities and progress are not properly monitored.", "We establish project management systems that organise tasks, milestones, ownership and reporting."],
  ["Weak Digital Infrastructure", "Your business lacks professional email, a proper website or essential digital tools.", "We implement business email, domain configuration, websites and relevant digital integrations."],
  ["Too Much Dependence on the Business Owner", "Routine decisions and daily activities constantly require the business owner's attention.", "We help establish clearer processes, responsibilities and monitoring systems to support more structured delegation."],
];

const HOW = [
  ["Understand Your Business", "We begin by understanding your business model, current operations, existing tools and the challenges you want to address."],
  ["Identify the Gaps", "We examine the processes involved and identify where unnecessary work, poor coordination, information gaps or operational weaknesses occur."],
  ["Design the Solution", "We develop a practical solution with clear deliverables, responsibilities, tools and implementation requirements."],
  ["Implement and Configure", "We document processes, configure systems, build workflows or develop the agreed digital solution."],
  ["Test and Handover", "We test the agreed functionality, explain how to use the system and provide the relevant documentation."],
  ["Support and Improve", "Where included in the engagement, we provide maintenance and support to help the solution remain useful."],
];

const WHY = [
  ["Practical, Not Complicated", "We focus on solutions that address actual business problems instead of introducing unnecessary complexity."],
  ["Operations Before Tools", "We understand the process first and then identify the technology that supports it."],
  ["Solutions Built Around Your Needs", "We consider your business size, resources, existing systems and objectives."],
  ["A Connected Approach", "We understand that processes, people, reporting and technology must work together."],
  ["Clear Deliverables", "We aim to define what will be delivered, how it will be implemented and how it will be handed over."],
];

export default function Home() {
  const org = { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: `${SITE.url}/brand/logo.png`, email: SITE.enquiryEmail, telephone: SITE.phoneDisplay, slogan: SITE.tagline, sameAs: [SITE.linkedin, SITE.instagram, SITE.facebook] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.4rem]">Build Better Business Systems. Operate Smarter. Grow With Confidence.</h1>
          <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-slate">
            <p>Running a business should not mean spending every day chasing tasks, correcting avoidable mistakes, managing scattered information or handling repetitive work manually.</p>
            <p>OptiFlow Ops Solutions helps businesses bring structure to their operations through better processes, practical automation, organised reporting and digital technology.</p>
            <p>We help you build the systems that make everyday business activities easier to manage, monitor and improve.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className="btn btn-primary">Explore Our Services</Link>
            <Link href="/contact" className="btn btn-ghost">Talk to an Operations Specialist</Link>
          </div>
          <p className="mt-6 text-sm font-medium text-slate">Business Operations | Automation | Reporting | Project Management | Digital Solutions</p>
        </div>
        <FlowLines className="w-full" />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="intro-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="intro-h" className="max-w-3xl text-3xl font-bold text-navy">Your Business Needs More Than Hard Work. It Needs Better Systems.</h2>
          <div className="mt-6 grid gap-6 text-lg leading-relaxed text-slate md:grid-cols-2">
            <div className="space-y-4">
              <p>Every growing business reaches a point where informal ways of working are no longer enough.</p>
              <p>Tasks become harder to coordinate. Information gets scattered across spreadsheets and communication channels. Employees depend on constant instructions. Business owners struggle to understand what is happening across their operations.</p>
            </div>
            <div className="space-y-4">
              <p>These challenges are not always caused by a lack of effort. Often, they are caused by processes and systems that have not developed alongside the business.</p>
              <p>At OptiFlow, we help businesses address these operational gaps. We examine how work currently happens, identify opportunities for improvement and implement practical systems that support consistency, accountability and better decision-making. Our approach combines operational thinking with technology that makes business activities easier to manage.</p>
            </div>
          </div>
          <Link href="/about" className="btn btn-ghost mt-8">Discover What We Do</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20" aria-labelledby="problems-h">
        <h2 id="problems-h" className="max-w-3xl text-3xl font-bold text-navy">Is Your Business Becoming More Difficult to Manage?</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate">As a business grows, the number of activities, people and decisions involved in daily operations also increases. Without the right systems, this growth can create unnecessary complexity.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PROBLEMS.map(([t, d, h]) => (
            <article key={t} className="rounded-md border border-line bg-white p-6">
              <h3 className="text-lg font-semibold text-ink">{t}</h3>
              <p className="mt-2 text-slate">{d}</p>
              <p className="mt-3 border-l-4 border-teal pl-4"><strong>How we help:</strong> <span className="text-slate">{h}</span></p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="services-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="services-h" className="max-w-3xl text-3xl font-bold text-navy">Practical Solutions for Better Business Operations</h2>
          <p className="mt-4 max-w-3xl text-lg text-slate">Whether you need to improve internal processes, automate repetitive work or establish your digital infrastructure, OptiFlow provides solutions designed around your business requirements.</p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.map((s) => <ServiceCard key={s.slug} s={s} />)}</ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20" aria-labelledby="how-h">
        <h2 id="how-h" className="max-w-3xl text-3xl font-bold text-navy">A Practical Approach From Problem to Implementation</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {HOW.map(([t, d], i) => (
            <li key={t} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{i + 1}</span><div><h3 className="font-semibold">Step {i + 1}: {t}</h3><p className="mt-1 text-slate">{d}</p></div></li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="pk-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="pk-h" className="max-w-3xl text-3xl font-bold text-navy">Get Your Business Digital Foundation in Place</h2>
          <p className="mt-4 max-w-3xl text-lg text-slate">If your immediate priority is establishing professional business email, domain infrastructure or a website, our annual packages provide a straightforward starting point.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {PACKAGES.map((p) => (
              <article key={p.id} className="flex flex-col rounded-md border border-line p-7">
                <h3 className="text-2xl font-bold text-navy">{p.name} Package</h3>
                <p className="mt-1 text-2xl font-bold">{naira(p.price)} <span className="text-base font-medium text-slate">per year</span></p>
                <p className="mt-3 flex-1 text-slate">{p.summary}</p>
                <Link href={`/packages/${p.id}`} className="btn btn-primary mt-6 self-start">View {p.name} Package</Link>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate">Package inclusions, account limits and third-party subscription terms are subject to the agreed package scope.</p>
          <Link href="/packages" className="btn btn-ghost mt-4">Compare Packages</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[.9fr_1.1fr] md:py-20" aria-labelledby="ops-h">
        <Illustration name="opspilot" label="Illustration of six planned OpsPilot modules shown with dashed outlines: leads, tasks, sales, expenses, reports and operational visibility" />
        <div>
          <h2 id="ops-h" className="text-3xl font-bold text-navy">Better Operational Visibility Starts With Better Information.</h2>
          <div className="mt-4 space-y-4 text-lg text-slate">
            <p>Businesses need more than individual spreadsheets and disconnected tools to understand their day-to-day activities.</p>
            <p>OpsPilot is a business operations product being developed by OptiFlow to help bring important operational activities into a more organised environment. Its intended capabilities include lead management, task and activity tracking, sales tracking, expense management and business reporting.</p>
            <p>Our goal is to make it easier for business owners and managers to understand important activities and maintain better operational visibility.</p>
          </div>
          <Link href="/opspilot" className="btn btn-ghost mt-8">Discover OpsPilot</Link>
        </div>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="pf-h">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.1fr_.9fr] md:py-20">
          <div>
            <h2 id="pf-h" className="text-3xl font-bold text-navy">Practical Solutions. Real Business Applications.</h2>
            <div className="mt-4 space-y-4 text-lg text-slate">
              <p>Explore examples of the operational systems, dashboards, workflows and digital solutions that OptiFlow can help businesses implement.</p>
              <p>Our portfolio demonstrates how practical systems can be designed around specific business needs. Demonstration work is clearly identified as sample projects, not client engagements.</p>
            </div>
            <Link href="/portfolio" className="btn btn-ghost mt-8">Explore Our Portfolio</Link>
          </div>
          <Illustration name="portfolio" label="Illustration of three demonstration project cards: a documentation system, a performance dashboard and a project board, each marked as a demo" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20" aria-labelledby="why-h">
        <h2 id="why-h" className="text-3xl font-bold text-navy">Why Businesses Work With OptiFlow</h2>
        <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {WHY.map(([t, d]) => (<div key={t} className="border-l-4 border-teal pl-5"><dt className="text-lg font-semibold">{t}</dt><dd className="mt-1 text-slate">{d}</dd></div>))}
        </dl>
      </section>

      <CtaBand title="Let's Make Your Business Easier to Manage." text="Whether you are struggling with manual processes, disorganised operations, poor reporting or an incomplete digital presence, OptiFlow can help you identify a practical way forward. Tell us about your business and the challenges you want to solve." primary="Start a Conversation" />
    </>
  );
}
