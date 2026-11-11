"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";

export type SignUpState = { error: string };

function secureMatch(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  return inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer);
}

export async function signUpAction(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const bootstrapCode = String(formData.get("bootstrapCode") ?? "");

  const allowedEmail = process.env.RECRUITMENT_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const expectedCode = process.env.RECRUITMENT_BOOTSTRAP_CODE;

  if (!allowedEmail || !expectedCode) {
    return { error: "Administrator setup is currently closed. Contact the platform administrator." };
  }

  if (email !== allowedEmail || !secureMatch(bootstrapCode, expectedCode)) {
    return { error: "The setup email or administrator setup code is incorrect." };
  }

  if (!name || !email || !password) {
    return { error: "Complete all fields." };
  }

  if (password.length < 12) {
    return { error: "Use a password with at least 12 characters." };
  }

  try {
    const { error } = await neonAuth.signUp.email({ name, email, password });
    if (error) return { error: error.message || "Unable to create the administrator account." };
  } catch {
    return { error: "Account creation failed. The email may already exist, or Neon Auth may be unavailable." };
  }

  redirect("/auth/sign-in?registered=1");
}
