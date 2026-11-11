"use client";

import { useActionState } from "react";
import { signUpAction, type SignUpState } from "./actions";

const initialState: SignUpState = { error: "" };

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-[#304762]">Full name</label>
        <input id="name" name="name" type="text" autoComplete="name" required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="Your full name" />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#304762]">Administrator email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="you@company.com" />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#304762]">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="At least 12 characters" />
      </div>
      <div>
        <label htmlFor="bootstrapCode" className="mb-2 block text-sm font-medium text-[#304762]">One-time administrator setup code</label>
        <input id="bootstrapCode" name="bootstrapCode" type="password" autoComplete="off" required className="w-full rounded-lg border border-[#dce5ee] bg-white px-4 py-3 text-sm text-[#172b4d] outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" placeholder="Enter the setup code" />
      </div>
      {state.error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="flex w-full items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#11284a] disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creating account..." : "Create administrator account"}
      </button>
    </form>
  );
}
