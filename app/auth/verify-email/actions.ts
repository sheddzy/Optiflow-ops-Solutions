"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type VerifyCodeState = { error: string };

export async function verifyEmailCodeAction(
  _previousState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "The email address is invalid. Return to sign in and request a new code." };
  }
  if (!/^\d{6}$/.test(otp)) {
    return { error: "Enter the 6-digit code sent to your email." };
  }

  try {
    const { error } = await neonAuth.signIn.emailOtp({ email, otp });
    if (error) {
      return { error: "That code is invalid or has expired. Request a new code and try again." };
    }
  } catch {
    return { error: "We could not verify that code. Request a new one and try again." };
  }

  redirect("/app");
}
