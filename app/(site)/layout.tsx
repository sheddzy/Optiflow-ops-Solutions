import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteChrome } from "@/lib/cms";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { footerPages, hasPosts, banner } = await getSiteChrome();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      {banner && (
        <div className="bg-navy px-5 py-2.5 text-center text-sm text-white">
          <Link href={banner.href} className="font-medium underline underline-offset-4 hover:text-teal">{banner.text}</Link>
        </div>
      )}
      <Header hasPosts={hasPosts} />
      <main id="main">{children}</main>
      <Footer pages={footerPages} hasPosts={hasPosts} />
    </>
  );
}
