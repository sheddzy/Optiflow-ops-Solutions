"use server";

import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type SignInState = { error: string };

export async function requestSignInCodeAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid work email address." };
  }

  try {
    const auth = neonAuth as unknown as {
      emailOtp: {
        sendVerificationOtp(input: { email: string; type: "sign-in" }): Promise<{ error?: { message?: string } | null }>;
      };
    };
    const result = await auth.emailOtp.sendVerificationOtp({ email, type: "sign-in" });
    if (result?.error) return { error: result.error.message || "Unable to send your code. Try again." };
  } catch {
    return { error: "We could not send a sign-in code. Check the email address and try again." };
  }

  redirect(`/auth/verify-code?email=${encodeURIComponent(email)}`);
}

export async function signInWithPasswordAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return { error: "Enter your email address and password." };
  }

  try {
    const auth = neonAuth as unknown as {
      signIn: {
        email(input: { email: string; password: string }): Promise<{ error?: { message?: string } | null }>;
      };
    };
    const result = await auth.signIn.email({ email, password });
    if (result?.error) return { error: result.error.message || "Email or password is incorrect." };
  } catch {
    return { error: "Unable to sign in. Check your details and try again." };
  }

  redirect("/app");
}
