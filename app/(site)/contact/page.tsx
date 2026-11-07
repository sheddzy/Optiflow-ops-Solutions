import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import Illustration from "@/components/Illustration";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact OptiFlow | Discuss Your Business Operations Needs",
  description: "Contact OptiFlow Ops Solutions to discuss business operations setup, automation, dashboards, project management, annual packages and digital solutions.",
  alternates: { canonical: "/contact" },
};

const link = "font-semibold text-teal-text underline";

export default function Contact() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-[1.1] text-navy sm:text-5xl">Let's Talk About What Your Business Needs.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">Tell us about your business, the challenges you are experiencing and the type of support you are looking for. We will review your enquiry and discuss the next steps.</p>
        </div>
        <Illustration name="contact" label="Illustration of a chat bubble and an envelope representing enquiries sent by WhatsApp or email" />
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-14 md:grid-cols-[1.3fr_.7fr] md:py-16">
          <div>
            <h2 className="text-2xl font-bold text-navy">Tell Us About Your Business.</h2>
            <p className="mb-8 mt-2 text-slate">Complete the form below so we can understand your requirements and direct your enquiry appropriately. Then choose whether to send it by email or on WhatsApp.</p>
            <Suspense fallback={<p className="text-slate">Loading the enquiry form…</p>}><ContactForm /></Suspense>
          </div>
          <aside aria-label="Contact details" className="space-y-9">
            <div>
              <h2 className="text-xl font-semibold">Contact details</h2>
              <dl className="mt-4 space-y-4">
                <div><dt className="font-semibold">General business enquiries</dt><dd><a className={link} href={`mailto:${SITE.enquiryEmail}`}>{SITE.enquiryEmail}</a></dd></div>
                <div><dt className="font-semibold">Operations enquiries</dt><dd><a className={link} href={`mailto:${SITE.email}`}>{SITE.email}</a></dd></div>
                <div><dt className="font-semibold">WhatsApp</dt><dd>{SITE.phoneDisplay}<br /><a className={link} href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">Open WhatsApp chat</a></dd></div>
                <div><dt className="font-semibold">Social media</dt><dd><a className={link} href={SITE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>, <a className={link} href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a> and <a className={link} href={SITE.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></dd></div>
              </dl>
            </div>
            <div>
              <h2 className="text-xl font-semibold">After you submit</h2>
              <p className="mt-3 text-slate">Once your enquiry is successfully submitted, we will review the information and follow up using your provided contact details.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Prefer a direct conversation?</h2>
              <p className="mt-3 text-slate">Send us a WhatsApp message and briefly describe what you need.</p>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">Chat With OptiFlow</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
