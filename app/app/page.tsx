import Link from "next/link";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getAgency, getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { moduleNavigation } from "@/lib/recruitment/modules";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

async function getRows(path: string): Promise<Row[]> {
  return recruitmentData<Row[]>(path);
}

function count(rows: Row[]) {
  return rows.length.toLocaleString("en-NG");
}

function display(value: unknown) {
  return value === null || value === undefined ? "" : String(value);
}

export default async function RecruitmentDashboardPage() {
  const { data: session } = await neonAuth.getSession();
  if (!session?.user) redirect("/auth/sign-in");

  const membership = await getCurrentAgencyMembership();
  if (!membership) redirect("/app/setup");

  const agency = await getAgency(membership.agency_id);
  const agencyFilter = `agency_id=eq.${encodeURIComponent(membership.agency_id)}`;
  const safeRows = async (path: string) => {
    try {
      return { rows: await getRows(path), error: false };
    } catch {
      return { rows: [] as Row[], error: true };
    }
  };

  const now = new Date().toISOString();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const [clients, projects, roles, candidates, applications, interviews, placements, activities] = await Promise.all([
    safeRows(`clients?select=id&${agencyFilter}&limit=1000`),
    safeRows(`projects?select=id&${agencyFilter}&limit=1000`),
    safeRows(`roles?select=id,status&${agencyFilter}&limit=1000`),
    safeRows(`candidates?select=id&${agencyFilter}&limit=1000`),
    safeRows(`applications?select=id,status&${agencyFilter}&limit=1000`),
    safeRows(`interviews?select=id,scheduled_at&${agencyFilter}&scheduled_at=gte.${encodeURIComponent(now)}&scheduled_at=lte.${encodeURIComponent(nextWeek)}&limit=1000`),
    safeRows(`placements?select=id,status&${agencyFilter}&limit=1000`),
    safeRows(`recruitment_activities?select=id,summary,action,entity_type,created_at&${agencyFilter}&order=created_at.desc&limit=8`),
  ]);

  const dataWarning = [clients, projects, roles, candidates, applications, interviews, placements, activities].some((result) => result.error);
  const stages = [
    { label: "Sourced", value: "sourced" },
    { label: "Screening", value: "screening" },
    { label: "Interview", value: "interview" },
    { label: "Offer", value: "offer" },
  ];
  const displayName = session.user.name || session.user.email || "there";
  const today = new Intl.DateTimeFormat("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date());

  const metrics = [
    { label: "Active clients", value: count(clients.rows), note: "Client organisations", href: "/app/clients" },
    { label: "Open vacancies", value: count(roles.rows.filter((row) => row.status === "open")), note: `${count(roles.rows)} total roles`, href: "/app/roles" },
    { label: "Candidates", value: count(candidates.rows), note: "Candidate profiles", href: "/app/candidates" },
    { label: "Upcoming interviews", value: count(interviews.rows), note: "Scheduled in the next 7 days", href: "/app/interviews" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e4eaf1] bg-white lg:flex">
          <div className="border-b border-[#edf1f5] px-6 py-6">
            <Link href="/app" className="text-lg font-extrabold tracking-tight text-[#1b3a63]">OptiFlow <span className="text-[#0b7886]">Recruitment</span></Link>
            <p className="mt-1 truncate text-xs text-[#8492a3]">{agency?.name ?? "Agency workspace"}</p>
          </div>
          <nav aria-label="Recruitment modules" className="space-y-1 px-4 py-5">
            <Link href="/app" className="flex items-center gap-3 rounded-lg bg-[#edf4fb] px-3 py-2.5 text-sm font-semibold text-[#1b3a63]">▦ <span>Overview</span></Link>
            <Link href="/app/agents" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#65758b] hover:bg-[#f5f8fb]">♙ <span>My agent dashboard</span></Link>
            {moduleNavigation.map((item) => (
              <Link key={item.key} href={`/app/${item.key}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#65758b] transition hover:bg-[#f5f8fb] hover:text-[#1b3a63]">
                <span className="w-5 text-center">{item.icon}</span>{item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#edf1f5] p-4">
            <p className="mb-3 truncate text-xs text-[#8492a3]">{session.user.email}</p>
            <form action={signOutAction}><button className="w-full rounded-lg border border-[#e3eaf1] px-3 py-2 text-left text-xs font-semibold text-[#52657d] hover:bg-[#f5f8fb]">Sign out</button></form>
            <p className="mt-4 text-[11px] text-[#9aa7b7]">Powered by OptiFlow Ops Solutions</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex min-h-[72px] flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf1] bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs text-[#8b99aa]">Workspace / Overview</p>
              <h1 className="mt-1 text-lg font-bold text-[#1b3a63]">Recruitment overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="max-w-48 truncate text-xs font-medium text-[#718096]">{session.user.email}</span>
              <form action={signOutAction}><button className="rounded-lg border border-[#e3eaf1] px-3 py-2 text-xs font-semibold text-[#52657d] hover:bg-[#f5f8fb]">Sign out</button></form>
            </div>
          </header>

          <nav aria-label="Recruitment modules" className="flex gap-2 overflow-x-auto border-b border-[#e4eaf1] bg-white px-5 py-3 lg:hidden">
            <Link href="/app" className="shrink-0 rounded-lg bg-[#edf4fb] px-3 py-2 text-xs font-semibold text-[#1b3a63]">Overview</Link>
            <Link href="/app/agents" className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-[#65758b] hover:bg-[#f5f8fb]">My dashboard</Link>
            {moduleNavigation.map((item) => <Link key={item.key} href={`/app/${item.key}`} className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-[#65758b] hover:bg-[#f5f8fb]">{item.label}</Link>)}
          </nav>
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-[#0b7886]">{today}</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#1b3a63] sm:text-[28px]">Welcome, {displayName.split("@")[0]}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#718096]">{agency?.name ?? "Your agency"} recruitment activity at a glance.</p>
              </div>
              <Link href="/app/clients" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#11284a]">＋ Add a client</Link>
            </section>

            {dataWarning ? (
              <div className="mt-6 rounded-lg border border-[#ead9b2] bg-[#fffaf0] px-4 py-3 text-xs leading-5 text-[#785b24]">
                Some recruitment tables could not be reached. Check that both Neon recruitment migrations have been applied and that the Data API is enabled for this database.
              </div>
            ) : null}

            <section aria-label="Recruitment metrics" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Link key={metric.label} href={metric.href} className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] transition hover:border-[#cbd8e5]">
                  <p className="text-sm font-medium text-[#718096]">{metric.label}</p>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-[#1b3a63]">{metric.value}</p>
                  <p className="mt-1 text-xs text-[#98a4b3]">{metric.note}</p>
                </Link>
              ))}
            </section>

            <section className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <article className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#1b3a63]">Recruitment pipeline</h3>
                    <p className="mt-1 text-xs text-[#8a98a9]">Applications by current stage</p>
                  </div>
                  <Link href="/app/applications" className="text-xs font-semibold text-[#0b7886] hover:underline">Manage applications →</Link>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stages.map((stage) => {
                    const value = applications.rows.filter((row) => row.status === stage.value).length;
                    const total = Math.max(applications.rows.length, 1);
                    return (
                      <div key={stage.value} className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
                        <p className="text-xs font-medium text-[#8391a2]">{stage.label}</p>
                        <p className="mt-3 text-2xl font-bold text-[#1b3a63]">{value}</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e9eef4]"><div className="h-full rounded-full bg-[#0b7886]" style={{ width: `${Math.min(100, (value / total) * 100)}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 flex flex-wrap gap-5 border-t border-[#edf1f5] pt-4 text-xs text-[#718096]">
                  <span><strong className="text-[#1b3a63]">{count(projects.rows)}</strong> projects</span>
                  <span><strong className="text-[#1b3a63]">{count(applications.rows)}</strong> applications</span>
                  <span><strong className="text-[#1b3a63]">{count(placements.rows)}</strong> placements</span>
                </div>
              </article>

              <article className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] sm:p-6">
                <h3 className="font-bold text-[#1b3a63]">Recent activity</h3>
                <p className="mt-1 text-xs text-[#8a98a9]">Latest updates in this agency</p>
                {activities.rows.length ? (
                  <ul className="mt-5 space-y-4">
                    {activities.rows.map((activity) => (
                      <li key={String(activity.id)} className="border-l-2 border-[#d9e6ef] pl-3">
                        <p className="text-xs font-semibold text-[#52657d]">{display(activity.summary)}</p>
                        <p className="mt-1 text-[11px] text-[#98a4b3]">{display(activity.action)} · {display(activity.entity_type)} · {activity.created_at ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(activity.created_at))) : ""}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex min-h-36 flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm font-semibold text-[#52657d]">No activity to show</p>
                    <p className="mt-1 max-w-xs text-xs leading-5 text-[#98a4b3]">New client, vacancy and candidate updates will appear here.</p>
                  </div>
                )}
              </article>
            </section>

            <section className="mt-9" aria-labelledby="modules-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 id="modules-heading" className="text-lg font-bold text-[#1b3a63]">Recruitment workspace</h3>
                  <p className="mt-1 text-sm text-[#8290a1]">Open a module to add, search, edit or remove records.</p>
                </div>
                <span className="text-xs font-medium text-[#9aa7b7]">7 modules</span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {moduleNavigation.map((item) => (
                  <Link key={item.key} href={`/app/${item.key}`} className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] transition hover:border-[#cbd8e5]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4f9] text-xl text-[#456889]" aria-hidden="true">{item.icon}</span>
                    <h4 className="mt-4 font-bold text-[#1b3a63]">{item.label}</h4>
                    <p className="mt-2 text-xs font-semibold text-[#0b7886]">Open workspace →</p>
                  </Link>
                ))}
              </div>
            </section>

            <footer className="mt-10 border-t border-[#e3eaf1] py-5 text-xs text-[#9aa7b7]">
              OptiFlow Recruitment Workspace · Agency data is protected by Neon Row-Level Security.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
