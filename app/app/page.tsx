import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recruitment Dashboard | OptiFlow",
  description: "Recruitment agency operations workspace.",
};

const navigation = [
  { label: "Overview", href: "#overview", icon: "▦", active: true },
  { label: "Clients", href: "#clients", icon: "▤" },
  { label: "Projects", href: "#projects", icon: "◫" },
  { label: "Roles & vacancies", href: "#roles", icon: "▣" },
  { label: "Candidates", href: "#candidates", icon: "♙" },
  { label: "Interviews", href: "#interviews", icon: "◷" },
  { label: "Placements", href: "#placements", icon: "✓" },
];

const metrics = [
  { label: "Active clients", value: "0", note: "No client records yet", icon: "▤" },
  { label: "Open vacancies", value: "0", note: "No open roles yet", icon: "▣" },
  { label: "Candidates", value: "0", note: "No candidate records yet", icon: "♙" },
  { label: "Interviews this week", value: "0", note: "No interviews scheduled", icon: "◷" },
];

const modules = [
  { id: "clients", title: "Clients", description: "Manage hiring organisations, contacts and client relationships.", action: "Client workspace", count: "0 clients", icon: "▤" },
  { id: "projects", title: "Projects", description: "Organise recruitment assignments, delivery teams and deadlines.", action: "Project workspace", count: "0 projects", icon: "◫" },
  { id: "roles", title: "Roles & vacancies", description: "Track job briefs, requirements, ownership and hiring progress.", action: "Vacancy workspace", count: "0 open roles", icon: "▣" },
  { id: "candidates", title: "Candidates", description: "Build a searchable candidate pool and manage application stages.", action: "Candidate workspace", count: "0 candidates", icon: "♙" },
  { id: "interviews", title: "Interviews", description: "Coordinate interview schedules, feedback and next steps.", action: "Interview calendar", count: "0 scheduled", icon: "◷" },
  { id: "placements", title: "Placements", description: "Record successful hires, placement details and outcomes.", action: "Placement records", count: "0 placements", icon: "✓" },
];

