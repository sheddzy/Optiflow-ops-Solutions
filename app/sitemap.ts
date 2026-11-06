import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/services", "/opspilot", "/portfolio", "/contact", "/privacy"].map((p) => ({ url: `${SITE.url}${p}`, lastModified: new Date() }));
}
