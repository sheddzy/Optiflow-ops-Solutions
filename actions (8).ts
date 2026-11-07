"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { go, requireAdmin, STATUSES } from "@/lib/admin";

const update = z.object({
  id: z.string().uuid(),
  status: z.enum(STATUSES),
  internal_notes: z.string().max(5000, "Notes are limited to 5000 characters."),
});

export async function updateEnquiry(form: FormData) {
  const { supabase } = await requireAdmin();
  const p = update.safeParse(Object.fromEntries(form));
  if (!p.success) return go("/admin/enquiries", "err", p.error.issues[0]?.message ?? "Invalid input.");
  const path = `/admin/enquiries/${p.data.id}`;
  const { data, error } = await supabase.from("enquiries").update({ status: p.data.status, internal_notes: p.data.internal_notes.trim() || null }).eq("id", p.data.id).select("id");
  if (error || !data?.length) return go(path, "err", "Could not save changes. Please try again.");
  revalidatePath("/admin", "layout");
  return go(path, "ok", "Changes saved.");
}

export async function deleteEnquiry(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return go("/admin/enquiries", "err", "Invalid enquiry.");
  const { data, error } = await supabase.from("enquiries").delete().eq("id", id.data).select("id");
  if (error || !data?.length) return go(`/admin/enquiries/${id.data}`, "err", "Could not delete the enquiry.");
  revalidatePath("/admin", "layout");
  return go("/admin/enquiries", "ok", "Enquiry deleted.");
}
