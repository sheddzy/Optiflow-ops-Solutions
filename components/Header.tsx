import Image from "next/image";
import Link from "next/link";
import { navFor } from "@/lib/site";

export default function Header({ hasPosts = false }: { hasPosts?: boolean }) {
  const NAV = navFor(hasPosts).filter((item) => !["/", "/contact", "/portfolio"].includes(item.href));
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="OptiFlow Ops Solutions home">
          <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-11 w-auto" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-[15px] font-medium text-ink hover:text-teal-text">{item.label}</Link>
          ))}
          <Link href="/contact" className="btn btn-primary !py-2.5">Contact</Link>
        </nav>
        <details className="group relative md:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-md border border-line" aria-label="Menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </summary>
          <nav aria-label="Mobile" className="absolute right-0 mt-2 w-60 rounded-md border border-line bg-white p-2 shadow-lg">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded px-3 py-3 font-medium hover:bg-mist">{item.label}</Link>
            ))}
            <Link href="/portfolio" className="block rounded px-3 py-3 font-medium hover:bg-mist">Portfolio</Link>
            <Link href="/" className="block rounded px-3 py-3 font-medium hover:bg-mist">Home</Link>
            <Link href="/contact" className="btn btn-primary mt-2 w-full">Contact</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
