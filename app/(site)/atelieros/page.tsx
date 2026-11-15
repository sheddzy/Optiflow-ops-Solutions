import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, FaqList, PageHero } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "AtelierOS | Fashion House Management Platform by OptiFlow",
  description: "AtelierOS is a fashion-house management platform in development by OptiFlow, designed to bring client records, measurements, orders, production and business operations into one workspace.",
  alternates: { canonical: "/atelieros" },
};

const MODULES = [
  ["Client records and measurements", "Keep customer profiles and measurement records organised for easier reference."],
  ["Orders and production tracking", "Follow orders from customer request through production stages and delivery."],
  ["Inventory management", "Keep visibility over materials, stock movement and items used in production."],
  ["Finance and payments", "Organise sales, payment records and business financial activity."],
  ["Staff and work management", "Coordinate team responsibilities and work in progress."],
  ["Fashion-house workspace", "Bring key fashion-house information together in a structured workspace."],
];

export default function AtelierOS() {
  return (
    <>
      <PageHero title="Fashion House Management, Simplified." art="projects"
        alt="Conceptual illustration representing a fashion-house management workspace"
        intro="AtelierOS is a fashion-house management platform being developed by OptiFlow Ops Solutions Ltd. It is designed around the day-to-day work of fashion businesses, from customer measurements and orders to production and business records.">
        <Link href="/contact?service=atelieros" className="btn btn-primary">Discuss AtelierOS</Link>
        <Link href="/portfolio" className="btn btn-ghost">View our portfolio</Link>
      </PageHero>

      <section className="border-t border-line bg-white" aria-labelledby="status-h">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div role="note" className="max-w-3xl rounded-md border-l-4 border-teal bg-mist/60 p-5">
            <h2 id="status-h" className="font-semibold">Product status: in development</h2>
            <p className="mt-1 text-slate">AtelierOS is under active development. The capabilities below describe the product direction and should not be interpreted as confirmation that every module is currently available. Product access and rollout details will be confirmed as development progresses.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="why-h">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-text">Built for fashion businesses</p>
            <h2 id="why-h" className="mt-2 text-3xl font-bold text-navy">One workspace for the work behind every order.</h2>
          </div>
          <div className="space-y-4 text-slate">
            <p>Fashion businesses manage more than designs. Each order can involve customer details, measurements, materials, production tasks, staff coordination, payments and delivery timelines.</p>
            <p>When these records live in separate notebooks, spreadsheets and chat threads, it becomes harder to maintain a clear view of what is happening.</p>
            <p>AtelierOS is being designed to connect these operational activities in a single fashion-house workspace.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="modules-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 id="modules-h" className="text-3xl font-bold text-navy">Planned product modules</h2>
          <p className="mt-3 max-w-3xl text-slate">The platform is being developed around the following areas. Specific features and availability may change during development.</p>
          <ul className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(([name, description], i) => (
              <li key={name} className="rounded-md border border-line bg-white p-6">
                <span className="text-sm font-semibold text-teal-text">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-navy">{name}</h3>
                <p className="mt-2 text-slate">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="origin-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="max-w-3xl">
            <h2 id="origin-h" className="text-3xl font-bold text-navy">Developed by OptiFlow.</h2>
            <p className="mt-4 text-lg text-slate">AtelierOS is a proprietary software product from OptiFlow Ops Solutions Ltd. Its first implementation is being developed in the context of Casa of Oshafi, helping ground the product in the real workflows of a fashion business.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="faq-h">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <h2 id="faq-h" className="mb-6 text-3xl font-bold text-navy">Frequently asked questions</h2>
          <FaqList items={[
            { q: "Is AtelierOS a service package?", a: "No. AtelierOS is a separate software product developed by OptiFlow Ops Solutions Ltd." },
            { q: "Is AtelierOS available to subscribe to now?", a: "The product is in development. Availability, onboarding and pricing will be announced when confirmed." },
            { q: "Who is AtelierOS designed for?", a: "It is being designed for fashion houses, tailoring businesses and fashion production teams that need more organised operational records." },
            { q: "Can my fashion business express interest?", a: "Yes. Use the contact link on this page and mention AtelierOS." },
          ]} />
        </div>
      </section>
      <CtaBand title="Bring more structure to your fashion business." text="Contact OptiFlow to discuss AtelierOS and follow its development." primary="Express Interest" href="/contact?service=atelieros" />
    </>
  );
}
