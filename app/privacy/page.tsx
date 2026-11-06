import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice", description: "How OptiFlow Ops Solutions handles details submitted through its enquiry form.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 md:py-20">
      <h1 className="text-4xl font-bold text-navy">Privacy notice</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-slate">
        <p>This notice explains what happens to the details you send through the enquiry form on this website. Have it reviewed against the data protection rules that apply to your business, such as the Nigeria Data Protection Act, before relying on it.</p>
        <h2 className="pt-2 text-xl font-semibold text-ink">What we collect</h2>
        <p>Your name, email address, company, phone number (if you give one), the service you are interested in, and your message.</p>
        <h2 className="pt-2 text-xl font-semibold text-ink">Why we collect it</h2>
        <p>To reply to your enquiry and to manage our business relationship with you. We do not sell your details.</p>
        <h2 className="pt-2 text-xl font-semibold text-ink">Where it is stored</h2>
        <p>Enquiries are stored in a database hosted by our service provider Supabase and are visible only to the OptiFlow administrator.</p>
        <h2 className="pt-2 text-xl font-semibold text-ink">Your choices</h2>
        <p>You can ask us to correct or delete your details at any time by emailing <a className="font-semibold text-teal-text underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </div>
  );
}
