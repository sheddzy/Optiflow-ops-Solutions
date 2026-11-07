import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/Blocks";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Thank You for Contacting OptiFlow", robots: { index: false, follow: false } };

export default async function ThankYou() {
  // Only shown after the server confirmed a successful submission.
  if (!(await cookies()).get("enq_ok")) redirect("/contact");
  return (
    <>
      <PageHero title="Your Enquiry Has Been Received!" art="thanks" alt="Illustration of a large check mark confirming that an enquiry was received"
        intro={<><p>Thank you for taking the time to contact OptiFlow Ops Solutions Ltd. We appreciate your interest in improving your business operations and exploring our solutions.</p><p className="mt-3">Your enquiry has been submitted successfully.</p></>}>
        <Link href="/" className="btn btn-primary">Return to Homepage</Link>
        <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">Chat With Us on WhatsApp</a>
      </PageHero>
      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-2">
          <div><h2 className="text-2xl font-bold text-navy">What happens next?</h2><p className="mt-3 text-slate">Our next step is to review the information you provided and understand the nature of your request. We may contact you using the email address or phone number supplied in your enquiry if additional information is required.</p></div>
          <div><h2 className="text-2xl font-bold text-navy">Explore more</h2><p className="mt-3 text-slate">While you wait, you can explore:</p>
            <ul className="mt-3 space-y-2">{[["/services", "Our Services"], ["/packages", "Annual Packages"], ["/opspilot", "OpsPilot"], ["/portfolio", "Our Portfolio"]].map(([h, t]) => <li key={h}><Link href={h} className="font-semibold text-teal-text underline">{t}</Link></li>)}</ul></div>
        </div>
      </section>
    </>
  );
}
