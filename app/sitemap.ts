import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services-data";
import { getPackages, getPosts, listPageSlugs, listPromotionSlugs } from "@/lib/cms";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pk, pages, posts, promos] = await Promise.all([getPackages(), listPageSlugs().catch(() => []), getPosts(200).catch(() => []), listPromotionSlugs().catch(() => [])]);
  const paths = [
    "", "/about", "/services", ...SERVICES.map((s) => `/services/${s.slug}`), "/packages", ...pk.items.map((p) => `/packages/${p.id}`),
    "/opspilot", "/portfolio", "/contact", "/faq", "/privacy", "/terms", ...(posts.length ? ["/blog", ...posts.map((p) => `/blog/${p.slug}`)] : []),
    ...pages.map((s) => `/${s}`), ...promos.map((s) => `/offers/${s}`),
  ];
  return paths.map((p) => ({ url: `${SITE.url}${p}`, lastModified: new Date() }));
}
