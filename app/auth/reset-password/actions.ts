"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type ResetPasswordState = { error: string };

export async function resetPasswordWithCodeAction(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const otp = String(formData.get("otp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return { error: "Enter the valid email address and six-digit reset code." };
  }
  if (password.length < 8) return { error: "Your new password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "The passwords do not match." };

  try {
    const auth = neonAuth as unknown as {
      emailOtp: {
        resetPassword(input: { email: string; otp: string; password: string }): Promise<{ error?: { message?: string } | null }>;
      };
    };
    const result = await auth.emailOtp.resetPassword({ email, otp, password });
    if (result?.error) return { error: result.error.message || "The reset code is invalid or has expired." };
  } catch {
    return { error: "We could not reset your password. Check the code and try again." };
  }

  redirect("/auth/sign-in?passwordReset=success");
}
