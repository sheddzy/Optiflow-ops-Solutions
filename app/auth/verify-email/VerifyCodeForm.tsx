"use client";

import { useActionState } from "react";
import { verifyEmailCodeAction, type VerifyCodeState } from "./actions";
import { resendEmailCodeAction } from "../sign-in/actions";

const initialState: VerifyCodeState = { error: "" };

export default function VerifyCodeForm({
  email,
  resent,
  resendError,
}: {
  email: string;
  resent: boolean;
  resendError: boolean;
}) {
  const [state, formAction, pending] = useActionState(verifyEmailCodeAction, initialState);

  return (
    <div className="mt-8 space-y-5">
      <div className="rounded-lg bg-[#f5f8fb] px-4 py-3 text-center">
        <p className="text-xs text-[#7b899a]">Verification code sent to</p>
        <p className="mt-1 break-all text-sm font-semibold text-[#1b3a63]">{email}</p>
      </div>

      {resent ? <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">A new code has been sent.</p> : null}
      {resendError ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">We could not resend the code. Try again shortly.</p> : null}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="email" value={email} />
        <div>
          <label htmlFor="otp" className="mb-2 block text-sm font-medium text-[#304762]">Email verification code</label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            minLength={6}
            required
            autoFocus
            className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-center text-xl font-semibold tracking-[.45em] text-[#172b4d] outline-none transition placeholder:text-[#c1cad4] focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10"
            placeholder="000000"
          />
        </div>

        {state.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#11284a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Verifying..." : "Verify and continue"}
        </button>
      </form>

      <form action={resendEmailCodeAction}>
        <input type="hidden" name="email" value={email} />
        <button type="submit" className="w-full py-2 text-sm font-semibold text-[#0b7886] hover:underline">
          Resend verification code
        </button>
      </form>
    </div>
  );
}
