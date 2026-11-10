"use server";

import { go, requireAdmin } from "@/lib/admin";
import { uploadImage } from "@/lib/admin-upload";

export async function uploadMedia(form: FormData) {
  const { supabase } = await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return go("/admin/media", "err", "Choose an image to upload.");
  const up = await uploadImage(supabase, file);
  if ("error" in up) return go("/admin/media", "err", up.error);
  return go("/admin/media", "ok", "Image uploaded. Copy its link below.");
}

export async function deleteMedia(form: FormData) {
  const { supabase } = await requireAdmin();
  const path = String(form.get("path") ?? "");
  if (!/^\d{4}-\d{2}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path)) return go("/admin/media", "err", "Invalid file.");
  const { error } = await supabase.storage.from("media").remove([path]);
  if (error) return go("/admin/media", "err", "Could not delete the image.");
  return go("/admin/media", "ok", "Image deleted. Any page still using its link will show a broken image.");
}
