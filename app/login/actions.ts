"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

const attempts = new Map<string, number[]>();
function tooMany(key: string) {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < 15 * 60_000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 8;
}

const schema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(200) });

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = (h.get("x-nf-client-connection-ip") ?? h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (tooMany(ip)) return { error: "Too many attempts. Wait 15 minutes and try again." };

  const parsed = schema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { error: "Enter your email and password." };

  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  // One generic message: never reveal whether the email exists.
  if (error) return { error: "Email or password is incorrect." };

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account does not have access." };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/login");
}
