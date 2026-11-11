"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type SignInState = { error: string };

export async function signInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  try {
    const { error } = await neonAuth.signIn.email({ email, password });
    if (error) return { error: error.message || "Unable to sign in. Check your details." };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again." };
  }

  redirect("/app");
}
