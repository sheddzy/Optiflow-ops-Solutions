"use client";

import { useActionState } from "react";
import { resetPasswordWithCodeAction, type ResetPasswordState } from "./actions";

const initialState: ResetPasswordState = { error: "" };

export default function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordWithCodeAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="email" value={email} />
      <div>
        <label htmlFor="otp" className="mb-2 block text-sm font-medium text-[#304762]">Six-digit reset code</label>
        <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-center text-xl font-semibold tracking-[.4em] text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="••••••" />
        <p className="mt-2 text-xs text-[#7b899a]">Code sent to {email}</p>
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#304762]">New password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="At least 8 characters" />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-[#304762]">Confirm new password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="Enter the password again" />
      </div>
      {state.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="flex w-full items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#11284a] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Updating password..." : "Update password"}
      </button>
      <a href="/auth/sign-in" className="block text-center text-sm font-medium text-[#0b7886] hover:underline">Back to sign in</a>
    </form>
  );
}
