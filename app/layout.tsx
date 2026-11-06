import type { Metadata, Viewport } from "next";
import "./globals.css";
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
      <body>{children}</body>
    </html>
  );
}
