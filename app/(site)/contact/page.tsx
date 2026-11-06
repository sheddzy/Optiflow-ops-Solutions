import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", description: "Send an enquiry to OptiFlow Ops Solutions about operations, automation, dashboards, IT support, software or OpsPilot.", alternates: { canonical: "/contact" } };

export default function Contact() {
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:grid-cols-[1.3fr_.7fr] md:py-20">
      <div>
        <h1 className="text-4xl font-bold text-navy sm:text-5xl">Contact us</h1>
        <p className="mb-10 mt-5 max-w-xl text-lg text-slate">Tell us what you are trying to fix or build. We will reply to the email address you provide.</p>
        <ContactForm />
      </div>
      <aside aria-label="Other ways to reach us" className="md:pt-24">
        <h2 className="text-xl font-semibold">Prefer another route?</h2>
        <ul className="mt-5 space-y-3">
          <li><a className="font-semibold text-teal-text underline" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
          <li><a className="font-semibold text-teal-text underline" href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
          <li><a className="font-semibold text-teal-text underline" href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a className="font-semibold text-teal-text underline" href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a className="font-semibold text-teal-text underline" href={SITE.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></li>
        </ul>
      </aside>
    </div>
  );
}
