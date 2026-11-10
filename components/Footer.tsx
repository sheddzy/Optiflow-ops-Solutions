import Image from "next/image";
import Link from "next/link";
import { navFor, SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services-data";

const social = [
  { label: "Instagram", href: SITE.instagram },
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "Facebook", href: SITE.facebook },
  { label: "WhatsApp", href: SITE.whatsapp },
];
const short: Record<string, string> = { "dashboards-and-reporting": "Dashboards and Reporting", "project-management": "Project Management", "business-email-and-it-support": "Business Email and IT Support" };

export default function Footer({ pages = [], hasPosts = false }: { pages?: { slug: string; title: string }[]; hasPosts?: boolean }) {
  const NAV = navFor(hasPosts);
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_.8fr_1.2fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-reversed.png" alt="OptiFlow Ops Solutions" width={836} height={301} className="h-12 w-auto" />
          <p className="mt-5 max-w-sm font-medium text-white/85">{SITE.tagline}</p>
          <p className="mt-3 max-w-sm text-sm text-white/65">We help businesses improve processes, automate workflows, organise reporting and establish practical digital systems.</p>
        </div>
        <nav aria-label="Quick links">
          <h2 className="font-semibold">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-white/75">{NAV.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-teal">{n.label}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Services">
          <h2 className="font-semibold">Our Services</h2>
          <ul className="mt-4 space-y-2 text-white/75">{SERVICES.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`} className="hover:text-teal">{short[s.slug] ?? s.title}</Link></li>)}</ul>
        </nav>
        <div>
          <h2 className="font-semibold">Contact</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            <li><a href={`mailto:${SITE.enquiryEmail}`} className="break-words hover:text-teal">{SITE.enquiryEmail}</a></li>
            <li><a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-teal">{SITE.phoneDisplay}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold">Legal and Social</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            <li><Link href="/faq" className="hover:text-teal">FAQ</Link></li>
            {pages.map((p) => <li key={p.slug}><Link href={`/${p.slug}`} className="hover:text-teal">{p.title}</Link></li>)}
            <li><Link href="/privacy" className="hover:text-teal">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-teal">Terms and Conditions</Link></li>
            {social.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-teal">{s.label}</a></li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-5 text-center text-sm text-white/60">&copy; {new Date().getFullYear()} {SITE.name} All rights reserved.</div>
    </footer>
  );
}
