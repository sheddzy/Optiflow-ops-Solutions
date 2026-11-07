"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, PROJECT_TYPES, requireAdmin, slugify, SLUG_RE, sniffImage } from "@/lib/admin";

const schema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Enter a title of at least 3 characters.").max(140),
  slug: z.string().trim().max(80),
  description: z.string().trim().min(10, "Enter a description of at least 10 characters.").max(3000),
  project_type: z.enum(PROJECT_TYPES, { message: "Choose a project type." }),
  technologies: z.string().max(500),
});

const refresh = () => { revalidatePath("/", "layout"); };
const MAX_BYTES = 4 * 1024 * 1024;
const pathFromUrl = (url: string | null) => (url && url.includes("/portfolio/") ? url.split("/portfolio/").pop()!.split("?")[0] : null);

export async function savePortfolio(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const back = id ? `/admin/portfolio/${id}` : "/admin/portfolio/new";
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) return go(back, "err", p.error.issues[0]?.message ?? "Invalid input.");

  const slug = p.data.slug || slugify(p.data.title);
  if (!SLUG_RE.test(slug)) return go(back, "err", "The web address (slug) can use lowercase letters, numbers and hyphens only.");
  const technologies = p.data.technologies.split(",").map((t) => t.trim()).filter(Boolean);
  if (technologies.length > 20 || technologies.some((t) => t.length > 40)) return go(back, "err", "Use at most 20 technologies of 40 characters each.");

  let existingUrl: string | null = null;
  if (id) {
    const { data } = await supabase.from("portfolio").select("image_url").eq("id", id).maybeSingle();
    existingUrl = data?.image_url ?? null;
  }

  // Optional image upload, checked by size and real file type.
  let image_url = existingUrl;
  let uploadedPath: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_BYTES) return go(back, "err", "The image is larger than 4 MB. Compress it and try again.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) return go(back, "err", "Use a JPG, PNG or WebP image.");
    uploadedPath = `${crypto.randomUUID()}.${kind.ext}`;
    const { error } = await supabase.storage.from("portfolio").upload(uploadedPath, bytes, { contentType: kind.mime, upsert: false });
    if (error) return go(back, "err", "The image could not be uploaded. Please try again.");
    image_url = supabase.storage.from("portfolio").getPublicUrl(uploadedPath).data.publicUrl;
  } else if (form.get("remove_image") === "on") {
    image_url = null;
  }

  const row = { title: p.data.title, slug, description: p.data.description, project_type: p.data.project_type, technologies, image_url, published: form.get("published") === "on" };
  const q = id ? supabase.from("portfolio").update(row).eq("id", id) : supabase.from("portfolio").insert(row);
  const { data, error } = await q.select("id");
  if (error || !data?.length) {
    if (uploadedPath) await supabase.storage.from("portfolio").remove([uploadedPath]); // do not leave an orphan file
    return go(back, "err", error?.code === "23505" ? "Another project already uses that web address. Change the slug." : "Could not save the project. Please try again.");
  }
  const oldPath = pathFromUrl(existingUrl);
  if (oldPath && image_url !== existingUrl) await supabase.storage.from("portfolio").remove([oldPath]);
  refresh();
  return go("/admin/portfolio", "ok", "Project saved.");
}

export async function togglePortfolio(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/portfolio", "err", "Invalid project.");
  const publish = form.get("publish") === "1";
  const { data, error } = await supabase.from("portfolio").update({ published: publish }).eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/portfolio", "err", "Could not update the project.");
  refresh();
  return go("/admin/portfolio", "ok", publish ? "Project published." : "Project unpublished.");
}

export async function deletePortfolio(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/portfolio", "err", "Invalid project.");
  const { data: cur } = await supabase.from("portfolio").select("image_url").eq("id", id.data).maybeSingle();
  const { data, error } = await supabase.from("portfolio").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go("/admin/portfolio", "err", "Could not delete the project.");
  const path = pathFromUrl(cur?.image_url ?? null);
  if (path) await supabase.storage.from("portfolio").remove([path]);
  refresh();
  return go("/admin/portfolio", "ok", "Project deleted.");
}
