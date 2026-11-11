import type { Metadata } from "next";
import Image from "next/image";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in | OptiFlow Recruitment",
  description: "Sign in to your OptiFlow recruitment workspace with an email verification code.",
};

export default function RecruitmentSignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e5ebf2] bg-white p-7 shadow-[0_12px_40px_rgba(23,43,77,.07)] sm:p-9">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-12 w-auto object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b7886]">Recruitment workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1b3a63]">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-[#7b899a]">Enter your work email. We will send you a one-time code to access your recruitment workspace.</p>
        </div>
        <SignInForm />
        <p className="mt-7 text-center text-xs leading-5 text-[#98a4b3]">Access is provided by your workspace administrator.</p>
      </section>
    </main>
  );
}
