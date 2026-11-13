"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Offer = {
  slug: string;
  title: string;
  badge: string;
  subtitle: string;
  bannerText: string;
  slotsLeft: number | null;
  slotLimit: number | null;
};

export default function OfferPopup({ offers }: { offers: Offer[] }) {
  const [visible, setVisible] = useState(false);
  const offer = offers[0];

  useEffect(() => {
    if (!offer) return;
    try {
      if (window.sessionStorage.getItem("optiflow-offer-popup-seen") === "1") return;
      const timer = window.setTimeout(() => {
        setVisible(true);
        window.sessionStorage.setItem("optiflow-offer-popup-seen", "1");
      }, 900);
      return () => window.clearTimeout(timer);
    } catch {
      setVisible(true);
    }
  }, [offer]);

  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  if (!offer || !visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setVisible(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="offer-popup-title" className="relative w-full max-w-lg rounded-lg border border-line bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={() => setVisible(false)} aria-label="Close promotion" className="absolute right-4 top-3 flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate hover:bg-mist">×</button>
        {offer.badge && <p className="inline-flex rounded bg-teal px-3 py-1 text-xs font-bold tracking-wide text-deep">{offer.badge}</p>}
        <p className="mt-5 text-sm font-semibold uppercase tracking-[.14em] text-teal-text">OptiFlow promotion</p>
        <h2 id="offer-popup-title" className="mt-2 pr-7 text-3xl font-bold leading-tight text-navy">{offer.title}</h2>
        {offer.subtitle && <p className="mt-3 text-lg text-slate">{offer.subtitle}</p>}
        {offer.bannerText && <p className="mt-4 rounded-md bg-mist p-4 text-sm leading-relaxed text-ink">{offer.bannerText}</p>}
        {offer.slotsLeft != null && offer.slotLimit != null && <p className="mt-4 text-sm font-semibold text-navy">{offer.slotsLeft} of {offer.slotLimit} places remaining</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/offers/${offer.slug}`} onClick={() => setVisible(false)} className="btn btn-primary">View offer</Link>
          <Link href="/offers" onClick={() => setVisible(false)} className="btn btn-ghost">All offers</Link>
        </div>
        <p className="mt-5 text-xs text-slate">You can close this message and continue browsing the website.</p>
      </section>
    </div>
  );
}
