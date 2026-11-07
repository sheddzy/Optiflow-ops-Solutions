"use client";

import { Suspense, useState } from "react";
import BuyForm from "./BuyForm";
import ContactForm from "./ContactForm";

export default function PackageActions({ packageId, defaultTab = "buy" }: { packageId?: "launch" | "pro"; defaultTab?: "buy" | "enquire" }) {
  const [tab, setTab] = useState<"buy" | "enquire">(defaultTab);
  const preset = packageId === "launch" ? "Launch Package" : packageId === "pro" ? "Pro Package" : undefined;
  const tabCls = (on: boolean) => `flex-1 rounded-md px-4 py-3 text-center font-semibold transition ${on ? "bg-navy text-white" : "bg-white text-navy border border-line hover:border-navy"}`;
  return (
    <div>
      <div role="tablist" aria-label="How would you like to proceed?" className="flex flex-col gap-3 sm:flex-row">
        <button role="tab" id="tab-buy" aria-selected={tab === "buy"} aria-controls="panel-buy" className={tabCls(tab === "buy")} onClick={() => setTab("buy")} type="button">Buy now with Paystack</button>
        <button role="tab" id="tab-enq" aria-selected={tab === "enquire"} aria-controls="panel-enq" className={tabCls(tab === "enquire")} onClick={() => setTab("enquire")} type="button">Send an enquiry first</button>
      </div>
      <div className="mt-6">
        {tab === "buy" ? (
          <div role="tabpanel" id="panel-buy" aria-labelledby="tab-buy"><BuyForm packageId={packageId} /></div>
        ) : (
          <div role="tabpanel" id="panel-enq" aria-labelledby="tab-enq">
            <p className="mb-5 text-slate">Not ready to pay? Tell us about your business and we will recommend the right package. Send it by email or on WhatsApp.</p>
            <Suspense fallback={<p className="text-slate">Loading the enquiry form…</p>}><ContactForm presetService={preset} /></Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
