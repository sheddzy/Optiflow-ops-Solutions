"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin, slugify, SLUG_RE } from "@/lib/admin";
import { parseFaq } from "@/lib/admin-format";
import { PAGE_ILLUSTRATIONS, RESERVED_SLUGS } from "@/lib/reserved";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Enter a page title.").max(140),
  slug: z.string().trim().max(80),
  seo_title: z.string().trim().max(70, "Keep the search title under 70 characters."),
  seo_description: z.string().trim().max(170, "Keep the search description under 170 characters."),
  hero_title: z.string().trim().max(160),
  hero_text: z.string().trim().max(600),
  cta_label: z.string().trim().max(40),
  cta_href: z.string().trim().max(200).refine((v) => v === "" || /^(\/|https:\/\/)/.test(v), "The button link must start with / or https://"),
  illustration: z.enum(PAGE_ILLUSTRATIONS),
  body_md: z.string().max(60000),
  faq: z.string().max(8000),
});
const refresh = () => revalidatePath("/", "layout");

export async function savePage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const back = id ? `/admin/pages/${id}` : "/admin/pages/new";
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) return go(back, "err", p.error.issues[0]?.message ?? "Invalid input.");
  const d = p.data;
  const slug = d.slug || slugify(d.title);
  if (!SLUG_RE.test(slug)) return go(back, "err", "The web address (slug) can use lowercase letters, numbers and hyphens only.");
  if (RESERVED_SLUGS.has(slug)) return go(back, "err", `"${slug}" is already used by the website. Choose a different web address.`);
  if (d.cta_label && !d.cta_href) return go(back, "err", "Add a button link, or clear the button text.");
  const faq = parseFaq(d.faq);
  if (!faq.ok) return go(back, "err", faq.error);

  const row = { slug, title: d.title, seo_title: d.seo_title, seo_description: d.seo_description, hero_title: d.hero_title, hero_text: d.hero_text, cta_label: d.cta_label, cta_href: d.cta_href, illustration: d.illustration, body_md: d.body_md, faq: faq.v, show_in_footer: form.get("show_in_footer") === "on", published: form.get("published") === "on" };
  const q = id ? supabase.from("pages").update(row).eq("id", id) : supabase.from("pages").insert(row);
  const { data, error } = await q.select("id");
  if (error?.code === "23505") return go(back, "err", "Another page already uses that web address. Change the slug.");
  if (error || !data?.length) return go(back, "err", "Could not save the page. Please try again.");
  refresh();
  return go("/admin/pages", "ok", "Page saved.");
}

export async function togglePage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/pages", "err", "Invalid page.");
  const publish = form.get("publish") === "1";
  const { data, error } = await supabase.from("pages").update({ published: publish }).eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/pages", "err", "Could not update the page.");
  refresh();
  return go("/admin/pages", "ok", publish ? "Page is live." : "Page hidden from the website.");
}

export async function deletePage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/pages", "err", "Invalid page.");
  const { data, error } = await supabase.from("pages").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/pages", "err", "Could not delete the page.");
  refresh();
  return go("/admin/pages", "ok", "Page deleted.");
}
