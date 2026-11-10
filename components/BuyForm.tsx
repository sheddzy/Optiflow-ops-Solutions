"use client";

import { useActionState } from "react";
import Link from "next/link";
import { startPackagePayment, type BuyState } from "@/app/(site)/packages/actions";
import { naira, periodLabel, type Pkg } from "@/lib/packages";

const initial: BuyState = { status: "idle" };
export type BuyOption = Pick<Pkg, "id" | "name" | "price" | "period" | "billingNote">;

function Field({ id, label, error, optional, hint, children }: { id: string; label: string; error?: string; optional?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}{optional && <span className="font-normal text-slate"> (optional)</span>}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-[#b42318]">{error}</p>}
    </div>
  );
}

export default function BuyForm({ options, packageId }: { options: BuyOption[]; packageId?: string }) {
  const [state, action, pending] = useActionState(startPackagePayment, initial);
  const e = state.errors ?? {};
  const a = (k: string) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-err` : undefined });
  const fixed = packageId ? options.find((p) => p.id === packageId) : undefined;

  return (
    <form action={action} noValidate className="space-y-5">
      {state.status === "error" && state.message && <p role="alert" className="rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-4 text-sm text-[#b42318]">{state.message}</p>}

      {fixed ? (
        <div className="rounded-md bg-mist/60 p-4"><input type="hidden" name="package_id" value={fixed.id} /><p className="font-semibold">{fixed.name} package: {naira(fixed.price)} {periodLabel(fixed.period)}</p>{fixed.billingNote && <p className="text-sm text-slate">{fixed.billingNote}.</p>}</div>
      ) : (
        <Field id="package_id" label="Choose your package" error={e.package_id}>
          <select id="package_id" name="package_id" required defaultValue="" className="field" {...a("package_id")}>
            <option value="" disabled>Choose a package</option>
            {options.map((p) => <option key={p.id} value={p.id}>{p.name}: {naira(p.price)} {periodLabel(p.period)}</option>)}
          </select>
        </Field>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="b-name" label="Full name" error={e.name}><input id="b-name" name="name" required autoComplete="name" className="field" {...a("name")} /></Field>
        <Field id="b-business" label="Business name" optional error={e.business}><input id="b-business" name="business" autoComplete="organization" className="field" {...a("business")} /></Field>
        <Field id="b-email" label="Email address" error={e.email} hint="Your payment receipt and our follow-up go to this address."><input id="b-email" name="email" type="email" autoComplete="email" className="field" {...a("email")} /></Field>
        <Field id="b-phone" label="Phone number" error={e.phone}><input id="b-phone" name="phone" type="tel" autoComplete="tel" className="field" {...a("phone")} /></Field>
      </div>
      <Field id="b-domain" label="Preferred domain name" optional error={e.domain} hint="For example yourcompany.com. We confirm availability and cost with you after payment.">
        <input id="b-domain" name="domain" placeholder="yourcompany.com" className="field" {...a("domain")} />
      </Field>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input name="hp_company_site" tabIndex={-1} autoComplete="off" /></label></div>

      <div className="rounded-md border border-line bg-white p-4 text-sm text-slate">
        <p className="font-semibold text-ink">Before you pay</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>You pay the price shown on this page. It is confirmed again by our server when you press Pay.</li>
          <li>After payment we contact you to confirm your requirements and your service agreement. Where a package has a licensed-user allowance, it is confirmed then.</li>
          <li>Domain registration and third-party subscriptions are subject to provider availability and pricing. Premium domains and extra email users are quoted separately.</li>
          <li>Renewals are not automatic. We remind you ahead of expiry.</li>
        </ul>
        <label className="mt-4 flex items-start gap-3">
          <input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-navy" {...a("terms")} />
          <span>I have read the points above and the <Link href="/terms" className="font-semibold text-teal-text underline">terms and conditions</Link>.</span>
        </label>
        {e.terms && <p id="terms-err" className="mt-1.5 text-[#b42318]">{e.terms}</p>}
      </div>

      <button type="submit" disabled={pending} className="btn btn-teal w-full disabled:opacity-60 sm:w-auto">{pending ? "Opening secure payment…" : fixed ? `Pay ${naira(fixed.price)} with Paystack` : "Continue to secure payment with Paystack"}</button>
      <p className="text-xs text-slate">You will be taken to Paystack to pay securely. OptiFlow never sees or stores your card details.</p>
    </form>
  );
}
