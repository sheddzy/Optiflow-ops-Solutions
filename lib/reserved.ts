/** Web addresses that CMS pages may not use because the site already uses them. */
export const RESERVED_SLUGS = new Set([
  "about", "services", "packages", "opspilot", "portfolio", "contact", "faq", "privacy", "terms", "thank-you",
  "blog", "offers", "admin", "login", "api", "payment", "p", "sitemap", "sitemap.xml", "robots.txt", "favicon.ico", "brand", "_next",
]);

/** Pictures a CMS page can use beside its heading. */
export const PAGE_ILLUSTRATIONS = ["about", "operations", "automation", "dashboards", "projects", "email", "website", "contact", "opspilot", "pro", "portfolio", "faq", "legal", "thanks"] as const;
