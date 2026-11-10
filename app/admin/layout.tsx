import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "@/app/login/actions";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

const LINKS = [
  ["/admin", "Overview"], ["/admin/enquiries", "Enquiries"], ["/admin/promotions", "Promotions"], ["/admin/packages", "Packages"],
  ["/admin/pages", "Pages"], ["/admin/blog", "Blog"], ["/admin/media", "Media"],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/admin" aria-label="Admin overview"><Image src="/brand/logo.png" alt="OptiFlow" width={836} height={301} className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" target="_blank" className="font-medium text-teal-text underline">View site</Link>
            <form action={logout}><button type="submit" className="btn btn-ghost !px-4 !py-2">Sign out</button></form>
          </div>
        </div>
        <nav aria-label="Admin" className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-5">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="whitespace-nowrap border-b-2 border-transparent py-3 font-medium text-ink hover:border-teal">{label}</Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
    </div>
  );
}
