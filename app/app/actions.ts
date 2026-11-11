"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export async function signOutAction() {
  await neonAuth.signOut();
  redirect("/auth/sign-in");
}
