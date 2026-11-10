import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "About OptiFlow | Business Operations and Technology Solutions",
  description: "Learn about OptiFlow Ops Solutions, our approach to operations management, process improvement, automation and business technology.",
  alternates: { canonical: "/about" },
};

const STAND = [
  ["Clarity", "Business processes should be understandable. Employees should know what is expected, managers should understand responsibilities and business owners should have access to useful information."],
  ["Efficiency", "Time and resources should be used thoughtfully. We look for opportunities to reduce repetitive work and unnecessary operational friction."],
  ["Accountability", "Good systems help clarify who is responsible for tasks, decisions and deliverables."],
  ["Practical Innovation", "Technology should support the business, not create more problems. We prioritise appropriate, maintainable solutions."],
  ["Continuous Improvement", "Business systems should evolve as operations, customers and organisational requirements change."],
];
const PROBLEMS = ["Poorly documented processes", "Inconsistent employee workflows", "Manual and repetitive administrative work", "Limited performance reporting", "Unclear task ownership", "Weak project coordination", "Scattered business information", "Inadequate digital infrastructure", "Difficulty monitoring operational performance"];
const SERVE = [
  ["Small and Medium-Sized Businesses", "Businesses that need better operational structures as their activities increase."],
  ["Consulting and Professional Service Firms", "Organisations that need organised client management, project coordination, reporting and internal processes."],
  ["Training and Educational Businesses", "Businesses that need structured training operations, participant coordination, follow-ups and reporting."],
  ["Online Businesses and Retailers", "Businesses that need organised lead management, sales monitoring, customer follow-ups and digital workflows."],
  ["Growing Teams", "Businesses that need clearer responsibilities, project management systems and operational documentation."],
];

export default function About() {
  return (
    <>
      <PageHero title="Better Business Operations Begin With Better Systems." art="about" alt="Illustration of three team members connected by a flowing line leading to a completed goal, representing people and process working together"
        intro="We help businesses bring structure to their operations, simplify everyday processes and use technology more effectively.">
        <Link href="/contact" className="btn btn-primary">Let's Discuss Your Business Needs</Link>
      </PageHero>

      <section className="border-t border-line bg-white" aria-labelledby="who-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="who-h" className="text-3xl font-bold text-navy">Who we are</h2>
          <div className="mt-6 grid gap-6 text-lg leading-relaxed text-slate md:grid-cols-2">
            <div className="space-y-4">
              <p>OptiFlow Ops Solutions Ltd is a business operations and technology solutions company focused on helping businesses improve the way they work.</p>
              <p>We recognise that many businesses experience operational difficulties as they grow. Processes that once worked for a small team may become difficult to manage when the number of customers, employees, transactions and responsibilities increases.</p>
              <p>Business owners may find themselves constantly monitoring routine activities, while employees struggle with unclear procedures and disconnected systems.</p>
            </div>
            <div className="space-y-4">
              <p>Our work focuses on addressing these challenges through practical operational structures and technology.</p>
              <p>We help businesses document processes, organise responsibilities, automate repetitive activities, develop reporting systems and establish essential digital infrastructure.</p>
              <p>Our approach is grounded in one principle: a useful business system should make work easier to understand, manage and improve.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:py-20">
        <div><h2 className="text-2xl font-bold text-navy">Our mission</h2><p className="mt-3 text-lg text-slate">To help businesses operate more effectively by simplifying processes, strengthening operational systems and implementing practical technology solutions.</p></div>
        <div><h2 className="text-2xl font-bold text-navy">Our vision</h2><p className="mt-3 text-lg text-slate">To become a trusted operations and technology partner for businesses seeking sustainable growth through better systems and improved execution.</p></div>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="stand-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="stand-h" className="text-3xl font-bold text-navy">What we stand for</h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {STAND.map(([t, d]) => (<div key={t} className="border-l-4 border-teal pl-5"><dt className="text-lg font-semibold">{t}</dt><dd className="mt-1 text-slate">{d}</dd></div>))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:py-20">
        <div>
          <h2 className="text-3xl font-bold text-navy">The problems we help businesses address</h2>
          <p className="mt-4 text-slate">We work with businesses experiencing challenges such as:</p>
          <ul className="mt-4 space-y-2.5 text-slate">{PROBLEMS.map((p) => <li key={p} className="flex gap-3"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" /><span>{p}</span></li>)}</ul>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-navy">Our approach</h2>
          <div className="mt-4 space-y-4 text-slate">
            <p>We do not assume that every business needs the same solution. Our process starts with understanding the business.</p>
            <p>We examine the current way of working, identify the most important challenges and recommend an appropriate solution based on the business's needs and resources.</p>
            <p>Depending on the engagement, this may involve documenting a process, designing a workflow, configuring an application, developing a dashboard or implementing a digital solution.</p>
            <p>We aim to leave clients with systems they can understand and use, rather than technology they cannot manage independently.</p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white" aria-labelledby="serve-h">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <h2 id="serve-h" className="text-3xl font-bold text-navy">Who we serve</h2>
          <p className="mt-4 text-slate">Our services are designed for:</p>
          <dl className="mt-8 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {SERVE.map(([t, d]) => (<div key={t}><dt className="font-semibold">{t}</dt><dd className="mt-1 text-slate">{d}</dd></div>))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:py-20" aria-labelledby="commit-h">
        <h2 id="commit-h" className="text-3xl font-bold text-navy">Our commitment</h2>
        <div className="mt-4 max-w-3xl space-y-4 text-lg text-slate">
          <p>We are committed to understanding the problem before recommending the solution.</p>
          <p>Our objective is to help businesses establish systems that support their everyday work and provide a stronger foundation for growth.</p>
        </div>
      </section>
      <CtaBand title="Let's Discuss Your Business Needs." text="Tell us what you would like to improve and we will suggest where to start." />
    </>
  );
}
