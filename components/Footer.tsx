import Image from "next/image";
import Link from "next/link";
import { NAV, SITE } from "@/lib/site";

const social = [
  { label: "LinkedIn", href: SITE.linkedin },
  { label: "Instagram", href: SITE.instagram },
  { label: "Facebook", href: SITE.facebook },
  { label: "WhatsApp", href: SITE.whatsapp },
];

export default function Footer() {
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Image src="/brand/logo-reversed.png" alt="OptiFlow Ops Solutions" width={836} height={301} className="h-12 w-auto" />
          <p className="mt-5 max-w-sm text-white/75">{SITE.tagline}</p>
        </div>
        <nav aria-label="Footer">
          <h2 className="font-semibold">Pages</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            {NAV.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-teal">{n.label}</Link></li>)}
            <li><Link href="/privacy" className="hover:text-teal">Privacy notice</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="font-semibold">Get in touch</h2>
          <ul className="mt-4 space-y-2 text-white/75">
            <li><a href={`mailto:${SITE.email}`} className="hover:text-teal">{SITE.email}</a></li>
            {social.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-teal">{s.label}</a></li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-5 text-center text-sm text-white/60">© {new Date().getFullYear()} {SITE.name} All rights reserved.</div>
    </footer>
  );
}
