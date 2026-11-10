"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin, slugify, SLUG_RE } from "@/lib/admin";
import { lagosToIso } from "@/lib/admin-format";
import { mediaPathFromUrl, uploadImage } from "@/lib/admin-upload";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(160),
  slug: z.string().trim().max(80),
  excerpt: z.string().trim().max(400, "Keep the summary under 400 characters."),
  category: z.string().trim().max(60),
  tags: z.string().max(300),
  author: z.string().trim().min(2, "Enter an author name.").max(80),
  seo_title: z.string().trim().max(70, "Keep the search title under 70 characters."),
  seo_description: z.string().trim().max(170, "Keep the search description under 170 characters."),
  body_md: z.string().max(100000),
  published_at: z.string().max(20),
});
const refresh = () => revalidatePath("/", "layout");

export async function savePost(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const back = id ? `/admin/blog/${id}` : "/admin/blog/new";
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) return go(back, "err", p.error.issues[0]?.message ?? "Invalid input.");
  const d = p.data;
  const slug = d.slug || slugify(d.title);
  if (!SLUG_RE.test(slug)) return go(back, "err", "The web address (slug) can use lowercase letters, numbers and hyphens only.");
  const tags = d.tags.split(",").map((t) => t.trim()).filter(Boolean);
  if (tags.length > 12 || tags.some((t) => t.length > 30)) return go(back, "err", "Use at most 12 tags of 30 characters each.");

  const published = form.get("published") === "on";
  let publishedAt: string | null = null;
  if (d.published_at) { publishedAt = lagosToIso(d.published_at); if (!publishedAt) return go(back, "err", "Check the publish date."); }
  if (published && !publishedAt) publishedAt = new Date().toISOString();
  if (published && !d.body_md.trim()) return go(back, "err", "Write the article before publishing it.");

  let existingCover: string | null = null;
  if (id) existingCover = (await supabase.from("posts").select("cover_url").eq("id", id).maybeSingle()).data?.cover_url ?? null;
  let cover = existingCover, uploadedPath: string | null = null;
  const file = form.get("cover");
  if (file instanceof File && file.size > 0) {
    const up = await uploadImage(supabase, file);
    if ("error" in up) return go(back, "err", up.error);
    cover = up.url; uploadedPath = up.path;
  } else if (form.get("remove_cover") === "on") cover = null;

  const row = { slug, title: d.title, excerpt: d.excerpt, body_md: d.body_md, cover_url: cover, category: d.category, tags, author: d.author, seo_title: d.seo_title, seo_description: d.seo_description, published, published_at: publishedAt };
  const q = id ? supabase.from("posts").update(row).eq("id", id) : supabase.from("posts").insert(row);
  const { data, error } = await q.select("id");
  if (error || !data?.length) {
    if (uploadedPath) await supabase.storage.from("media").remove([uploadedPath]);
    return go(back, "err", error?.code === "23505" ? "Another article already uses that web address. Change the slug." : "Could not save the article. Please try again.");
  }
  const old = mediaPathFromUrl(existingCover);
  if (old && cover !== existingCover) await supabase.storage.from("media").remove([old]);
  refresh();
  const future = published && publishedAt && new Date(publishedAt) > new Date();
  return go("/admin/blog", "ok", future ? "Article saved and scheduled. It appears on its publish date." : published ? "Article saved and live." : "Draft saved.");
}

export async function deletePost(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/blog", "err", "Invalid article.");
  const cur = (await supabase.from("posts").select("cover_url").eq("id", id.data).maybeSingle()).data;
  const { data, error } = await supabase.from("posts").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/blog", "err", "Could not delete the article.");
  const path = mediaPathFromUrl(cur?.cover_url ?? null);
  if (path) await supabase.storage.from("media").remove([path]);
  refresh();
  return go("/admin/blog", "ok", "Article deleted.");
}
