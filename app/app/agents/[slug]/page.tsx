import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getAgency, getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { signOutAction } from "../../actions";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

async function rows(path: string): Promise<Row[]> {
  return recruitmentData<Row[]>(path);
}

function value(row: Row, key: string) {
  const v = row[key];
  return v === null || v === undefined ? "" : String(v);
}

export default async function PrivateAgentDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { data: session }] = await Promise.all([params, neonAuth.getSession()]);
  if (!session?.user) redirect("/auth/sign-in");
  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  const agency = await getAgency(membership.agency_id);
  const userId = String(session.user.id);
  const profiles = await recruitmentData<{ user_id: string; display_name: string; slug: string; job_title: string | null; is_active: boolean }[]>(
    `recruiter_profiles?select=user_id,display_name,slug,job_title,is_active&agency_id=eq.${encodeURIComponent(membership.agency_id)}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  const profile = profiles[0];
  if (!profile || !profile.is_active) notFound();
  if (membership.role === "recruiter" && profile.user_id !== userId) notFound();

  const isOwn = profile.user_id === userId;
  const agencyFilter = `agency_id=eq.${encodeURIComponent(membership.agency_id)}`;
  const owner = `assigned_recruiter_user_id=eq.${encodeURIComponent(profile.user_id)}`;
  const [roles, applications, interviews, placements] = await Promise.all([
    rows(`roles?select=id,job_title,status,application_deadline,client_id&${agencyFilter}&${owner}&order=created_at.desc&limit=100`).catch(() => []),
    rows(`applications?select=id,candidate_id,role_id,status,applied_at&${agencyFilter}&${owner}&order=applied_at.desc&limit=100`).catch(() => []),
    rows(`interviews?select=id,application_id,scheduled_at,interview_type,status,location_or_link&${agencyFilter}&order=scheduled_at.asc&limit=100`).catch(() => []),
    rows(`placements?select=id,application_id,status,start_date,guarantee_end_date&${agencyFilter}&order=created_at.desc&limit=100`).catch(() => []),
  ]);
  const assignedApplicationIds = new Set(applications.map((item) => value(item, "id")));
  const ownInterviews = interviews.filter((item) => assignedApplicationIds.has(value(item, "application_id")));
  const ownPlacements = placements.filter((item) => assignedApplicationIds.has(value(item, "application_id")));
  const metrics = [
    { label: "Assigned vacancies", value: roles.length },
    { label: "My applications", value: applications.length },
    { label: "Upcoming interviews", value: ownInterviews.filter((item) => value(item, "status") === "scheduled" && new Date(value(item, "scheduled_at")) >= new Date()).length },
    { label: "Placements", value: ownPlacements.length },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
      <div className="mx-auto max-w-6xl px-5 py-7 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e9f0] pb-5">
          <div>
            <Link href="/app" className="text-sm font-bold text-[#1b3a63]">OptiFlow Recruitment</Link>
            <nav className="mt-3 flex flex-wrap gap-3 text-xs"><Link href="/app/communications" className="text-[#0b7886]">Communications</Link><Link href="/app/job-boards" className="text-[#0b7886]">Job boards</Link><Link href="/app/interviews" className="text-[#0b7886]">Interviews</Link></nav>
            <p className="mt-1 text-xs text-[#8190a2]">{agency?.name ?? "Agency workspace"} / Private recruiter workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#718096]">{session.user.email}</span>
            <form action={signOutAction}><button className="rounded-lg border border-[#dce4ed] bg-white px-3 py-2 text-xs font-semibold">Sign out</button></form>
          </div>
        </header>

        <section className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0b7886]">Agent workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1b3a63]">{profile.display_name}</h1>
            <p className="mt-1 text-sm text-[#718096]">{profile.job_title || "Recruiter"} · {isOwn ? "Your private dashboard" : "Agency management view"}</p>
          </div>
          <div className="rounded-lg border border-[#dce4ed] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a98a9]">Private dashboard URL</p>
            <p className="mt-1 break-all text-xs font-semibold text-[#1b3a63]">optiflowops.online/app/agents/{profile.slug}</p>
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <article key={metric.label} className="rounded-xl border border-[#e5ebf2] bg-white p-5"><p className="text-xs font-medium text-[#718096]">{metric.label}</p><p className="mt-3 text-3xl font-bold text-[#1b3a63]">{metric.value}</p></article>)}
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-[#e5ebf2] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold text-[#1b3a63]">Assigned vacancies</h2><Link href="/app/roles" className="text-xs font-semibold text-[#0b7886]">Open vacancies</Link></div>
            {roles.length ? <ul className="mt-4 divide-y divide-[#edf1f5]">{roles.slice(0,8).map((item) => <li key={value(item,"id")} className="py-3"><p className="text-sm font-semibold text-[#344b65]">{value(item,"job_title")}</p><p className="mt-1 text-xs text-[#8a98a9]">{value(item,"status").replaceAll("_"," ")}{value(item,"application_deadline") ? " · Deadline "+value(item,"application_deadline") : ""}</p></li>)}</ul> : <p className="py-8 text-sm text-[#8a98a9]">No vacancies are assigned to this recruiter yet.</p>}
          </article>
          <article className="rounded-xl border border-[#e5ebf2] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-bold text-[#1b3a63]">My applications</h2><Link href="/app/applications" className="text-xs font-semibold text-[#0b7886]">Open applications</Link></div>
            {applications.length ? <ul className="mt-4 divide-y divide-[#edf1f5]">{applications.slice(0,8).map((item) => <li key={value(item,"id")} className="py-3"><p className="text-sm font-semibold text-[#344b65]">Application {value(item,"id").slice(0,8)}</p><p className="mt-1 text-xs text-[#8a98a9]">{value(item,"status").replaceAll("_"," ")} · {value(item,"applied_at").slice(0,10)}</p></li>)}</ul> : <p className="py-8 text-sm text-[#8a98a9]">No applications assigned yet.</p>}
          </article>
          <article className="rounded-xl border border-[#e5ebf2] bg-white p-5">
            <h2 className="font-bold text-[#1b3a63]">Upcoming interviews</h2>
            {ownInterviews.length ? <ul className="mt-4 divide-y divide-[#edf1f5]">{ownInterviews.slice(0,8).map((item) => <li key={value(item,"id")} className="py-3"><p className="text-sm font-semibold text-[#344b65]">{value(item,"interview_type").replaceAll("_"," ")} interview</p><p className="mt-1 text-xs text-[#8a98a9]">{new Date(value(item,"scheduled_at")).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short"})}</p></li>)}</ul> : <p className="py-8 text-sm text-[#8a98a9]">No interviews linked to your assigned applications.</p>}
          </article>
          <article className="rounded-xl border border-[#e5ebf2] bg-white p-5">
            <h2 className="font-bold text-[#1b3a63]">Placement follow-through</h2>
            {ownPlacements.length ? <ul className="mt-4 divide-y divide-[#edf1f5]">{ownPlacements.slice(0,8).map((item) => <li key={value(item,"id")} className="py-3"><p className="text-sm font-semibold text-[#344b65]">Placement {value(item,"id").slice(0,8)}</p><p className="mt-1 text-xs text-[#8a98a9]">{value(item,"status").replaceAll("_"," ")} · Start {value(item,"start_date") || "Not set"} · Guarantee ends {value(item,"guarantee_end_date") || "Not set"}</p></li>)}</ul> : <p className="py-8 text-sm text-[#8a98a9]">No placements assigned to this recruiter yet.</p>}
          </article>
        </section>
      </div>
    </main>
  );
}
