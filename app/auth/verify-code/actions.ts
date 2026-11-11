"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type VerifyCodeState = { error: string };

export async function verifySignInCodeAction(
  _previousState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();

  if (!email || !/^\d{6}$/.test(otp)) {
    return { error: "Enter the 6-digit code sent to your email." };
  }

  try {
    const auth = neonAuth as unknown as {
      signIn: {
        emailOtp(input: { email: string; otp: string }): Promise<{ error?: { message?: string } | null }>;
      };
    };
    const result = await auth.signIn.emailOtp({ email, otp });
    if (result?.error) return { error: result.error.message || "That code is invalid or has expired." };
  } catch {
    return { error: "That code could not be verified. Check it and try again." };
  }

  redirect("/app");
}
