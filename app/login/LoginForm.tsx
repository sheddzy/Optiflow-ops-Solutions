"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm({ denied }: { denied: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const message = state.error ?? (denied ? "This account does not have access." : undefined);
  return (
    <form action={action} className="mt-8 space-y-5">
      {message && <p role="alert" className="rounded-md border border-[#b42318]/30 bg-[#fef3f2] p-3 text-sm text-[#b42318]">{message}</p>}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-60">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
