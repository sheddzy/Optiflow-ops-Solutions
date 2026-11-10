import { publicClient } from "./supabase";
import { PACKAGES, type Pkg } from "./packages";
import { DEFAULT_PROMO, type Promotion } from "./promo-default";

const R = 60; // seconds. Pages also refresh instantly when you save in the dashboard.

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const objs = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/* ---------------- packages ---------------- */
function toPkg(r: any): Pkg {
  return {
    id: r.slug, name: r.name, price: r.price, period: r.period, billingNote: r.billing_note ?? "", tag: r.tag ?? "", summary: r.summary ?? "",
    overview: arr(r.overview), whoForLead: r.who_for_lead ?? "", whoFor: arr(r.who_for), inclusionsHeading: r.inclusions_heading ?? "What is included",
    includesAllOf: r.includes_all_of ?? null, inclusions: objs(r.inclusions), notIncluded: arr(r.not_included), youProvide: arr(r.you_provide),
    faq: objs(r.faq), buyable: !!r.buyable, published: !!r.published, sort: r.sort_order ?? 0,
  };
}

export type PackagesResult = { items: Pkg[]; source: "db" | "code" | "fallback" };

/**
 * source "db": live from the dashboard. "code": Supabase not connected, built-in defaults.
 * "fallback": Supabase is connected but did not answer, so defaults are shown for reading only and buying is switched off.
 */
export async function getPackages(): Promise<PackagesResult> {
  const defaults = PACKAGES.filter((p) => p.published).sort((a, b) => a.sort - b.sort);
  const db = publicClient({ revalidate: R });
  if (!db) return { items: defaults, source: "code" };
  const { data, error } = await db.from("packages").select("*").eq("published", true).order("sort_order");
  if (error) { console.error("getPackages", error.message); return { items: defaults, source: "fallback" }; }
  return { items: (data ?? []).map(toPkg), source: "db" };
}

/** Fresh read for checkout. Never cached. Returns null if the package is not for sale. */
export async function getPackageForCheckout(slug: string): Promise<{ pkg: Pkg | null; error?: boolean }> {
  const db = publicClient({ revalidate: false });
  if (!db) { const p = PACKAGES.find((x) => x.id === slug && x.published && x.buyable); return { pkg: p ?? null }; }
  const { data, error } = await db.from("packages").select("*").eq("slug", slug).eq("published", true).eq("buyable", true).maybeSingle();
  if (error) { console.error("getPackageForCheckout", error.message); return { pkg: null, error: true }; }
  return { pkg: data ? toPkg(data) : null };
}

/* ---------------- promotions ---------------- */
function toPromo(r: any): Promotion {
  return {
    id: r.id, slug: r.slug, title: r.title, badge: r.badge ?? "", subtitle: r.subtitle ?? "", intro: arr(r.intro), eligibility: r.eligibility ?? "",
    inclusions: arr(r.inclusions), conditions: r.conditions ?? "", faq: objs(r.faq), ctaLabel: r.cta_label ?? "Get Started", askDomain: !!r.ask_domain,
    bannerText: r.banner_text ?? "", startsAt: r.starts_at, endsAt: r.ends_at, slotLimit: r.slot_limit, published: !!r.published,
  };
}

export type PromoState = "open" | "upcoming" | "ended" | "full";
export type PromoResult = { promo: Promotion; state: PromoState; slotsLeft: number | null; source: "db" | "code" };

export function promoState(p: Promotion, claimed: number, now = Date.now()): { state: PromoState; slotsLeft: number | null } {
  const slotsLeft = p.slotLimit == null ? null : Math.max(0, p.slotLimit - claimed);
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return { state: "upcoming", slotsLeft };
  if (p.endsAt && new Date(p.endsAt).getTime() <= now) return { state: "ended", slotsLeft };
  if (slotsLeft === 0) return { state: "full", slotsLeft };
  return { state: "open", slotsLeft };
}

/** Returns null when there is no such promotion. Throws if the database is unreachable, so a cached page is kept. */
export async function getPromotion(slug: string): Promise<PromoResult | null> {
  const db = publicClient({ revalidate: R });
  if (!db) return slug === DEFAULT_PROMO.slug ? { promo: DEFAULT_PROMO, ...promoState(DEFAULT_PROMO, 0), source: "code" } : null;
  const { data, error } = await db.from("promotions").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error) { console.error("getPromotion", error.message); throw new Error("Promotions are temporarily unavailable"); }
  if (!data) return null;
  const promo = toPromo(data);
  let claimed = 0;
  if (promo.slotLimit != null) {
    const c = await db.rpc("promotion_claim_count", { pid: promo.id });
    claimed = typeof c.data === "number" ? c.data : 0;
  }
  return { promo, ...promoState(promo, claimed), source: "db" };
}

