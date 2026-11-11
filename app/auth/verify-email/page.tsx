import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import VerifyCodeForm from "./VerifyCodeForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verify email | OptiFlow Recruitment",
  description: "Enter the one-time code sent to your email to access the recruitment workspace.",
};

type PageProps = {
  searchParams: Promise<{ email?: string; resent?: string; resendError?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = String(params.email ?? "").trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e5ebf2] bg-white p-7 shadow-[0_12px_40px_rgba(23,43,77,.07)] sm:p-9">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-12 w-auto object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b7886]">Recruitment workspace</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1b3a63]">Check your email</h1>
          <p className="mt-2 text-sm leading-6 text-[#7b899a]">Enter the six-digit verification code to finish signing in.</p>
        </div>

        {validEmail ? (
          <VerifyCodeForm email={email} resent={params.resent === "1"} resendError={params.resendError === "1"} />
        ) : (
          <div className="mt-8 rounded-lg border border-[#dce5ee] bg-[#f7f9fc] px-4 py-3 text-sm text-[#53657a]">
            No valid email address was provided. Return to the sign-in page to request a code.
          </div>
        )}

        <p className="mt-7 text-center text-sm text-[#7b899a]">
          <Link href="/auth/sign-in" className="font-semibold text-[#0b7886] hover:underline">Back to sign in</Link>
        </p>
      </section>
    </main>
  );
}
