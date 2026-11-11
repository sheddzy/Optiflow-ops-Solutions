import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Get Started | OptiFlow Ops Solutions",
  description: "Tell OptiFlow what your business needs. Submit a service enquiry to discuss operations setup, workflow automation, dashboards and digital solutions.",
  alternates: { canonical: "/get-started" },
};

export default function GetStarted() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-14 md:py-20">
        <p className="font-semibold text-teal-text">GET STARTED WITH OPTIFLOW</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-navy sm:text-5xl">Tell Us What Your Business Needs.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">Share a few details about your business and the support you need. We will review your requirements and follow up with the appropriate next steps.</p>
      </section>
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-4xl px-5 py-12 md:py-16">
          <h2 className="text-2xl font-bold text-navy">Start your service enquiry</h2>
          <p className="mb-8 mt-2 text-slate">Complete the form below so we can understand your requirements.</p>
          <Suspense fallback={<p className="text-slate">Loading the enquiry form…</p>}>
            <ContactForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
