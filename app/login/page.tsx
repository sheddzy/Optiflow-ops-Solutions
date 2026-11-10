import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { adminEnabled } from "@/lib/admin";
import LoginForm from "./LoginForm";
import { serverClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (!adminEnabled()) notFound();
  const { e } = await searchParams;
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && e !== "denied") {
      const { data: p } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (p?.role === "admin") redirect("/admin");
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <Image src="/brand/logo.png" alt="OptiFlow Ops Solutions" width={836} height={301} priority className="h-14 w-auto" />
        <h1 className="mt-8 text-2xl font-bold text-navy">Administrator sign in</h1>
        <LoginForm denied={e === "denied"} />
      </div>
    </main>
  );
}
