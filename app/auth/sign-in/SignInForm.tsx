"use client";

import { useState, useActionState } from "react";
import {
  requestSignInCodeAction,
  signInWithPasswordAction,
  type SignInState,
} from "./actions";

const initialState: SignInState = { error: "" };

export default function SignInForm() {
  const [method, setMethod] = useState<"code" | "password">("code");
  const [codeState, codeAction, codePending] = useActionState(requestSignInCodeAction, initialState);
  const [passwordState, passwordAction, passwordPending] = useActionState(signInWithPasswordAction, initialState);
  const state = method === "code" ? codeState : passwordState;
  const pending = method === "code" ? codePending : passwordPending;

  return (
    <div className="mt-8">
      <div className="mb-5 grid grid-cols-2 rounded-lg bg-[#f1f5f9] p-1">
        <button type="button" onClick={() => setMethod("code")} className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${method === "code" ? "bg-white text-[#1b3a63] shadow-sm" : "text-[#7b899a]"}`}>Email code</button>
        <button type="button" onClick={() => setMethod("password")} className={`rounded-md px-3 py-2.5 text-sm font-semibold transition ${method === "password" ? "bg-white text-[#1b3a63] shadow-sm" : "text-[#7b899a]"}`}>Password</button>
      </div>

      <form action={method === "code" ? codeAction : passwordAction} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#304762]">Work email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none transition placeholder:text-[#a2adba] focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="you@company.com" />
        </div>

        {method === "password" ? (
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#304762]">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none transition placeholder:text-[#a2adba] focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="Enter your password" />
          </div>
        ) : null}
        {state.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p> : null}

        <button type="submit" disabled={pending} className="flex w-full items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#11284a] disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? (method === "code" ? "Sending code..." : "Signing in...") : (method === "code" ? "Send sign-in code" : "Sign in")}
        </button>
        {method === "code" ? (
          <p className="text-center text-xs leading-5 text-[#98a4b3]">We will email you a one-time 6-digit code. No password is required.</p>
        ) : (
          <div className="text-center"><a href="/auth/forgot-password" className="text-sm font-medium text-[#0b7886] hover:underline">Forgot password?</a></div>
        )}
      </form>
    </div>
  );
}
