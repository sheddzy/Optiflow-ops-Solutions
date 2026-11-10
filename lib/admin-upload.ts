import type { SupabaseClient } from "@supabase/supabase-js";
import { sniffImage } from "./admin";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Netlify requests cap at about 6 MB

/** Checks size and the file's real type (not its name), then stores it in the public media bucket. */
export async function uploadImage(supabase: SupabaseClient, file: File): Promise<{ url: string; path: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) return { error: "The image is larger than 4 MB. Compress it and try again." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(bytes);
  if (!kind) return { error: "Use a JPG, PNG or WebP image." };
  const path = `${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${kind.ext}`;
  const { error } = await supabase.storage.from("media").upload(path, bytes, { contentType: kind.mime, upsert: false });
  if (error) return { error: "The image could not be uploaded. Please try again." };
  return { url: supabase.storage.from("media").getPublicUrl(path).data.publicUrl, path };
}

export const mediaPathFromUrl = (url: string | null) => (url && url.includes("/media/") ? url.split("/media/").pop()!.split("?")[0] : null);
