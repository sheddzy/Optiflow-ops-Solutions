import Image from "next/image";
import Link from "next/link";
import { navFor } from "@/lib/site";

export default function Header({ hasPosts = false }: { hasPosts?: boolean }) {
  const NAV = navFor(hasPosts);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="OptiFlow Ops Solutions home">
          <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-11 w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {NAV.filter((n) => n.href !== "/contact" && n.href !== "/").map((n) => (
            <Link key={n.href} href={n.href} className="text-[15px] font-medium text-ink hover:text-teal-text">{n.label}</Link>
          ))}
          <Link href="/contact" className="btn btn-primary !py-2.5">Contact us</Link>
        </nav>
        <details className="group relative md:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md border border-line" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </summary>
          <nav aria-label="Mobile" className="absolute right-0 mt-2 w-56 rounded-md border border-line bg-white p-2 shadow-lg">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded px-3 py-3 font-medium hover:bg-mist">{n.label}</Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
