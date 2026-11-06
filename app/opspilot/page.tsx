import type { Metadata } from "next";
import Link from "next/link";
import { getBlocks } from "@/lib/content";

export const metadata: Metadata = { title: "OpsPilot", description: "OpsPilot is a business operations management product from OptiFlow Ops Solutions, currently in development. Ask about early access.", alternates: { canonical: "/opspilot" } };
export const revalidate = 60;

const DEFAULTS = { opspilot_intro: { title: "OpsPilot", content: "OpsPilot is a business operations management product developed by OptiFlow Ops Solutions Ltd." } };

// Status is explicit. Update it here only when a feature is genuinely working, and test it first.
const FEATURES: { name: string; text: string; status: "Planned" | "Prototype" | "Available" }[] = [
  { name: "Lead management", text: "Capture and follow up business leads in one place.", status: "Planned" },
  { name: "Task and activity tracking", text: "Assign work and see what is done, late or blocked.", status: "Planned" },
  { name: "Sales tracking", text: "Follow opportunities and sales activity.", status: "Planned" },
  { name: "Expense management", text: "Record and review business expenses.", status: "Planned" },
  { name: "Business reporting", text: "Summaries of activity and performance.", status: "Planned" },
  { name: "Operational visibility", text: "One view of how the business is running.", status: "Planned" },
];

export default async function OpsPilot() {
  const b = await getBlocks(DEFAULTS);
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <h1 className="text-4xl font-bold text-navy sm:text-5xl">{b.opspilot_intro.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate">{b.opspilot_intro.content} It is a product of OptiFlow, not a separate company.</p>

      <div role="note" className="mt-10 max-w-2xl rounded-md border-l-4 border-teal bg-white p-5">
        <p className="font-semibold">Current status: in development</p>
        <p className="mt-1 text-slate">The capabilities below are planned. None is available to customers yet. We will mark each one as Prototype or Available only once it is working and tested.</p>
      </div>

      <ul className="mt-12 divide-y divide-line border-y border-line">
        {FEATURES.map((f) => (
          <li key={f.name} className="grid items-center gap-2 py-6 md:grid-cols-[1fr_1.4fr_auto] md:gap-8">
            <h2 className="text-lg font-semibold">{f.name}</h2>
            <p className="text-slate">{f.text}</p>
            <span className="w-fit rounded bg-mist px-2.5 py-1 text-sm font-semibold text-navy">{f.status}</span>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/contact" className="btn btn-primary">Ask about early access</Link>
        <Link href="/services" className="btn btn-ghost">Our services</Link>
      </div>
    </div>
  );
}
