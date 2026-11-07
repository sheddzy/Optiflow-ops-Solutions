"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin, slugify, SLUG_RE } from "@/lib/admin";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(140),
  slug: z.string().trim().max(80),
  description: z.string().trim().min(10, "Enter a description of at least 10 characters.").max(1000),
  category: z.string().trim().max(60),
  features: z.string().max(2000),
  sort_order: z.coerce.number().int().min(0).max(999),
});

const refresh = () => { revalidatePath("/", "layout"); };

export async function saveService(form: FormData) {
  const { supabase } = await requireAdmin();
  const p = schema.safeParse(Object.fromEntries(form));
  const back = (form.get("id") ? `/admin/services/${form.get("id")}` : "/admin/services/new");
  if (!p.success) return go(back, "err", p.error.issues[0]?.message ?? "Invalid input.");

  const slug = p.data.slug || slugify(p.data.title);
  if (!SLUG_RE.test(slug)) return go(back, "err", "The web address (slug) can use lowercase letters, numbers and hyphens only.");
  const features = p.data.features.split("\n").map((s) => s.trim()).filter(Boolean);
  if (features.length > 12 || features.some((f) => f.length > 120)) return go(back, "err", "Use at most 12 bullet points of 120 characters each.");

  const row = { title: p.data.title, slug, description: p.data.description, category: p.data.category || null, features, sort_order: p.data.sort_order, published: form.get("published") === "on" };
  const q = p.data.id ? supabase.from("services").update(row).eq("id", p.data.id) : supabase.from("services").insert(row);
  const { data, error } = await q.select("id");
  if (error?.code === "23505") return go(back, "err", "Another service already uses that web address. Change the slug.");
  if (error || !data?.length) return go(back, "err", "Could not save the service. Please try again.");
  refresh();
  return go("/admin/services", "ok", "Service saved.");
}

export async function toggleService(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/services", "err", "Invalid service.");
  const publish = form.get("publish") === "1";
  const { data, error } = await supabase.from("services").update({ published: publish }).eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/services", "err", "Could not update the service.");
  refresh();
  return go("/admin/services", "ok", publish ? "Service published." : "Service unpublished.");
}

export async function deleteService(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/services", "err", "Invalid service.");
  const { data, error } = await supabase.from("services").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/services", "err", "Could not delete the service.");
  refresh();
  return go("/admin/services", "ok", "Service deleted.");
}
