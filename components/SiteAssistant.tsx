"use client";

import { useState } from "react";
import Link from "next/link";

type Message = { from: "assistant" | "visitor"; text: string };

const answers: Record<string, string> = {
  services: "We help with operations setup, process improvement, workflow automation, dashboards, project coordination, business email and websites.",
  pricing: "Launch is ₦200,000 per year. Pro is ₦500,000 per year. Contact us to confirm the current inclusions and any third-party subscription costs.",
  free: "The free business email offer covers setup for one professional email account on a domain you already own. Any provider subscription charges are confirmed before work begins.",
  opspilot: "OpsPilot is a business operations product being developed by OptiFlow. Contact us for its current capabilities and availability.",
  process: "Tell us what you need, agree the scope and costs, then we implement, test and hand over the solution.",
};

const prompts = [
  { label: "Services", key: "services" },
  { label: "Packages", key: "pricing" },
  { label: "Free email", key: "free" },
  { label: "OpsPilot", key: "opspilot" },
  { label: "How it works", key: "process" },
];

export default function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: "assistant", text: "What would you like to know? Choose a topic below or contact our team." },
  ]);

  function choose(key: string, label: string) {
    setMessages((current) => [
      ...current,
      { from: "visitor", text: label },
      { from: "assistant", text: answers[key] ?? "Please contact our team so we can confirm that information." },
    ]);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[50]">
      {open && (
        <section
          aria-label="OptiFlow website assistant"
          className="mb-3 flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-line bg-white shadow-xl"
        >
          <header className="flex items-center justify-between bg-navy px-4 py-3 text-white">
            <div>
              <p className="font-semibold">OptiFlow Assistant</p>
              <p className="mt-0.5 text-xs text-white/75">Quick answers about our services</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full px-2 py-1 text-xl leading-none hover:bg-white/10">×</button>
          </header>
          <div className="flex max-h-[min(55vh,400px)] flex-col gap-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={index} className={message.from === "visitor" ? "ml-8 self-end rounded-2xl rounded-br-sm bg-navy px-3.5 py-2.5 text-sm text-white" : "mr-5 self-start rounded-2xl rounded-bl-sm bg-[#f1f5f9] px-3.5 py-2.5 text-sm leading-relaxed text-ink"}>
                {message.text}
              </div>
            ))}
            <p className="text-xs text-slate">Choose a topic:</p>
            <div className="flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button key={prompt.key} type="button" onClick={() => choose(prompt.key, prompt.label)} className="rounded-full border border-line px-3 py-2 text-xs font-medium text-navy transition hover:border-teal hover:bg-[#effcf9]">
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
          <footer className="border-t border-line bg-white p-3">
            <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary block w-full text-center">Contact our team</Link>
            <p className="mt-2 text-center text-[11px] text-slate">Preset answers. Contact us for a confirmed quotation.</p>
          </footer>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close OptiFlow assistant" : "Open OptiFlow assistant"}
        className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-lg font-semibold text-navy shadow-md transition hover:border-navy hover:bg-mist focus:outline-none focus:ring-4 focus:ring-teal/30"
      >
        {open ? <span className="text-2xl leading-none">×</span> : <span aria-hidden="true">?</span>}
      </button>
    </div>
  );
}
