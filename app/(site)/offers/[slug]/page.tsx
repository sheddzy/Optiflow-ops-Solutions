import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Illustration from "@/components/Illustration";
import { CtaBand, FaqList } from "@/components/Blocks";
import PromoForm from "@/components/PromoForm";
import { getPromotion, listPromotionSlugs } from "@/lib/cms";
import { SITE } from "@/lib/site";

export const dynamicParams = true; // promotions you create in the dashboard appear without a redeploy
export const revalidate = 60;
export const generateStaticParams = async () => (await listPromotionSlugs()).map((slug) => ({ slug }));

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "long", year: "numeric" });

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await getPromotion((await params).slug).catch(() => null);
  if (!r) return {};
  const t = `${r.promo.title} | OptiFlow`;
  const d = `${r.promo.subtitle} ${r.promo.intro[0] ?? ""}`.trim().slice(0, 300);
  return { title: t, description: d, alternates: { canonical: `/offers/${r.promo.slug}` }, openGraph: { title: t, description: d } };
}

const EMAIL_STEPS = [
  ["Send your details", "Fill in the short form below with your business and domain details."],
  ["We confirm your domain", "We check that the domain is yours and active, and agree the next steps with you."],
  ["We set it up and test it", "We configure your email and test sending and receiving."],
];

const WEBSITE_STEPS = [
  ["Discuss", "We discuss your business and the website you need."],
  ["Agree", "We agree on the website scope and delivery timeline."],
  ["Domain", "You pay for your domain. Development begins after the agreement."],
];

export default async function Offer({ params }: { params: Promise<{ slug: string }> }) {
  const r = await getPromotion((await params).slug);
  if (!r) notFound();
  const { promo, state, slotsLeft } = r;
  const open = state === "open";
  const websiteOffer = promo.slug === "free-website-for-your-business";
  const steps = websiteOffer ? WEBSITE_STEPS : EMAIL_STEPS;

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
        <div>
          {promo.badge && <p className="inline-block rounded-md bg-teal px-3 py-1.5 text-lg font-extrabold tracking-wide text-deep">{promo.badge}</p>}
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.2rem]">{promo.title}</h1>
          {promo.subtitle && <p className="mt-3 text-xl font-medium text-teal-text">{promo.subtitle}</p>}
          <div className="mt-5 max-w-xl space-y-3 text-lg leading-relaxed text-slate">{promo.intro.map((t) => <p key={t}>{t}</p>)}</div>
          {promo.conditions && <p className="mt-5 max-w-xl rounded-md border-l-4 border-teal bg-white p-4 text-sm"><strong>Good to know:</strong> {promo.conditions}</p>}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {open ? <a href="#claim" className="btn btn-teal">{promo.ctaLabel}</a> : <Link href="/packages" className="btn btn-primary">See our packages</Link>}
            {open && slotsLeft != null && promo.slotLimit != null && <span className="text-sm font-semibold text-navy">{slotsLeft} of {promo.slotLimit} places left</span>}
            {open && promo.endsAt && <span className="text-sm text-slate">Offer ends {date(promo.endsAt)}</span>}
          </div>
          {!open && (
            <p role="status" className="mt-5 max-w-xl rounded-md border border-line bg-white p-4 text-slate">
              {state === "upcoming" && promo.startsAt ? `This offer opens on ${date(promo.startsAt)}.` : state === "full" ? "All places for this offer have been taken." : "This offer has ended."} You can still see our <Link href="/packages" className="font-semibold text-teal-text underline">packages</Link> or <Link href="/contact" className="font-semibold text-teal-text underline">send us an enquiry</Link>.
            </p>
          )}
        </div>
        <Illustration name={websiteOffer ? "website" : "email"} label={websiteOffer ? "Illustration of a responsive business website displayed on desktop and mobile screens" : "Illustration of a business email inbox beside an envelope with a verified badge, representing a professional email address on your own company domain"} />
      </section>

      <section className="border-t border-line bg-white" aria-labelledby="inc-h">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_.8fr] md:py-16">
          <div>
            <h2 id="inc-h" className="text-3xl font-bold text-navy">What is included</h2>
            <ul className="mt-6 space-y-3 text-lg">
              {promo.inclusions.map((t) => (<li key={t} className="flex gap-3"><span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold text-white" aria-hidden="true">&#10003;</span><span>{t}</span></li>))}
            </ul>
          </div>
          {promo.eligibility && (
            <aside aria-label="Who is eligible" className="self-start rounded-md bg-mist/60 p-6">
              <h3 className="text-xl font-semibold text-navy">Are you eligible?</h3>
              <p className="mt-2 text-lg text-slate">{promo.eligibility}</p>
              {!websiteOffer && <Link href="/packages/launch" className="mt-4 inline-block text-sm font-semibold text-teal-text underline">Need a domain as well? See the Launch package</Link>}
            </aside>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16" aria-labelledby="how-h">
        <h2 id="how-h" className="text-3xl font-bold text-navy">How it works</h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {steps.map(([t, d], i) => (<li key={t}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy font-semibold text-white" aria-hidden="true">{i + 1}</span><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-slate">{d}</p></li>))}
        </ol>
      </section>

      {open && (
        <section id="claim" className="scroll-mt-24 border-y border-line bg-white" aria-labelledby="claim-h">
          <div className="mx-auto max-w-3xl px-5 py-14 md:py-16">
            <h2 id="claim-h" className="text-3xl font-bold text-navy">{promo.ctaLabel}</h2>
            <p className="mb-8 mt-3 text-slate">{websiteOffer ? "Tell us about your business and what you need from your website. We will contact you to discuss the project." : "Tell us about your business and your domain. Send it by email or on WhatsApp."}</p>
            <PromoForm slug={promo.slug} title={promo.title} askDomain={promo.askDomain} ctaLabel={promo.ctaLabel} conditions={promo.conditions} />
          </div>
        </section>
      )}

      {promo.faq.length > 0 && (
        <section aria-labelledby="faq-h"><div className="mx-auto max-w-4xl px-5 py-14"><h2 id="faq-h" className="mb-6 text-3xl font-bold text-navy">Frequently asked questions</h2><FaqList items={promo.faq} /></div></section>
      )}
      <CtaBand title={websiteOffer ? "Get a free website for your business." : open ? "Give your business a professional email address." : "Looking for professional business email?"} text={open ? `${promo.conditions || ""}` : "See our packages, or tell us what you need."} primary={open ? promo.ctaLabel : "See our packages"} href={open ? "#claim" : "/packages"} />
      <p className="sr-only">{SITE.name}</p>
    </>
  );
}
