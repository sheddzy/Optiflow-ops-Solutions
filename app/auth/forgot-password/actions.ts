"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type ResetRequestState = { error: string };

export async function requestPasswordResetCodeAction(
  _previousState: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  try {
    const auth = neonAuth as unknown as {
      forgetPassword: {
        emailOtp(input: { email: string }): Promise<{ error?: { message?: string } | null }>;
      };
    };
    const result = await auth.forgetPassword.emailOtp({ email });
    if (result?.error) return { error: result.error.message || "Unable to send a reset code. Try again." };
  } catch {
    return { error: "We could not send a password reset code. Try again." };
  }

  redirect(`/auth/reset-password?email=${encodeURIComponent(email)}`);
}
