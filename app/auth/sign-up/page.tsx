import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SignUpForm from "./SignUpForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administrator setup | OptiFlow Recruitment",
  description: "Create the first OptiFlow recruitment administrator account.",
};

export default function RecruitmentSignUpPage() {
  const setupEnabled = Boolean(
    process.env.RECRUITMENT_BOOTSTRAP_EMAIL && process.env.RECRUITMENT_BOOTSTRAP_CODE,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e5ebf2] bg-white p-7 shadow-[0_12px_40px_rgba(23,43,77,.07)] sm:p-9">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-12 w-auto object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b7886]">Recruitment workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1b3a63]">Administrator setup</h1>
          <p className="mt-2 text-sm leading-6 text-[#7b899a]">Create the initial administrator account using the email and one-time setup code configured for this deployment.</p>
        </div>
        {setupEnabled ? (
          <SignUpForm />
        ) : (
          <p role="status" className="mt-8 rounded-lg border border-[#dce5ee] bg-[#f7f9fc] px-4 py-3 text-sm text-[#53657a]">
            Administrator setup is closed. Configure the bootstrap environment variables to enable initial account creation.
          </p>
        )}
        <p className="mt-7 text-center text-sm text-[#7b899a]">
          Already have an account? <Link href="/auth/sign-in" className="font-semibold text-[#0b7886] hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
