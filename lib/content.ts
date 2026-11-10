import { publicClient } from "./supabase";

export type Service = { id: string; title: string; slug: string; description: string; category: string | null; features: string[] };
export type Project = { id: string; title: string; slug: string; description: string; project_type: string; technologies: string[]; image_url: string | null };
export type Block = { title: string; content: string };

export async function getServices(): Promise<Service[]> {
  const db = publicClient();
  if (!db) { console.error("getServices: Supabase is not configured (variables missing at build time)"); return []; }
  const { data, error } = await db.from("services").select("id,title,slug,description,category,features").eq("published", true).order("sort_order");
  if (error) { console.error("getServices", error.message); return []; }
  return data ?? [];
}

export async function getProjects(limit?: number): Promise<Project[]> {
  const db = publicClient();
  if (!db) return [];
  let q = db.from("portfolio").select("id,title,slug,description,project_type,technologies,image_url").eq("published", true).order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) { console.error("getProjects", error.message); return []; }
  return data ?? [];
}

/** Editable copy from the site_content table. Falls back to the given defaults if the row is missing. */
export async function getBlocks(defaults: Record<string, Block>): Promise<Record<string, Block>> {
  const db = publicClient();
  const out = { ...defaults };
  if (!db) return out;
  const { data, error } = await db.from("site_content").select("section,title,content").in("section", Object.keys(defaults));
  if (error) { console.error("getBlocks", error.message); return out; }
  for (const r of data ?? []) out[r.section] = { title: r.title ?? defaults[r.section].title, content: r.content ?? defaults[r.section].content };
  return out;
}
