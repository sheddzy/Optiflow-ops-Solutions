"use client";

import { useActionState, useRef, useState } from "react";
import Link from "next/link";
import { claimPromotion } from "@/app/(site)/offers/[slug]/actions";
import type { FormState } from "@/app/(site)/contact/actions";
import { claimSchema } from "@/lib/validation";
import { SITE } from "@/lib/site";

const initial: FormState = { status: "idle" };
const err = "mt-1.5 text-sm text-[#b42318]";

function Field({ id, label, error, optional, hint, children }: { id: string; label: string; error?: string; optional?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}{optional && <span className="font-normal text-slate"> (optional)</span>}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate">{hint}</p>}
      {error && <p id={`${id}-err`} className={err}>{error}</p>}
    </div>
  );
}

export default function PromoForm({ slug, title, askDomain, ctaLabel, conditions }: { slug: string; title: string; askDomain: boolean; ctaLabel: string; conditions: string }) {
  const [state, action, pending] = useActionState(claimPromotion, initial);
  const ref = useRef<HTMLFormElement>(null);
  const [waErrors, setWaErrors] = useState<Record<string, string>>({});
  const [waUrl, setWaUrl] = useState<string | null>(null);
  const e = { ...(state.errors ?? {}), ...waErrors };
  const a = (k: string) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-err` : undefined });

  function whatsapp() {
    const fd = new FormData(ref.current!);
    const parsed = claimSchema.safeParse(Object.fromEntries(fd));
    const errors: Record<string, string> = {};
    if (!parsed.success) for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    if (askDomain && !String(fd.get("domain") ?? "").trim()) errors.domain ??= "Enter your domain, for example yourcompany.com.";
    setWaErrors(errors);
    if (!parsed.success || Object.keys(errors).length) return;
    const d = parsed.data;
    const text = [`Hello OptiFlow, I would like to claim the "${title}" offer.`, "", `Name: ${d.name}`, `Business: ${d.business || "Not given"}`, `Email: ${d.email}`, `Phone: ${d.phone}`, ...(askDomain ? [`Domain: ${d.domain || "Not given"}`] : []), ...(d.message ? ["", d.message] : [])].join("\n");
    const url = `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
    setWaUrl(url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  if (state.status === "success") return <div role="status" className="rounded-md border-l-4 border-teal bg-white p-8"><h2 className="text-2xl font-semibold">Thank you</h2><p className="mt-3 text-slate">{state.message}</p></div>;
  if (state.status === "fallback" && state.mailto) {
    return (
      <div role="status" className="rounded-md border-l-4 border-teal bg-white p-8">
        <h2 className="text-2xl font-semibold">One last step: send the email</h2>
        <p className="mt-3 max-w-prose text-slate">Your request is ready. Press the button to open your email app with everything filled in, then press Send there. It is not sent until you do.</p>
        <a href={state.mailto} className="btn btn-primary mt-6">Open my email app</a>
        <p className="mt-4 text-sm text-slate">If nothing opens, email <a className="font-semibold text-teal-text underline" href={`mailto:${SITE.enquiryEmail}`}>{SITE.enquiryEmail}</a> or use the WhatsApp option.</p>
      </div>
    );
  }

  return (
    <form ref={ref} action={action} noValidate className="space-y-5">
      <input type="hidden" name="promo_slug" value={slug} />
      {state.status === "error" && state.message && <p role="alert" className="rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-4 text-sm text-[#b42318]">{state.message}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-name" label="Full name" error={e.name}><input id="p-name" name="name" required autoComplete="name" className="field" {...a("name")} /></Field>
        <Field id="p-business" label="Business name" optional error={e.business}><input id="p-business" name="business" autoComplete="organization" className="field" {...a("business")} /></Field>
        <Field id="p-email" label="Email address" error={e.email}><input id="p-email" name="email" type="email" autoComplete="email" className="field" {...a("email")} /></Field>
        <Field id="p-phone" label="Phone number" error={e.phone}><input id="p-phone" name="phone" type="tel" autoComplete="tel" className="field" {...a("phone")} /></Field>
      </div>
      {askDomain && (
        <Field id="p-domain" label="Your business domain" error={e.domain} hint="The domain you already own, for example yourcompany.com. Never send us passwords through this form.">
          <input id="p-domain" name="domain" inputMode="url" placeholder="yourcompany.com" className="field" {...a("domain")} />
        </Field>
      )}
      <Field id="p-message" label="Anything we should know?" optional error={e.message}><textarea id="p-message" name="message" rows={4} maxLength={1500} className="field" {...a("message")} /></Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Leave this empty<input name="hp_company_site" tabIndex={-1} autoComplete="off" /></label></div>
      <div>
        <label className="flex items-start gap-3 text-sm text-slate">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-navy" {...a("consent")} />
          <span>I agree that OptiFlow may use these details to respond to this request, as described in the <Link href="/privacy" className="font-semibold text-teal-text underline">privacy policy</Link>.</span>
        </label>
        {e.consent && <p id="consent-err" className={err}>{e.consent}</p>}
      </div>
      {conditions && <p className="rounded-md bg-mist/60 p-3 text-sm text-slate"><strong>Please note:</strong> {conditions}</p>}
      <fieldset className="rounded-md border border-line bg-white p-5">
        <legend className="px-2 text-sm font-semibold">Choose how to send your request</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">{pending ? "Sending…" : `${ctaLabel} by Email`}</button>
          <button type="button" onClick={whatsapp} className="btn bg-[#1f8f4e] text-white hover:bg-[#17703c]">{ctaLabel} on WhatsApp</button>
        </div>
        {waUrl && <p role="status" className="mt-3 text-sm">WhatsApp should have opened. If it did not, <a href={waUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-text underline">tap here</a>.</p>}
      </fieldset>
    </form>
  );
}
