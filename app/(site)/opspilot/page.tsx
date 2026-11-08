import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, FaqList, PageHero } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "OpsPilot | Business Operations Management Product by OptiFlow",
  description: "Discover OpsPilot, an operations-focused product by OptiFlow designed to help businesses organise leads, tasks, sales, expenses and operational information.",
  openGraph: { url: "/opspilot" },
  alternates: { canonical: "/opspilot" },
};

type Status = "Planned" | "Prototype" | "Available";
// Change an item to "Prototype" or "Available" only once it genuinely works and has been tested.
const CAPS: { name: string; text: string; can: string[]; status: Status }[] = [
  { name: "Lead Management", text: "Organise customer enquiries and monitor their movement through the sales process.", can: ["Lead records", "Customer information", "Enquiry status", "Follow-up tracking", "Lead activity history"], status: "Planned" },
  { name: "Task and Activity Tracking", text: "Organise important activities and monitor their progress.", can: ["Task records", "Assigned responsibilities", "Task statuses", "Due dates", "Activity monitoring"], status: "Planned" },
  { name: "Sales Tracking", text: "Organise sales information to improve visibility into business transactions.", can: ["Sales records", "Transaction details", "Sales summaries", "Sales performance reporting"], status: "Planned" },
  { name: "Expense Management", text: "Record and organise business expenses.", can: ["Expense records", "Expense categories", "Dates and descriptions", "Expense summaries"], status: "Planned" },
  { name: "Business Reporting", text: "Bring selected operational information together for review.", can: ["Business activity summaries", "Lead reports", "Task reports", "Sales summaries", "Expense summaries"], status: "Planned" },
  { name: "Operational Visibility", text: "Provide a more organised view of important business activities. The overall goal is to help businesses reduce information fragmentation and improve awareness of operational activity.", can: [], status: "Planned" },
];

export default function OpsPilot() {
  return (
    <>
      <PageHero title="One Business. Multiple Activities. Better Operational Visibility." art="opspilot"
        alt="Illustration of six planned OpsPilot modules shown with dashed outlines: leads, tasks, sales, expenses, reports and operational visibility"
        intro="OpsPilot is a business operations product by OptiFlow designed to help businesses organise important activities and gain better visibility into the work happening across their operations.">
        <Link href="/contact?service=opspilot" className="btn btn-primary">Express Interest</Link>
        <Link href="/about" className="btn btn-ghost">About OptiFlow</Link>
      </PageHero>

      <section className="border-t border-line bg-white" aria-labelledby="status-h">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div role="note" className="max-w-3xl rounded-md border-l-4 border-teal bg-mist/60 p-5">
            <h2 id="status-h" className="font-semibold">Product status: in development</h2>
            <p className="mt-1 text-slate">OpsPilot is a product in development. Everything described on this page is intended or planned, and none of it is available to customers yet. We will mark each capability as Prototype or Available only once it has been built and tested. The illustration on this page is a conceptual graphic, not a screenshot of the product.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="prob-h">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:py-16">
          <div className="space-y-4 text-slate">
            <h2 id="prob-h" className="text-3xl font-bold text-navy">The problem</h2>
            <p>Running a business involves keeping track of many connected activities. A potential customer submits an enquiry. Someone needs to follow up. A task must be assigned. A sale may be recorded. An expense must be monitored. Management needs to understand what is happening.</p>
            <p>When these activities are managed through disconnected records and scattered tools, important information can become difficult to track.</p>
          </div>
          <div className="text-slate">
            <p className="mt-0 md:mt-12">Business owners may struggle to answer basic operational questions:</p>
            <ul className="mt-3 space-y-2.5">{["Which enquiries are still pending?", "Which activities require attention?", "What tasks are outstanding?", "How are sales progressing?", "What expenses have been recorded?", "What is happening across the business?"].map((q) => <li key={q} className="flex gap-3"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" /><span>{q}</span></li>)}</ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="intro-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 id="intro-h" className="text-3xl font-bold text-navy">Introducing OpsPilot</h2>
          <div className="mt-4 max-w-3xl space-y-4 text-lg text-slate">
            <p>OpsPilot is being developed to help businesses bring selected operational activities into a more organised environment.</p>
            <p>The product's direction is centred on helping business owners and managers organise operational information and understand important business activities more easily. It is being developed as a product of OptiFlow Ops Solutions Ltd.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="caps-h">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <h2 id="caps-h" className="text-3xl font-bold text-navy">Intended product capabilities</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {CAPS.map((c, i) => (
              <li key={c.name} className="rounded-md border border-line bg-white p-6">
                <div className="flex items-start justify-between gap-3"><h3 className="text-xl font-semibold">{i + 1}. {c.name}</h3><span className="shrink-0 rounded bg-mist px-2.5 py-1 text-sm font-semibold text-navy">{c.status}</span></div>
                <p className="mt-2 text-slate">{c.text}</p>
                {c.can.length > 0 && (<><p className="mt-3 text-sm font-semibold">Potential capabilities</p><ul className="mt-2 list-disc space-y-1 pl-5 text-slate">{c.can.map((x) => <li key={x}>{x}</li>)}</ul></>)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="who-h">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2 md:py-16">
          <div>
            <h2 id="who-h" className="text-3xl font-bold text-navy">Who is it for?</h2>
            <p className="mt-3 text-slate">OpsPilot is intended for:</p>
            <ul className="mt-3 space-y-2.5 text-slate">{["Small business owners", "Service businesses", "Growing companies", "Business administrators", "Operations managers", "Teams that need better visibility into daily activities"].map((x) => <li key={x} className="flex gap-3"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" /><span>{x}</span></li>)}</ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-navy">How it is intended to work</h2>
            <dl className="mt-5 space-y-4">
              {[["Capture", "Organise important business information."], ["Manage", "Keep track of leads, tasks and selected activities."], ["Monitor", "Review progress and recorded business information."], ["Report", "Use organised information to support better decisions."]].map(([t, d]) => (<div key={t} className="border-l-4 border-teal pl-5"><dt className="font-semibold">{t}</dt><dd className="mt-1 text-slate">{d}</dd></div>))}
            </dl>
          </div>
        </div>
      </section>

      <section className="border-t border-line" aria-labelledby="faq-h">
        <div className="mx-auto max-w-4xl px-5 py-14">
          <h2 id="faq-h" className="mb-6 text-3xl font-bold text-navy">Frequently asked questions</h2>
          <FaqList items={[
            { q: "Is OpsPilot a service package?", a: "No. OpsPilot is a separate product developed by OptiFlow." },
            { q: "Is OpsPilot included in Launch or Pro?", a: "No. It is separate from the annual service packages." },
            { q: "Can I request a demonstration?", a: "You can express interest and contact OptiFlow for information about demonstration and availability." },
            { q: "Is it available for purchase?", a: "Availability, access and pricing should be confirmed directly by OptiFlow." },
          ]} />
        </div>
      </section>
      <CtaBand title="Take a Step Towards Better Business Operations." text="Express your interest in OpsPilot and receive information about its development and availability." primary="Express Interest" href="/contact?service=opspilot" />
    </>
  );
}