/** Fresh read for a claim. The server decides, and the database enforces the same rules again. */
export async function getPromotionForClaim(slug: string): Promise<{ promo: Promotion | null; open: boolean; db: boolean; error?: boolean }> {
  const db = publicClient({ revalidate: false });
  if (!db) return slug === DEFAULT_PROMO.slug ? { promo: DEFAULT_PROMO, open: true, db: false } : { promo: null, open: false, db: false };
  const { data, error } = await db.from("promotions").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error) return { promo: null, open: false, db: true, error: true };
  if (!data) return { promo: null, open: false, db: true };
  const promo = toPromo(data);
  const open = await db.rpc("promotion_is_open", { pid: promo.id });
  return { promo, open: open.data === true, db: true };
}

export async function getBanner(): Promise<{ text: string; href: string } | null> {
  const db = publicClient({ revalidate: R });
  if (!db) return { text: DEFAULT_PROMO.bannerText, href: `/offers/${DEFAULT_PROMO.slug}` };
  const { data, error } = await db.from("promotions").select("slug,banner_text,starts_at,ends_at").eq("published", true).neq("banner_text", "").order("created_at", { ascending: false });
  if (error) return null;
  const now = Date.now();
  const hit = (data ?? []).find((r) => (!r.starts_at || new Date(r.starts_at).getTime() <= now) && (!r.ends_at || new Date(r.ends_at).getTime() > now));
  return hit ? { text: hit.banner_text, href: `/offers/${hit.slug}` } : null;
}

/* ---------------- pages ---------------- */
export type CmsPage = { slug: string; title: string; seoTitle: string; seoDescription: string; heroTitle: string; heroText: string; ctaLabel: string; ctaHref: string; illustration: string; body: string; faq: { q: string; a: string }[]; showInFooter: boolean };
const toPage = (r: any): CmsPage => ({ slug: r.slug, title: r.title, seoTitle: r.seo_title ?? "", seoDescription: r.seo_description ?? "", heroTitle: r.hero_title ?? "", heroText: r.hero_text ?? "", ctaLabel: r.cta_label ?? "", ctaHref: r.cta_href ?? "", illustration: r.illustration ?? "about", body: r.body_md ?? "", faq: objs(r.faq), showInFooter: !!r.show_in_footer });

export async function getPage(slug: string): Promise<CmsPage | null> {
  const db = publicClient({ revalidate: R });
  if (!db) return null;
  const { data, error } = await db.from("pages").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (error) { console.error("getPage", error.message); throw new Error("Pages are temporarily unavailable"); }
  return data ? toPage(data) : null;
}

export async function listPageSlugs(): Promise<string[]> {
  const db = publicClient({ revalidate: R });
  if (!db) return [];
  const { data } = await db.from("pages").select("slug").eq("published", true);
  return (data ?? []).map((r) => r.slug);
}

/* ---------------- blog ---------------- */
export type Post = { slug: string; title: string; excerpt: string; body: string; coverUrl: string | null; category: string; tags: string[]; author: string; seoTitle: string; seoDescription: string; publishedAt: string };
const toPost = (r: any): Post => ({ slug: r.slug, title: r.title, excerpt: r.excerpt ?? "", body: r.body_md ?? "", coverUrl: r.cover_url, category: r.category ?? "", tags: arr(r.tags), author: r.author ?? "OptiFlow Team", seoTitle: r.seo_title ?? "", seoDescription: r.seo_description ?? "", publishedAt: r.published_at });

export async function getPosts(limit = 30): Promise<Post[]> {
  const db = publicClient({ revalidate: R });
  if (!db) return [];
  const { data, error } = await db.from("posts").select("*").eq("published", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).limit(limit);
  if (error) { console.error("getPosts", error.message); throw new Error("Blog is temporarily unavailable"); }
  return (data ?? []).map(toPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const db = publicClient({ revalidate: R });
  if (!db) return null;
  const { data, error } = await db.from("posts").select("*").eq("slug", slug).eq("published", true).lte("published_at", new Date().toISOString()).maybeSingle();
  if (error) { console.error("getPost", error.message); throw new Error("Blog is temporarily unavailable"); }
  return data ? toPost(data) : null;
}

/* ---------------- site chrome (footer links, nav, banner) ---------------- */
export async function getSiteChrome() {
  const db = publicClient({ revalidate: 300 });
  let footerPages: { slug: string; title: string }[] = [];
  let hasPosts = false;
  if (db) {
    try {
      const [p, b] = await Promise.all([
        db.from("pages").select("slug,title").eq("published", true).eq("show_in_footer", true).order("title"),
        db.from("posts").select("id", { count: "exact", head: true }).eq("published", true).lte("published_at", new Date().toISOString()),
      ]);
      footerPages = p.data ?? [];
      hasPosts = (b.count ?? 0) > 0;
    } catch { /* chrome is optional */ }
  }
  return { footerPages, hasPosts, banner: await getBanner().catch(() => null) };
}

export async function listPromotionSlugs(): Promise<string[]> {
  const db = publicClient({ revalidate: R });
  if (!db) return [DEFAULT_PROMO.slug];
  const { data } = await db.from("promotions").select("slug").eq("published", true);
  return (data ?? []).map((r) => r.slug);
}
