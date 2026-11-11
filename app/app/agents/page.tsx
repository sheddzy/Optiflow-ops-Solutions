import Link from "next/link";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { signOutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AgentWorkspaceEntry() {
  const { data: session } = await neonAuth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  const userId = String(session.user.id);
  try {
    const profiles = await recruitmentData<{ slug: string; is_active?: boolean }[]>(
      `recruiter_profiles?select=slug,is_active&agency_id=eq.${encodeURIComponent(membership.agency_id)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    );

    if (profiles[0]?.slug && profiles[0].is_active !== false) {
      redirect(`/app/agents/${encodeURIComponent(profiles[0].slug)}`);
    }

    const displayName = session.user.name || session.user.email?.split("@")[0] || "Recruiter";
    const slug = await recruitmentData<string>("rpc/ensure_my_recruiter_profile", {
      method: "POST",
      body: { p_display_name: displayName },
    });
    if (slug) redirect(`/app/agents/${encodeURIComponent(slug)}`);

    throw new Error("The recruiter profile could not be created.");
  } catch (error) {
    // Next.js redirect() throws internally; allow it to complete rather than rendering the fallback.
    if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    return (
      <main className="min-h-screen bg-[#f4f7fb] px-5 py-12 text-[#172b4d]">
        <section className="mx-auto max-w-xl rounded-xl border border-[#e5ebf2] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#1b3a63]">Agent dashboard is not ready</h1>
          <p className="mt-3 text-sm leading-6 text-[#65758b]">
            The system could not load or create your recruiter profile. This usually means the agency recruiter-profile migration has not been applied to the connected Neon database, or your agency membership is not active.
          </p>
          <p className="mt-2 text-xs leading-5 text-[#8a98a9]">
            Ask the agency administrator to verify the recruitment database setup. No dashboard records have been changed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app" className="rounded-lg bg-[#1b3a63] px-4 py-2.5 text-sm font-semibold text-white">Back to overview</Link>
            <form action={signOutAction}>
              <button className="rounded-lg border border-[#dce4ed] px-4 py-2.5 text-sm font-semibold text-[#52657d]">Sign out</button>
            </form>
          </div>
        </section>
      </main>
    );
  }
}
