"use client";

import { useActionState, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { submitEmailEnquiry, type FormState } from "@/app/(site)/contact/actions";
import { SERVICE_OPTIONS, whatsappEnquirySchema } from "@/lib/validation";
import { whatsappUrl } from "@/lib/enquiry-links";
import { SERVICES } from "@/lib/services-data";

const initial: FormState = { status: "idle" };
const err = "mt-1.5 text-sm text-[#b42318]";

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}{optional && <span className="font-normal text-slate"> (optional)</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} className={err}>{error}</p>}
    </div>
  );
}

export default function ContactForm({ presetService }: { presetService?: string } = {}) {
  const params = useSearchParams();
  const fromSlug = SERVICES.find((s) => s.slug === params.get("service"))?.formLabel;
  const fromPkg = params.get("package") === "launch" ? "Launch Package" : params.get("package") === "pro" ? "Pro Package" : undefined;
  const preset = presetService ?? fromSlug ?? fromPkg ?? (params.get("service") === "opspilot" ? "OpsPilot" : "");

  const [state, action, pending] = useActionState(submitEmailEnquiry, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const [waErrors, setWaErrors] = useState<Record<string, string>>({});
  const [waUrl, setWaUrl] = useState<string | null>(null);

  const e = { ...(state.errors ?? {}), ...waErrors };
  const a = (k: string) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-err` : undefined });

  function sendWhatsApp() {
    const fd = new FormData(formRef.current!);
    const parsed = whatsappEnquirySchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
      setWaErrors(errors);
      return;
    }
    setWaErrors({});
    const d = parsed.data;
    const url = whatsappUrl({ name: d.name, business: d.business, email: d.email, phone: d.phone, website: d.website, service: d.service_interest, message: d.message });
    setWaUrl(url);
    window.open(url, "_blank", "noopener,noreferrer"); // opened inside the click, so browsers allow it
  }

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border-l-4 border-teal bg-white p-8">
        <h2 className="text-2xl font-semibold">Enquiry sent</h2>
        <p className="mt-3 max-w-prose text-slate">{state.message ?? "Thank you. Your enquiry has been sent."} We will reply to the email address you gave us.</p>
      </div>
    );
  }

  if (state.status === "fallback" && state.mailto) {
    return (
      <div role="status" className="rounded-md border-l-4 border-teal bg-white p-8">
        <h2 className="text-2xl font-semibold">One last step: send the email</h2>
        <p className="mt-3 max-w-prose text-slate">Your enquiry is ready. Press the button to open your email app with everything filled in, then press Send there. Your enquiry is not sent until you do.</p>
        <a href={state.mailto} className="btn btn-primary mt-6">Open my email app</a>
        <p className="mt-4 text-sm text-slate">If nothing opens, email us directly at <a className="font-semibold text-teal-text underline" href="mailto:shedrackebete@optiflowops.online">shedrackebete@optiflowops.online</a> or use the WhatsApp option.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      {state.status === "error" && state.message && <p role="alert" className="rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-4 text-sm text-[#b42318]">{state.message}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" error={e.name}><input id="name" name="name" required autoComplete="name" className="field" {...a("name")} /></Field>
        <Field id="business" label="Business name" optional error={e.business}><input id="business" name="business" autoComplete="organization" className="field" {...a("business")} /></Field>
        <Field id="email" label="Email address" error={e.email}><input id="email" name="email" type="email" autoComplete="email" className="field" {...a("email")} /></Field>
        <Field id="phone" label="Phone number" error={e.phone}><input id="phone" name="phone" type="tel" autoComplete="tel" className="field" {...a("phone")} /></Field>
      </div>
      <Field id="website" label="Business website" optional error={e.website}><input id="website" name="website" inputMode="url" autoComplete="url" placeholder="yourcompany.com" className="field" {...a("website")} /></Field>
      <Field id="service_interest" label="Service or product of interest" error={e.service_interest}>
        <select id="service_interest" name="service_interest" required defaultValue={preset} className="field" {...a("service_interest")}>
          <option value="" disabled>Choose one</option>
          {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field id="message" label="Tell us about your requirements" error={e.message}>
        <textarea id="message" name="message" rows={6} maxLength={1500} required className="field" {...a("message")} />
      </Field>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty<input name="hp_company_site" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-slate">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-navy" {...a("consent")} />
          <span>I agree that OptiFlow may use these details to reply to my enquiry, as described in the <Link href="/privacy" className="font-semibold text-teal-text underline">privacy notice</Link>.</span>
        </label>
        {e.consent && <p id="consent-err" className={err}>{e.consent}</p>}
      </div>

      <fieldset className="rounded-md border border-line bg-white p-5">
        <legend className="px-2 text-sm font-semibold">Choose how to send your enquiry</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">{pending ? "Sending…" : "Submit My Enquiry by Email"}</button>
          <button type="button" onClick={sendWhatsApp} className="btn bg-[#1f8f4e] text-white hover:bg-[#17703c]">Send on WhatsApp</button>
        </div>
        <p className="mt-3 text-sm text-slate">Both options use the details above. Email sends your enquiry to our team. WhatsApp opens a chat with our business number, with your enquiry already written for you to send.</p>
        {waUrl && <p role="status" className="mt-3 text-sm">WhatsApp should have opened. If it did not, <a href={waUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-text underline">tap here to open it</a>.</p>}
      </fieldset>
    </form>
  );
}
