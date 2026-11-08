import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

export const viewport: Viewport = { themeColor: "#1b3a63", width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Business Operations & Automation in Nigeria | OptiFlow", template: "%s" },
  description: "OptiFlow helps Nigerian businesses improve operations with practical systems, workflow automation, dashboards, project coordination and digital solutions.",
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: SITE.name,
    title: "Business Operations & Automation in Nigeria | OptiFlow",
    description: "Practical operations consulting, workflow automation, reporting dashboards and digital solutions for growing businesses.",
    url: SITE.url,
    images: [{ url: "/brand/logo.png", width: 1200, height: 630, alt: "OptiFlow Ops Solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Operations & Automation in Nigeria | OptiFlow",
    description: "Practical operations consulting, workflow automation, reporting dashboards and digital solutions for growing businesses.",
    images: ["/brand/logo.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
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
