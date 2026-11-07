import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services-data";
import { PACKAGES } from "@/lib/packages";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/services", ...SERVICES.map((s) => `/services/${s.slug}`), "/packages", ...PACKAGES.map((p) => `/packages/${p.id}`), "/opspilot", "/portfolio", "/contact", "/faq", "/privacy", "/terms"];
  return pages.map((p) => ({ url: `${SITE.url}${p}`, lastModified: new Date() }));
}
