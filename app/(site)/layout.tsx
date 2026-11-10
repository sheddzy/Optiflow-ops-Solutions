import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteAssistant from "@/components/SiteAssistant";
import { getSiteChrome } from "@/lib/cms";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { footerPages, hasPosts, banner } = await getSiteChrome();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      {banner && (
        <div className="promotion-marquee overflow-hidden bg-navy py-2.5 text-sm text-white" role="region" aria-label="Current promotion">
          <div className="promotion-marquee-track">
            <Link href={banner.href} className="promotion-marquee-item font-medium underline underline-offset-4 hover:text-teal">{banner.text}</Link>
            <Link href={banner.href} aria-hidden="true" tabIndex={-1} className="promotion-marquee-item font-medium underline underline-offset-4 hover:text-teal">{banner.text}</Link>
          </div>
        </div>
      )}
      <Header hasPosts={hasPosts} />
      <main id="main">{children}</main>
      <Footer pages={footerPages} hasPosts={hasPosts} />
      <SiteAssistant />
    </>
  );
}
