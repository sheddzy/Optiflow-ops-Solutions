import type { Metadata } from "next";
import { CtaBand, FaqList, PageHero } from "@/components/Blocks";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | OptiFlow Ops Solutions",
  description: "Find answers about OptiFlow's services, annual packages, business email, websites, implementation and OpsPilot.",
  openGraph: { url: "/faq" },
  alternates: { canonical: "/faq" },
};

const GROUPS: { title: string; items: { q: string; a: string }[] }[] = [
  { title: "About OptiFlow", items: [
    { q: "What does OptiFlow Ops Solutions Ltd do?", a: "OptiFlow helps businesses improve their operations through process documentation, workflow automation, dashboards, project management, business email and website solutions." },
    { q: "Who can use your services?", a: "Our services are designed primarily for small and medium-sized businesses, consulting firms, training organisations, professional service providers and growing teams." },
    { q: "Do you work with businesses outside Nigeria?", a: "Enquiries from businesses outside Nigeria can be assessed based on service requirements, technical scope and delivery arrangements." },
    { q: "Do you offer customised solutions?", a: "Yes. We assess business needs and agree on the appropriate deliverables before implementation." },
  ] },
  { title: "Services", items: [
    { q: "Can you help us document our business processes?", a: "Yes. We provide SOP development, workflow documentation, process mapping and related operational documentation." },
    { q: "Can you automate our existing processes?", a: "We can assess your current workflow and determine which activities can be automated using supported tools." },
    { q: "Can you build a dashboard using our existing data?", a: "Yes. We can review your existing spreadsheet or data source and determine whether it can support the required dashboard." },
    { q: "Can you set up ClickUp or Trello?", a: "Yes. We can help configure supported project management tools around your business workflow." },
    { q: "Do you develop websites?", a: "Yes. We provide business website design and development based on agreed requirements." },
  ] },
  { title: "Packages", items: [
    { q: "Are Launch and Pro annual packages?", a: "Yes. Both packages are billed annually." },
    { q: "What is the price of Launch?", a: "Launch costs ₦200,000 per year." },
    { q: "What is the price of Pro?", a: "Pro costs ₦500,000 per year." },
    { q: "Does Launch include a website?", a: "No. Website development is included in Pro." },
    { q: "Does Pro include business email?", a: "Yes. It includes the agreed business email setup and associated Launch package inclusions." },
    { q: "Are additional email users included?", a: "Account limits depend on the selected Zoho subscription and agreed package scope. Additional users may attract additional costs." },
    { q: "Do you include premium domains?", a: "Premium domains are subject to availability and separate cost confirmation." },
    { q: "Are renewals automatic?", a: "No. We provide reminders. The client must approve and fund renewals." },
    { q: "Can I upgrade from Launch to Pro?", a: "Yes. Contact us to assess the upgrade requirements and cost." },
    { q: "Can I pay online?", a: "Yes, where online payment is enabled you can pay for a package securely through Paystack from the package page. You can also send an enquiry first." },
  ] },
  { title: "Email and digital infrastructure", items: [
    { q: "Which email provider do you use?", a: "Our package implementation uses Zoho Business Email, subject to the selected subscription." },
    { q: "Which domain registrar do you use?", a: "Namecheap is used for domain registration support." },
    { q: "Can you configure an existing domain?", a: "Yes, subject to domain access and technical requirements." },
  ] },
  { title: "Website support", items: [
    { q: "Will my website work on mobile?", a: "Responsive layouts are part of the agreed website development scope." },
    { q: "Does Pro include unlimited website updates?", a: "No. It includes basic maintenance and minor updates within the agreed scope. Major changes may require additional charges." },
  ] },
  { title: "OpsPilot", items: [
    { q: "What is OpsPilot?", a: "OpsPilot is a business operations product developed by OptiFlow." },
    { q: "Is it part of the Launch or Pro package?", a: "No. OpsPilot is separate from the annual packages." },
    { q: "Can I request product information?", a: "Yes. Use the OpsPilot enquiry button or contact OptiFlow." },
    { q: "Is every listed feature currently available?", a: "No. OpsPilot is in development, and its product page marks each capability as planned, prototype or available." },
  ] },
  { title: "Getting started", items: [
    { q: "How do I request a service?", a: "Submit the contact form or contact us through WhatsApp or email." },
    { q: "Will I receive a quotation before work begins?", a: "The agreed scope, deliverables and costs should be confirmed before implementation begins." },
  ] },
];

export default function Faq() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: GROUPS.flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero title="Frequently Asked Questions" art="faq" alt="Illustration of a question bubble and an answer bubble with a check mark" intro="Answers about our services, annual packages, business email, websites, implementation and OpsPilot." />
      <div className="mx-auto max-w-4xl space-y-10 px-5 pb-16">
        {GROUPS.map((g) => (<section key={g.title} aria-labelledby={`g-${g.title}`}><h2 id={`g-${g.title}`} className="mb-4 text-2xl font-bold text-navy">{g.title}</h2><FaqList items={g.items} /></section>))}
      </div>
      <CtaBand title="Still have a question?" text="Ask us directly and we will help you find the right starting point." />
    </>
  );
}
