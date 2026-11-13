import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteAssistant from "@/components/SiteAssistant";
import { getPromotions, getSiteChrome } from "@/lib/cms";
import OfferPopup from "@/components/OfferPopup";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ footerPages, hasPosts }, promotions] = await Promise.all([getSiteChrome(), getPromotions()]);
  const popupOffers = promotions.filter((item) => item.state === "open").map(({ promo, slotsLeft }) => ({ slug: promo.slug, title: promo.title, badge: promo.badge, subtitle: promo.subtitle, bannerText: promo.bannerText, slotsLeft, slotLimit: promo.slotLimit }));
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <Header hasPosts={hasPosts} />
      <main id="main">{children}</main>
      <Footer pages={footerPages} hasPosts={hasPosts} />
      <SiteAssistant />
      <OfferPopup offers={popupOffers} />
    </>
  );
}
