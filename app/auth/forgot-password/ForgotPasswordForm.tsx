"use client";

import { useActionState } from "react";
import { requestPasswordResetCodeAction, type ResetRequestState } from "./actions";

const initialState: ResetRequestState = { error: "" };

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetCodeAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#304762]">Work email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none transition placeholder:text-[#a2adba] focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="you@company.com" />
      </div>
      {state.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="flex w-full items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#11284a] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Sending reset code..." : "Send password reset code"}
      </button>
      <a href="/auth/sign-in" className="block text-center text-sm font-medium text-[#0b7886] hover:underline">Back to sign in</a>
    </form>
  );
}
