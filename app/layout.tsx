import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export const viewport: Viewport = { themeColor: "#1b3a63", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.short} Ops Solutions | Better Systems. Better Business.`, template: `%s | ${SITE.short} Ops Solutions` },
  description: "OptiFlow Ops Solutions helps businesses improve operations through process optimisation, workflow automation, dashboards and technology solutions.",
  openGraph: { type: "website", siteName: SITE.name, url: SITE.url, images: [{ url: "/brand/logo.png" }] },
  alternates: { canonical: "/" },
  icons: { icon: "/brand/mark.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
