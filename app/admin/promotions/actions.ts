"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin, slugify, SLUG_RE } from "@/lib/admin";
import { lagosToIso, lines, paras, parseFaq } from "@/lib/admin-format";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(140),
  slug: z.string().trim().max(80),
  badge: z.string().trim().max(60),
  subtitle: z.string().trim().max(200),
  intro: z.string().max(3000),
  eligibility: z.string().trim().max(300),
  inclusions: z.string().max(3000),
  conditions: z.string().trim().max(500),
  faq: z.string().max(8000),
  cta_label: z.string().trim().min(2, "Enter the button text.").max(40),
  banner_text: z.string().trim().max(160),
  starts_at: z.string().max(20),
  ends_at: z.string().max(20),
  slot_limit: z.string().max(6),
});
const refresh = () => revalidatePath("/", "layout");

export async function savePromotion(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const back = id ? `/admin/promotions/${id}` : "/admin/promotions/new";
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) return go(back, "err", p.error.issues[0]?.message ?? "Invalid input.");
  const d = p.data;

  const slug = d.slug || slugify(d.title);
  if (!SLUG_RE.test(slug)) return go(back, "err", "The web address (slug) can use lowercase letters, numbers and hyphens only.");
  const faq = parseFaq(d.faq);
  if (!faq.ok) return go(back, "err", faq.error);
  const starts = d.starts_at ? lagosToIso(d.starts_at) : null;
  const ends = d.ends_at ? lagosToIso(d.ends_at) : null;
  if ((d.starts_at && !starts) || (d.ends_at && !ends)) return go(back, "err", "Check the start and end dates.");
  if (starts && ends && new Date(ends) <= new Date(starts)) return go(back, "err", "The end date must be after the start date.");
  const slot = d.slot_limit ? parseInt(d.slot_limit, 10) : null;
  if (d.slot_limit && (!Number.isInteger(slot) || (slot as number) < 1)) return go(back, "err", "The number of places must be 1 or more, or left empty for no limit.");

  const row = {
    slug, title: d.title, badge: d.badge, subtitle: d.subtitle, intro: paras(d.intro), eligibility: d.eligibility, inclusions: lines(d.inclusions),
    conditions: d.conditions, faq: faq.v, cta_label: d.cta_label, ask_domain: form.get("ask_domain") === "on", banner_text: d.banner_text,
    starts_at: starts, ends_at: ends, slot_limit: slot, published: form.get("published") === "on",
  };
  const q = id ? supabase.from("promotions").update(row).eq("id", id) : supabase.from("promotions").insert(row);
  const { data, error } = await q.select("id");
  if (error?.code === "23505") return go(back, "err", "Another promotion already uses that web address. Change the slug.");
  if (error || !data?.length) return go(back, "err", "Could not save the promotion. Please try again.");
  refresh();
  return go("/admin/promotions", "ok", "Promotion saved.");
}

export async function togglePromotion(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/promotions", "err", "Invalid promotion.");
  const publish = form.get("publish") === "1";
  const { data, error } = await supabase.from("promotions").update({ published: publish }).eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/promotions", "err", "Could not update the promotion.");
  refresh();
  return go("/admin/promotions", "ok", publish ? "Promotion is live." : "Promotion switched off.");
}

export async function deletePromotion(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/promotions", "err", "Invalid promotion.");
  const { data, error } = await supabase.from("promotions").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/promotions", "err", "Could not delete the promotion.");
  refresh();
  return go("/admin/promotions", "ok", "Promotion deleted. Its claims are kept in Enquiries.");
}
