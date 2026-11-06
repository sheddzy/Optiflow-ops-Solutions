import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/content";

export const metadata: Metadata = { title: "Services", description: "Process improvement, workflow automation, dashboards, project management systems, IT support and software development from OptiFlow Ops Solutions.", alternates: { canonical: "/services" } };
export const revalidate = 60;

export default async function Services() {
  const services = await getServices();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <h1 className="max-w-3xl text-4xl font-bold text-navy sm:text-5xl">Services</h1>
      <p className="mt-6 max-w-2xl text-lg text-slate">Six areas of work, from fixing the process to building the system that runs it.</p>
      {services.length === 0 ? (
        <p className="mt-12 text-slate">Our services are being updated. <Link href="/contact" className="font-semibold text-teal-text underline">Contact us</Link> to discuss what you need.</p>
      ) : (
        <ul className="mt-12 divide-y divide-line border-y border-line">
          {services.map((s) => (
            <li key={s.id} id={s.slug} className="grid gap-5 py-10 md:grid-cols-[1fr_1.3fr] md:gap-12">
              <div>
                <h2 className="text-2xl font-semibold text-ink">{s.title}</h2>
                <p className="mt-3 text-slate">{s.description}</p>
              </div>
              <ul className="space-y-2">
                {s.features.map((f) => (
                  <li key={f} className="flex gap-3"><span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-teal" aria-hidden="true" /><span>{f}</span></li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-14"><Link href="/contact" className="btn btn-primary">Discuss a service</Link></div>
    </div>
  );
}
