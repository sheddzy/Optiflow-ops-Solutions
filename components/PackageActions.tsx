"use client";

import { Suspense, useState } from "react";
import BuyForm, { type BuyOption } from "./BuyForm";
import ContactForm from "./ContactForm";

/**
 * buyOptions: packages that can be bought online. Empty means online purchase is off, so only the enquiry form shows.
 * enquiryService: the option preselected in the enquiry form.
 */
export default function PackageActions({ buyOptions, packageId, enquiryService, notice }: { buyOptions: BuyOption[]; packageId?: string; enquiryService?: string; notice?: string }) {
  const canBuy = buyOptions.length > 0;
  const [tab, setTab] = useState<"buy" | "enquire">(canBuy ? "buy" : "enquire");
  const tabCls = (on: boolean) => `flex-1 rounded-md px-4 py-3 text-center font-semibold transition ${on ? "bg-navy text-white" : "bg-white text-navy border border-line hover:border-navy"}`;
  return (
    <div>
      {notice && <p className="mb-5 rounded-md border-l-4 border-teal bg-mist/60 p-4 text-sm">{notice}</p>}
      {canBuy && (
        <div role="tablist" aria-label="How would you like to proceed?" className="flex flex-col gap-3 sm:flex-row">
          <button role="tab" id="tab-buy" aria-selected={tab === "buy"} aria-controls="panel-buy" className={tabCls(tab === "buy")} onClick={() => setTab("buy")} type="button">Buy now with Paystack</button>
          <button role="tab" id="tab-enq" aria-selected={tab === "enquire"} aria-controls="panel-enq" className={tabCls(tab === "enquire")} onClick={() => setTab("enquire")} type="button">Send an enquiry first</button>
        </div>
      )}
      <div className={canBuy ? "mt-6" : ""}>
        {tab === "buy" && canBuy ? (
          <div role="tabpanel" id="panel-buy" aria-labelledby="tab-buy"><BuyForm options={buyOptions} packageId={packageId} /></div>
        ) : (
          <div role="tabpanel" id="panel-enq" aria-labelledby="tab-enq">
            <p className="mb-5 text-slate">Tell us about your business and we will recommend the right package. Send it by email or on WhatsApp.</p>
            <Suspense fallback={<p className="text-slate">Loading the enquiry form…</p>}><ContactForm presetService={enquiryService} /></Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
