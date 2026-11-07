"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin } from "@/lib/admin";

const schema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(2, "Enter a heading.").max(200),
  content: z.string().trim().min(5, "Enter some text.").max(2000, "Keep the text under 2000 characters."),
});

export async function saveContent(form: FormData) {
  const { supabase } = await requireAdmin();
  const p = schema.safeParse(Object.fromEntries(form));
  if (!p.success) return go("/admin/content", "err", p.error.issues[0]?.message ?? "Invalid input.");
  const { data, error } = await supabase.from("site_content").update({ title: p.data.title, content: p.data.content }).eq("id", p.data.id).select("id");
  if (error || !data?.length) return go("/admin/content", "err", "Could not save. Please try again.");
  revalidatePath("/", "layout");
  return go("/admin/content", "ok", "Text updated on the website.");
}
