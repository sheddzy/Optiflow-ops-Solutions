import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import VerifyCodeForm from "./VerifyCodeForm";

export const metadata: Metadata = {
  title: "Verify email | OptiFlow Recruitment",
  description: "Enter your email authentication code to access the OptiFlow recruitment workspace.",
};

export default async function VerifyCodePage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const normalizedEmail = (email ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[#e5ebf2] bg-white p-7 shadow-[0_12px_40px_rgba(23,43,77,.07)] sm:p-9">
        <div className="mb-8 flex justify-center">
          <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-12 w-auto object-contain" />
        </div>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b7886]">Email verification</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1b3a63]">Check your inbox</h1>
          <p className="mt-2 text-sm leading-6 text-[#7b899a]">A one-time authentication code has been requested for your account.</p>
        </div>
        <VerifyCodeForm email={normalizedEmail} />
        <p className="mt-7 text-center text-xs leading-5 text-[#98a4b3]">If the email does not arrive, check your spam folder or request another code from the sign-in page.</p>
      </section>
    </main>
  );
}
