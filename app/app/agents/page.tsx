"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentWorkspaceRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/app"); }, [router]);
  return <main className="min-h-screen bg-[#f4f7fb] p-8 text-sm text-[#52657d]">Opening your recruitment workspace…</main>;
}
