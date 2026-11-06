"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitEnquiry, type FormState } from "@/app/contact/actions";
import { SERVICE_OPTIONS } from "@/lib/validation";

const initial: FormState = { status: "idle" };

function Field({ id, label, error, optional, children }: { id: string; label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}{optional && <span className="font-normal text-slate"> (optional)</span>}
      </label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-sm text-[#b42318]">{error}</p>}
    </div>
  );
}

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitEnquiry, initial);
  const e = state.errors ?? {};
  const a = (k: string) => ({ "aria-invalid": e[k] ? true : undefined, "aria-describedby": e[k] ? `${k}-err` : undefined });

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-md border-l-4 border-teal bg-white p-8">
        <h2 className="text-2xl font-semibold text-ink">Enquiry received</h2>
        <p className="mt-3 max-w-prose text-slate">Thank you. We have your message and will reply to the email address you gave us.</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-4 text-sm text-[#b42318]">{state.message}</p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Full name" error={e.name}><input id="name" name="name" required autoComplete="name" className="field" {...a("name")} /></Field>
        <Field id="email" label="Email" error={e.email}><input id="email" name="email" type="email" required autoComplete="email" className="field" {...a("email")} /></Field>
        <Field id="company" label="Company" optional error={e.company}><input id="company" name="company" autoComplete="organization" className="field" {...a("company")} /></Field>
        <Field id="phone" label="Phone number" optional error={e.phone}><input id="phone" name="phone" type="tel" autoComplete="tel" className="field" {...a("phone")} /></Field>
      </div>
      <Field id="service_interest" label="Service of interest" error={e.service_interest}>
        <select id="service_interest" name="service_interest" required defaultValue="" className="field" {...a("service_interest")}>
          <option value="" disabled>Choose one</option>
          {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field id="message" label="How can we help?" error={e.message}>
        <textarea id="message" name="message" rows={6} required className="field" {...a("message")} />
      </Field>
      {/* Honeypot: hidden from people and assistive tech. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm text-slate">
          <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-navy" {...a("consent")} />
          <span>I agree that OptiFlow may store my details and contact me about this enquiry, as described in the <Link href="/privacy" className="font-semibold text-teal-text underline">privacy notice</Link>.</span>
        </label>
        {e.consent && <p id="consent-err" className="mt-1.5 text-sm text-[#b42318]">{e.consent}</p>}
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">{pending ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}
