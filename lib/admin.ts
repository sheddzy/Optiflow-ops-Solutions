import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { serverClient } from "./supabase/server";

export const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"] as const;
export type Status = (typeof STATUSES)[number];
export const PROJECT_TYPES = ["Project", "Demonstration", "Prototype", "Case study"] as const;

/** Confirms a signed-in user with the admin role. Redirects to login otherwise. Call it in every admin page and action. */
/** The admin area is switched off for the first release. Set ENABLE_ADMIN=true to bring it back. */
export const adminEnabled = () => process.env.ENABLE_ADMIN === "true";

export const requireAdmin = cache(async () => {
  if (!adminEnabled()) notFound();
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/login?e=denied");
  return { supabase, user };
});

export function go(path: string, kind: "ok" | "err", message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(message)}`);
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" });

/** Detects the real image type from the first bytes, so a renamed file cannot slip through. */
export function sniffImage(b: Uint8Array): { ext: string; mime: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: "png", mime: "image/png" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { ext: "webp", mime: "image/webp" };
  return null;
}
