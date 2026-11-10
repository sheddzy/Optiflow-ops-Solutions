"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin, slugify, SLUG_RE } from "@/lib/admin";
import { lines, paras, parseFaq, parseInclusions } from "@/lib/admin-format";

const price = z.coerce.number({ message: "Enter the price as a number." }).int("Use a whole number of naira.").min(0, "The price cannot be negative.").max(100_000_000, "That price looks too high.");

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Enter a package name.").max(80),
  slug: z.string().trim().max(80),
  tag: z.string().trim().max(120),
  summary: z.string().trim().max(400),
  overview: z.string().max(4000),
  price,
  period: z.enum(["year", "month", "once"]),
  billing_note: z.string().trim().max(160),
  who_for_lead: z.string().trim().max(400),
  who_for: z.string().max(2000),
  inclusions_heading: z.string().trim().max(100),
  includes_all_of: z.string().trim().max(80),
  inclusions: z.string().max(10000),
  not_included: z.string().max(3000),
  you_provide: z.string().max(3000),
  faq: z.string().max(8000),
  sort_order: z.coerce.number().int().min(0).max(999),
});
const refresh = () => revalidatePath("/", "layout");

export async function savePackage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const back = id ? `/admin/packages/${id}` : "/admin/packages/new";
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) return go(back, "err", p.error.issues[0]?.message ?? "Invalid input.");
  const d = p.data;
  const slug = d.slug || slugify(d.name);
  if (!SLUG_RE.test(slug)) return go(back, "err", "The web address (slug) can use lowercase letters, numbers and hyphens only.");
  if (d.includes_all_of && d.includes_all_of === slug) return go(back, "err", "A package cannot include itself.");
  const inc = parseInclusions(d.inclusions);
  if (!inc.ok) return go(back, "err", inc.error);
  const faq = parseFaq(d.faq);
  if (!faq.ok) return go(back, "err", faq.error);

  const row = {
    slug, name: d.name, tag: d.tag, summary: d.summary, overview: paras(d.overview), price: d.price, period: d.period, billing_note: d.billing_note,
    who_for_lead: d.who_for_lead, who_for: lines(d.who_for), inclusions_heading: d.inclusions_heading || "What is included", includes_all_of: d.includes_all_of || null,
    inclusions: inc.v, not_included: lines(d.not_included), you_provide: lines(d.you_provide), faq: faq.v, sort_order: d.sort_order,
    published: form.get("published") === "on", buyable: form.get("buyable") === "on",
  };
  const q = id ? supabase.from("packages").update(row).eq("id", id) : supabase.from("packages").insert(row);
  const { data, error } = await q.select("id");
  if (error?.code === "23505") return go(back, "err", "Another package already uses that web address. Change the slug.");
  if (error || !data?.length) return go(back, "err", "Could not save the package. Please try again.");
  refresh();
  return go("/admin/packages", "ok", "Package saved.");
}

/** Quick price change from the list. The change is recorded in the price history. */
export async function updatePrice(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  const pr = price.safeParse(form.get("price"));
  if (!id.success) return go("/admin/packages", "err", "Invalid package.");
  if (!pr.success) return go("/admin/packages", "err", pr.error.issues[0]?.message ?? "Invalid price.");
  const { data, error } = await supabase.from("packages").update({ price: pr.data }).eq("id", id.data).select("id,name");
  if (error || !data?.length) return go("/admin/packages", "err", "Could not update the price.");
  refresh();
  return go("/admin/packages", "ok", `${data[0].name} price updated to ₦${pr.data.toLocaleString("en-NG")}. The website and checkout use it now.`);
}

export async function togglePackage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/packages", "err", "Invalid package.");
  const publish = form.get("publish") === "1";
  const { data, error } = await supabase.from("packages").update({ published: publish }).eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/packages", "err", "Could not update the package.");
  refresh();
  return go("/admin/packages", "ok", publish ? "Package is live." : "Package hidden from the website.");
}

export async function deletePackage(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/packages", "err", "Invalid package.");
  const { data, error } = await supabase.from("packages").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/packages", "err", "Could not delete the package.");
  refresh();
  return go("/admin/packages", "ok", "Package deleted.");
}