export default function RecruitmentDashboardPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e4eaf1] bg-white lg:flex">
          <div className="flex h-[76px] items-center gap-3 border-b border-[#edf1f5] px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1b3a63] text-lg font-bold text-white">O</div>
            <div>
              <p className="text-sm font-bold tracking-tight text-[#1b3a63]">OptiFlow</p>
              <p className="text-[11px] text-[#75849a]">Recruitment workspace</p>
            </div>
          </div>
          <div className="px-4 pt-6">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa7b7]">Workspace</p>
            <nav aria-label="Main navigation" className="mt-3 space-y-1">
              {navigation.map((item) => (
                <a key={item.label} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${item.active ? "bg-[#edf4fb] text-[#1b3a63]" : "text-[#65758b] hover:bg-[#f5f8fb] hover:text-[#1b3a63]"}`}>
                  <span className="w-5 text-center text-base" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t border-[#edf1f5] p-4">
            <div className="rounded-xl bg-[#f5f8fc] p-3">
              <p className="text-xs font-semibold text-[#304762]">Getting started</p>
              <p className="mt-1 text-xs leading-5 text-[#7a899c]">Set up your agency workspace by adding your first client.</p>
              <a href="#clients" className="mt-3 inline-flex text-xs font-semibold text-[#0b7886] hover:underline">Add a client <span aria-hidden="true" className="ml-1">→</span></a>
            </div>
            <p className="mt-4 px-1 text-[11px] text-[#9aa7b7]">Powered by OptiFlow Ops Solutions</p>
          </div>
        </aside>

        <main id="overview" className="min-w-0 flex-1">
          <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf1] bg-white px-5 py-4 sm:px-8">
            <div>
              <p className="text-xs font-medium text-[#8b99aa]">Workspace / Overview</p>
              <h1 className="mt-1 text-lg font-bold tracking-tight text-[#1b3a63] sm:text-xl">Recruitment overview</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-[#e3eaf1] px-3 py-1.5 text-xs font-medium text-[#718096] sm:inline-flex">Agency workspace</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f2f5] text-sm font-bold text-[#0b7886]" aria-label="Account">A</div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-[#0b7886]">Wednesday, 11 November 2026</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#1b3a63] sm:text-[28px]">Good morning</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#718096]">Here is the current picture of your recruitment operations. Your workspace is ready for its first records.</p>
              </div>
              <a href="#clients" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1b3a63] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#11284a]">＋ Add your first client</a>
            </section>

            <section aria-label="Recruitment metrics" className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article key={metric.label} className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[#718096]">{metric.label}</p>
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f5fa] text-lg text-[#52708f]" aria-hidden="true">{metric.icon}</span>
                  </div>
                  <p className="mt-4 text-3xl font-bold tracking-tight text-[#1b3a63]">{metric.value}</p>
                  <p className="mt-1 text-xs text-[#98a4b3]">{metric.note}</p>
                </article>
              ))}
            </section>

            <section className="mt-8 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
              <article className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-[#1b3a63]">Recruitment pipeline</h3>
                    <p className="mt-1 text-xs text-[#8a98a9]">Candidate progress across your hiring stages</p>
                  </div>
                  <span className="rounded-full bg-[#f2f5f8] px-2.5 py-1 text-[11px] font-semibold text-[#7c8b9d]">No data yet</span>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {["Sourced", "Screening", "Interview", "Offer"].map((stage) => (
                    <div key={stage} className="rounded-lg border border-[#edf1f5] bg-[#fbfcfe] p-4">
                      <p className="text-xs font-medium text-[#8391a2]">{stage}</p>
                      <p className="mt-3 text-2xl font-bold text-[#1b3a63]">0</p>
                      <div className="mt-3 h-1.5 rounded-full bg-[#e9eef4]" />
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-5 text-[#98a4b3]">Pipeline figures will populate when candidate records and applications are connected.</p>
              </article>

              <article className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] sm:p-6">
                <h3 className="font-bold text-[#1b3a63]">Recent activity</h3>
                <p className="mt-1 text-xs text-[#8a98a9]">Latest updates from your team</p>
                <div className="flex min-h-36 flex-col items-center justify-center py-6 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f5fa] text-lg text-[#8093a8]" aria-hidden="true">◷</span>
                  <p className="mt-3 text-sm font-semibold text-[#52657d]">No activity to show</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-[#98a4b3]">Client, vacancy and candidate updates will appear here.</p>
                </div>
              </article>
            </section>

            <section className="mt-9" aria-labelledby="modules-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 id="modules-heading" className="text-lg font-bold text-[#1b3a63]">Your recruitment workspace</h3>
                  <p className="mt-1 text-sm text-[#8290a1]">Core tools for managing recruitment delivery.</p>
                </div>
                <span className="text-xs font-medium text-[#9aa7b7]">6 modules</span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {modules.map((module) => (
                  <article id={module.id} key={module.id} className="rounded-xl border border-[#e5ebf2] bg-white p-5 shadow-[0_2px_8px_rgba(23,43,77,.03)] transition hover:border-[#cbd8e5]">
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4f9] text-xl text-[#456889]" aria-hidden="true">{module.icon}</span>
                      <span className="rounded-full bg-[#f5f7fa] px-2.5 py-1 text-[11px] font-medium text-[#8492a3]">{module.count}</span>
                    </div>
                    <h4 className="mt-4 font-bold text-[#1b3a63]">{module.title}</h4>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-[#7b899a]">{module.description}</p>
                    <p className="mt-4 border-t border-[#edf1f5] pt-3 text-xs font-semibold text-[#0b7886]">{module.action} <span aria-hidden="true">→</span></p>
                  </article>
                ))}
              </div>
            </section>

            <footer className="mt-10 border-t border-[#e3eaf1] py-5 text-xs text-[#9aa7b7]">
              OptiFlow Recruitment Workspace · Dashboard foundation
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
