import type { Metadata } from "next";
import Link from "next/link";
import { getPromotions } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Current Offers and Promotions | OptiFlow",
  description: "Explore current OptiFlow business offers, eligibility, inclusions and application details.",
  alternates: { canonical: "/offers" },
};

export const revalidate = 60;

const statusLabel = (state: string) => ({
  open: "Applications open",
  upcoming: "Coming soon",
  full: "Fully allocated",
  ended: "Offer ended",
}[state] ?? "Offer details");

export default async function OffersPage() {
  const offers = await getPromotions();
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[.14em] text-teal-text">OptiFlow offers</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-navy sm:text-5xl">Business offers worth taking a look at.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate">See current promotions, what is included, who can apply and any costs you should know about before getting started.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-16" aria-labelledby="offers-list-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="offers-list-title" className="text-2xl font-bold text-navy">Available offers</h2>
            <p className="mt-2 text-slate">Promotion details and availability are shown on each offer page.</p>
          </div>
          <span className="text-sm text-slate">{offers.length} {offers.length === 1 ? "offer" : "offers"}</span>
        </div>

        {offers.length === 0 ? (
          <div className="mt-8 rounded-md border border-line bg-white p-8">
            <h3 className="text-xl font-semibold text-navy">No active offers at the moment</h3>
            <p className="mt-2 text-slate">Check back later or contact us to discuss what your business needs.</p>
            <Link href="/contact" className="btn btn-primary mt-5">Contact OptiFlow</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {offers.map(({ promo, state, slotsLeft }) => (
              <article key={promo.id} className="flex flex-col rounded-md border border-line bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {promo.badge ? <span className="rounded bg-teal px-3 py-1 text-xs font-bold tracking-wide text-deep">{promo.badge}</span> : <span />}
                  <span className="text-xs font-semibold text-teal-text">{statusLabel(state)}</span>
                </div>
                <h3 className="mt-5 text-2xl font-bold text-navy">{promo.title}</h3>
                {promo.subtitle && <p className="mt-2 font-medium text-teal-text">{promo.subtitle}</p>}
                <div className="mt-4 flex-1 space-y-2 text-slate">
                  {promo.intro.slice(0, 2).map((text) => <p key={text}>{text}</p>)}
                </div>
                {slotsLeft != null && promo.slotLimit != null && <p className="mt-5 text-sm font-semibold text-navy">{slotsLeft} of {promo.slotLimit} places remaining</p>}
                <Link href={`/offers/${promo.slug}`} className="mt-6 inline-flex min-h-11 items-center font-semibold text-teal-text underline underline-offset-4">View offer details <span aria-hidden="true" className="ml-2">→</span></Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-5 py-10">
          <div><h2 className="text-2xl font-bold text-navy">Have a different requirement?</h2><p className="mt-2 text-slate">Tell us what your business needs and we can discuss a suitable solution.</p></div>
          <Link href="/contact" className="btn btn-primary">Talk to OptiFlow</Link>
        </div>
      </section>
    </>
  );
}
