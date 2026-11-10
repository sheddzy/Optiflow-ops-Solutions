"use client";

import { useState } from "react";
import Link from "next/link";

type Message = { from: "assistant" | "visitor"; text: string };

const answers: Record<string, string> = {
  services:
    "OptiFlow helps businesses with operations setup and process improvement, workflow automation, dashboards and reporting, project coordination, business email and IT support, and website and digital solutions.",
  pricing:
    "Our Launch package is ₦200,000 per year. It includes domain registration support, up to two business email accounts, 5GB per mailbox, Zoho configuration, basic maintenance and renewal monitoring. Pro is ₦500,000 per year and includes the Launch scope plus an agreed business website, hosting and deployment, contact and WhatsApp integration, and basic SEO. Third-party subscriptions and domain renewals may have separate charges.",
  free:
    "The free business email promotion covers the setup fee for one professional email account on a domain you already own. Domain ownership is required. Email hosting subscriptions or provider charges, where applicable, are paid separately. We confirm any charges before starting.",
  opspilot:
    "OpsPilot is a digital operations product developed by OptiFlow Ops Solutions. Contact our team to discuss its current capabilities and availability.",
  process:
    "The usual process is: tell us what your business needs, we review the requirements, confirm scope and any third-party costs, then agree the implementation and handover.",
};

const prompts = [
  { label: "Our services", key: "services" },
  { label: "Packages and pricing", key: "pricing" },
  { label: "Free business email", key: "free" },
  { label: "OpsPilot", key: "opspilot" },
  { label: "How it works", key: "process" },
];

export default function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "assistant", text: "Welcome to OptiFlow. I can help you understand our services, packages and current offers. Choose a topic below, or send an enquiry to our team." },
  ]);

  function choose(key: string, label: string) {
    setMessages((current) => [
      ...current,
      { from: "visitor", text: label },
      { from: "assistant", text: answers[key] ?? "I cannot confirm that information. Please send an enquiry and our team will clarify it." },
    ]);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {open && (
        <section
          aria-label="OptiFlow website assistant"
          className="mb-3 flex w-[min( calc(100vw - 2rem), 390px)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-navy px-5 py-4 text-white">
            <div>
              <p className="font-semibold">OptiFlow Assistant</p>
              <p className="mt-0.5 text-xs text-white/75">Automated business information</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full px-2 py-1 text-xl leading-none hover:bg-white/10">×</button>
          </header>
          <div className="flex max-h-[min(55vh, 440px)] flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={message.from === "visitor" ? "ml-8 self-end rounded-2xl rounded-br-sm bg-navy px-3.5 py-2.5 text-sm text-white" : "mr-5 self-start rounded-2xl rounded-bl-sm bg-[#f1f5f9] px-3.5 py-2.5 text-sm leading-relaxed text-ink"}>
                {message.text}
              </div>
            ))}
            <p className="text-xs text-slate">Choose a topic to see an answer:</p>
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button key={prompt.key} type="button" onClick={() => choose(prompt.key, prompt.label)} className="rounded-full border border-line px-3 py-2 text-xs font-medium text-navy transition hover:border-teal hover:bg-[#effcf9]">
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
          <footer className="border-t border-line bg-white p-4">
            <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary block w-full text-center">
              Send an enquiry to OptiFlow
            </Link>
            <p className="mt-2 text-center text-[11px] text-slate">This assistant uses preset information, not generative AI. For a confirmed quotation, contact our team.</p>
          </footer>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close OptiFlow assistant" : "Open OptiFlow assistant"}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-navy text-white shadow-lg transition hover:bg-[#244b79] focus:outline-none focus:ring-4 focus:ring-teal/30"
      >
        {open ? <span className="text-2xl leading-none">×</span> : <span className="text-sm font-bold tracking-wide">CHAT</span>}
      </button>
    </div>
  );
}
