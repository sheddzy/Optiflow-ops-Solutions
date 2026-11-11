"use server";

import { redirect } from "next/navigation";
import { sendRecruitmentSignInCode } from "@/lib/auth/neon-otp";

export type SignInState = { error: string };

function normaliseEmail(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim().toLowerCase();
}

async function sendSignInCode(email: string): Promise<string | null> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid work email address.";
  }

  try {
    const sent = await sendRecruitmentSignInCode(email);
    if (!sent) {
      return "We could not send a sign-in code. Check the email address or try again shortly.";
    }
    return null;
  } catch {
    return "Email verification is temporarily unavailable. Please try again.";
  }
}

export async function requestEmailCodeAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = normaliseEmail(formData.get("email"));
  const error = await sendSignInCode(email);
  if (error) return { error };

  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}`);
}

export async function resendEmailCodeAction(formData: FormData): Promise<void> {
  const email = normaliseEmail(formData.get("email"));
  const error = await sendSignInCode(email);
  if (error) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&resendError=1`);
  }
  redirect(`/auth/verify-email?email=${encodeURIComponent(email)}&resent=1`);
}
