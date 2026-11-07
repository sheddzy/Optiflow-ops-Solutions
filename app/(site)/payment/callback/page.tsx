import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/Blocks";
import { getPackage, naira } from "@/lib/packages";
import { paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Payment Status | OptiFlow", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Callback({ searchParams }: { searchParams: Promise<{ reference?: string; trxref?: string }> }) {
  const sp = await searchParams;
  const reference = (sp.reference ?? sp.trxref ?? "").slice(0, 100);
  const v = reference && paystackConfigured() ? await verifyTransaction(reference) : { ok: false as const };

  const pkg = v.ok ? getPackage(String(v.metadata?.package ?? "")) : undefined;
  const amountOk = v.ok && !!pkg && v.amountKobo === pkg.price * 100 && v.currency === "NGN";
  const paid = v.ok && v.status === "success" && amountOk;
  const needsReview = v.ok && v.status === "success" && !amountOk;

  const contact = (<><a href={`mailto:${SITE.enquiryEmail}`} className="font-semibold text-teal-text underline">{SITE.enquiryEmail}</a> or <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-text underline">WhatsApp</a></>);

  if (paid && pkg) {
    return (
      <>
        <PageHero title="Payment received. Thank you!" art="thanks" alt="Illustration of a large check mark confirming a successful payment"
          intro={<><p>We have confirmed your payment for the <strong>{pkg.name} package</strong> ({naira(pkg.price)} per year).</p><p className="mt-3 text-base">Payment reference: <strong>{reference}</strong>. Please keep it for your records.</p></>}>
          <Link href="/" className="btn btn-primary">Return to Homepage</Link>
        </PageHero>
        <section className="border-t border-line bg-white"><div className="mx-auto max-w-3xl px-5 py-12">
          <h2 className="text-2xl font-bold text-navy">What happens next</h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-slate">
            <li>We contact you using the email address and phone number you gave us to confirm your requirements.</li>
            <li>We confirm the domain name{pkg.id === "pro" ? ", the number of licensed email users and your website requirements" : " and your email account requirements"}.</li>
            <li>We confirm the scope and your service agreement, then begin implementation.</li>
            <li>We test, hand over and record your renewal dates so we can remind you ahead of expiry.</li>
          </ol>
          <p className="mt-6 text-slate">Questions in the meantime? Reach us at {contact}.</p>
        </div></section>
      </>
    );
  }

  const failed = v.ok && v.status && v.status !== "success";
  const heading = needsReview ? "Your payment needs a quick check" : failed ? "Your payment was not completed" : "We could not confirm your payment";
  const body = needsReview
    ? "Your payment went through, but the amount did not match the package we expected, so we need to review it before confirming. You do not need to pay again."
    : failed ? "Paystack reports that this payment was not completed. If you were charged, please contact us with the reference below."
    : "We could not confirm this payment automatically. If money has left your account, please contact us with the reference below and we will check it for you.";
  return (
    <>
      <PageHero title={heading} art="faq" alt="Illustration of a question bubble and an answer bubble" intro={<><p>{body}</p>{reference && <p className="mt-3 text-base">Reference: <strong>{reference}</strong></p>}<p className="mt-3 text-base">Contact us at {contact}.</p></>}>
        <Link href="/packages#start" className="btn btn-primary">Back to packages</Link>
      </PageHero>
    </>
  );
}
