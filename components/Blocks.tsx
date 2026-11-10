import Link from "next/link";
import Illustration from "./Illustration";
import { SITE } from "@/lib/site";
import type { Block, IllustrationKey, ServiceItem } from "@/lib/services-data";

export function PageHero({ title, intro, art, alt, children }: { title: string; intro: React.ReactNode; art: IllustrationKey; alt: string; children?: React.ReactNode }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:py-20">
      <div>
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-navy sm:text-5xl">{title}</h1>
        <div className="mt-6 max-w-xl text-lg leading-relaxed text-slate">{intro}</div>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
      <Illustration name={art} label={alt} />
    </section>
  );
}

export function ServiceCard({ s }: { s: ServiceItem }) {
  return (
    <li className="group">
      <Link href={`/services/${s.slug}`} className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-white transition hover:border-navy hover:shadow-md">
        <Illustration name={s.illustration} label={s.imageAlt} className="rounded-none" />
        <span className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-semibold text-ink">{s.title}</h3>
          <span className="mt-2 flex-1 text-slate">{s.short}</span>
          <span className="mt-5 font-semibold text-teal-text underline underline-offset-4 group-hover:text-navy">Explore This Service</span>
        </span>
      </Link>
    </li>
  );
}

export function CtaBand({ title, text, primary = "Send an enquiry", href = "/contact" }: { title: string; text?: string; primary?: string; href?: string }) {
  return (
    <section className="bg-navy text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
        <div>
          <h2 className="max-w-xl text-3xl font-bold">{title}</h2>
          {text && <p className="mt-3 max-w-xl text-white/80">{text}</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={href} className="btn btn-teal">{primary}</Link>
          <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">Chat With Us on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}

export function Bullets({ items, tone = "teal" }: { items: string[]; tone?: "teal" | "slate" }) {
  return (
    <ul className="space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3"><span className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${tone === "teal" ? "bg-teal" : "bg-slate/50"}`} aria-hidden="true" /><span>{t}</span></li>
      ))}
    </ul>
  );
}

export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-3">
      {items.map((t, i) => (
        <li key={t} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white" aria-hidden="true">{i + 1}</span><span className="pt-0.5">{t}</span></li>
      ))}
    </ol>
  );
}

/** Renders the structured content blocks used on the service pages. */
export function RichBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-4 text-slate">
      {blocks.map((b, i) => {
        if (b.t === "p") return <p key={i} className="leading-relaxed">{b.v}</p>;
        if (b.t === "ul") return <Bullets key={i} items={b.v} />;
        if (b.t === "ol") return <Steps key={i} items={b.v} />;
        return (
          <dl key={i} className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {b.v.map((d) => (
              <div key={d.name} className="border-l-4 border-teal pl-5">
                <dt className="font-semibold text-ink">{d.name}</dt>
                {d.text && <dd className="mt-1">{d.text}</dd>}
                {d.bullets && <dd className="mt-2"><Bullets items={d.bullets} tone="slate" /></dd>}
              </div>
            ))}
          </dl>
        );
      })}
    </div>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-md border border-line bg-white">
      {items.map((f) => (<details key={f.q} className="group p-4"><summary className="cursor-pointer font-semibold">{f.q}</summary><p className="mt-2 text-slate">{f.a}</p></details>))}
    </div>
  );
}
