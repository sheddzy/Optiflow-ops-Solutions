import type { Metadata } from "next";
import Link from "next/link";
import Illustration from "@/components/Illustration";
import { CtaBand, PageHero } from "@/components/Blocks";
import type { IllustrationKey } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "OptiFlow Portfolio | Business Systems, Dashboards and Digital Solutions",
  description: "Explore examples of operational systems, workflow automation, reporting dashboards, project management setups and digital solutions.",
  openGraph: { url: "/portfolio" },
  alternates: { canonical: "/portfolio" },
};

// These are demonstration concepts. Add a client project only when it is real and the client has agreed.
const PROJECTS: { name: string; category: string; art: IllustrationKey; alt: string; overview: string; challenge: string; solution: string; deliverables: string[] }[] = [
  { name: "Business Operations Documentation System", category: "Operations Management", art: "operations", alt: "Illustration of a process map above a checklist representing a sample operations documentation system",
    overview: "A demonstration project showing how a growing service business can organise recurring processes through SOPs, workflow documentation and operational checklists.", challenge: "The business relies on informal instructions and inconsistent task execution.", solution: "Develop a structured documentation system containing process descriptions, responsibilities, checklists and review procedures.", deliverables: ["Sample SOP library", "Process maps", "Responsibility matrix", "Operational checklist"] },
  { name: "Automated Lead Capture Workflow", category: "Workflow Automation", art: "automation", alt: "Illustration of an automation hub connecting email, spreadsheet, notification and calendar tools",
    overview: "A demonstration workflow showing how customer enquiries can be captured and organised automatically.", challenge: "Enquiries are received through multiple channels and are not consistently recorded.", solution: "Connect an enquiry form to a central lead register and configure relevant notifications.", deliverables: ["Enquiry capture form", "Lead spreadsheet", "Notification workflow", "Follow-up status structure"] },
  { name: "Business Performance Dashboard", category: "Reporting and Analytics", art: "dashboards", alt: "Illustration of a dashboard with key figure tiles, bar chart, line chart and donut chart",
    overview: "A sample business dashboard that organises sales, expenses and operating indicators.", challenge: "Management cannot easily understand business performance from scattered records.", solution: "Create a structured spreadsheet and dashboard with defined metrics and visual summaries.", deliverables: ["Organised data sheet", "KPI calculations", "Dashboard", "Monthly reporting view"] },
  { name: "Project Management Workspace", category: "Project Management", art: "projects", alt: "Illustration of a project board with to do, in progress and done columns",
    overview: "A demonstration workspace designed to help a service business organise projects and responsibilities.", challenge: "Tasks and deadlines are difficult to monitor across different communication channels.", solution: "Create a central project workspace with task ownership, due dates and status tracking.", deliverables: ["Project board", "Task structure", "Milestone tracking", "Reporting view"] },
  { name: "Business Website", category: "Website Development", art: "website", alt: "Illustration of a responsive business website on desktop and mobile",
    overview: "A demonstration business website showing how a company can present its services and receive enquiries online.", challenge: "The business lacks a central online location explaining its offerings.", solution: "Develop a responsive website with service pages, contact information and enquiry functionality.", deliverables: ["Homepage", "About page", "Services pages", "Contact page", "Responsive layouts"] },
  { name: "Business Email Infrastructure", category: "Digital Infrastructure", art: "email", alt: "Illustration of a business email inbox beside an envelope with a verified badge",
    overview: "A demonstration of a professional domain and business email configuration.", challenge: "The business relies on personal email addresses and lacks organised domain infrastructure.", solution: "Configure a domain and agreed business email environment.", deliverables: ["Domain configuration", "Email setup", "Email signatures", "Handover documentation"] },
];

export default function Portfolio() {
  return (
    <>
      <PageHero title="See How Practical Business Systems Come Together." art="portfolio" alt="Illustration of three demonstration project cards: a documentation system, a performance dashboard and a project board, each marked as a demo"
        intro="Explore examples of the types of operational and technology solutions OptiFlow can help businesses implement." />

      <section className="border-t border-line bg-white" aria-labelledby="intro-h">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <h2 id="intro-h" className="text-2xl font-bold text-navy">Every business has different operational needs</h2>
          <p className="mt-3 max-w-3xl text-slate">Some need clearer processes. Others need better reporting, connected applications or a more structured way to manage projects. These projects show how practical solutions can be designed around specific business challenges.</p>
          <p role="note" className="mt-5 max-w-3xl rounded-md border-l-4 border-teal bg-mist/60 p-4 text-sm"><strong>Please note:</strong> every project below is a demonstration project that shows OptiFlow's approach and capabilities. None is a completed client engagement, and none is evidence of measurable business results.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="proj-h">
        <h2 id="proj-h" className="sr-only">Demonstration projects</h2>
        <ul className="grid gap-8 md:grid-cols-2">
          {PROJECTS.map((p) => (
            <li key={p.name} className="flex flex-col overflow-hidden rounded-md border border-line bg-white">
              <Illustration name={p.art} label={p.alt} className="rounded-none" />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap gap-2"><span className="rounded bg-mist px-2.5 py-1 text-sm font-semibold text-navy">{p.category}</span><span className="rounded bg-[#fdf1d6] px-2.5 py-1 text-sm font-semibold text-[#7a5200]">Demonstration project</span></div>
                <h3 className="mt-3 text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 text-slate">{p.overview}</p>
                <dl className="mt-4 space-y-3 text-slate">
                  <div><dt className="font-semibold text-ink">Business challenge</dt><dd>{p.challenge}</dd></div>
                  <div><dt className="font-semibold text-ink">Solution concept</dt><dd>{p.solution}</dd></div>
                  <div><dt className="font-semibold text-ink">Deliverables</dt><dd><ul className="mt-1 list-disc pl-5">{p.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></dd></div>
                </dl>
                <Link href="/contact" className="btn btn-ghost mt-6 self-start">Discuss a Similar Project</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand title="Have a Business Challenge We Can Help Solve?" text="Let's discuss the system you want to build." primary="Discuss Your Project" />
    </>
  );
}
