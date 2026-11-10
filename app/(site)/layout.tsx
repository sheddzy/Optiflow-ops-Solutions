import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteAssistant from "@/components/SiteAssistant";
import { getSiteChrome } from "@/lib/cms";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { footerPages, hasPosts } = await getSiteChrome();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header hasPosts={hasPosts} />
      <main id="main">{children}</main>
      <Footer pages={footerPages} hasPosts={hasPosts} />
      <SiteAssistant />
    </>
  );
}
