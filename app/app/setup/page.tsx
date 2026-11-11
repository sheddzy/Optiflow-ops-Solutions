import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership } from "@/lib/recruitment/data";
import { createAgencyAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function RecruitmentSetupPage() {
  const { data: session } = await neonAuth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const membership = await getCurrentAgencyMembership();
  if (membership) redirect("/app");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-12 text-[#172b4d]">
      <section className="w-full max-w-xl rounded-2xl border border-[#e5ebf2] bg-white p-7 shadow-sm sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#0b7886]">Recruitment workspace setup</p>
        <h1 className="mt-3 text-2xl font-bold text-[#1b3a63]">Create your agency workspace</h1>
        <p className="mt-2 text-sm leading-6 text-[#718096]">
          Your agency workspace keeps clients, candidates, vacancies and recruitment records separate from other agencies.
        </p>
        <form action={createAgencyAction} className="mt-7 space-y-5">
          <div>
            <label htmlFor="agency_name" className="mb-2 block text-sm font-semibold">Agency name</label>
            <input id="agency_name" name="agency_name" required minLength={2} maxLength={160} placeholder="e.g. OptiFlow Recruitment" className="w-full rounded-lg border border-[#dce4ed] px-3 py-3 text-sm outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" />
          </div>
          <div>
            <label htmlFor="agency_slug" className="mb-2 block text-sm font-semibold">Workspace URL name</label>
            <input id="agency_slug" name="agency_slug" maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="optiflow-recruitment" className="w-full rounded-lg border border-[#dce4ed] px-3 py-3 text-sm outline-none focus:border-[#0b7886] focus:ring-2 focus:ring-[#0b7886]/10" />
            <p className="mt-1 text-xs text-[#8a98a9]">Lowercase letters, numbers and hyphens. Leave blank to generate it from the agency name.</p>
          </div>
          <button type="submit" className="w-full rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#11284a]">Create workspace</button>
        </form>
      </section>
    </main>
  );
}
