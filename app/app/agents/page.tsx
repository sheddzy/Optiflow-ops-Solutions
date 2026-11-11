import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";

export const dynamic = "force-dynamic";

export default async function AgentWorkspaceEntry() {
  const { data: session } = await neonAuth.getSession();
  if (!session?.user) redirect("/auth/sign-in");
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");
  const userId = String(session.user.id);
  let profiles = await recruitmentData<{ slug: string }[]>(
    `recruiter_profiles?select=slug&agency_id=eq.${encodeURIComponent(membership.agency_id)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  if (!profiles.length) {
    const displayName = session.user.name || session.user.email?.split("@")[0] || "Recruiter";
    const slug = await recruitmentData<string>("rpc/ensure_my_recruiter_profile", {
      method: "POST",
      body: { p_display_name: displayName },
    });
    profiles = [{ slug }];
  }
  redirect(`/app/agents/${encodeURIComponent(profiles[0].slug)}`);
}
