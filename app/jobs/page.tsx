import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Find Jobs | OptiFlow Recruitment", description: "Browse current job opportunities and apply directly through OptiFlow Recruitment." };

type Job = { role_id: string; agency_name: string; agency_slug: string; job_title: string; public_slug: string | null; public_summary: string | null; location: string | null; employment_type: string | null; workplace_type: string | null; salary_min: number | null; salary_max: number | null; salary_currency: string; published_at: string | null; application_deadline: string | null };

async function getJobs(search: Record<string,string | string[] | undefined>) {
  const qs = new URLSearchParams();
  for (const key of ["q","location","workplace","employment"]) {
    const value = search[key];
    if (typeof value === "string" && value) qs.set(key,value);
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://optiflowops.online";
  const response = await fetch(`${base}/api/public/jobs?${qs.toString()}`,{cache:"no-store"});
  if (!response.ok) return [] as Job[];
  const data = await response.json() as {jobs:Job[]};
  return data.jobs ?? [];
}

const salary = (job: Job) => job.salary_min == null && job.salary_max == null ? "Salary not disclosed" : `${job.salary_currency} ${job.salary_min ?? "—"} – ${job.salary_max ?? "—"}`;

export default async function PublicJobsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const search = await searchParams;
  const jobs = await getJobs(search);
  return <main className="min-h-screen bg-[#f4f7fb] text-[#172b4d]">
    <header className="border-b border-[#e4eaf1] bg-white px-5 py-5 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/" className="font-bold text-[#1b3a63]">OptiFlow Recruitment</Link><Link href="/auth/sign-in" className="text-sm text-[#0b7886]">Recruiter sign in</Link></div></header>
    <section className="bg-[#1b3a63] px-5 py-14 text-white sm:px-8"><div className="mx-auto max-w-6xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#a8c5df]">Career opportunities</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Find your next opportunity</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#d7e4f0]">Explore vacancies shared by recruitment agencies and apply directly.</p>
      <form className="mt-7 grid gap-3 rounded-xl bg-white p-3 md:grid-cols-[1fr_1fr_auto]"><input name="q" defaultValue={typeof search.q==="string"?search.q:""} placeholder="Job title or keyword" className="rounded-lg border border-[#dce4ed] p-3 text-sm text-[#172b4d]"/><input name="location" defaultValue={typeof search.location==="string"?search.location:""} placeholder="Location" className="rounded-lg border border-[#dce4ed] p-3 text-sm text-[#172b4d]"/><button className="rounded-lg bg-[#0b7886] px-6 py-3 text-sm font-semibold text-white">Search jobs</button></form>
    </div></section>
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Open positions</h2><p className="text-xs text-[#718096]">{jobs.length} vacancies</p></div>
      {jobs.length ? <div className="grid gap-4 md:grid-cols-2">{jobs.map(job=><article key={job.role_id} className="rounded-xl border border-[#e5ebf2] bg-white p-5"><p className="text-xs font-semibold text-[#0b7886]">{job.agency_name}</p><h3 className="mt-2 text-lg font-bold text-[#1b3a63]">{job.job_title}</h3><p className="mt-2 text-sm text-[#718096]">{[job.location,job.workplace_type,job.employment_type?.replaceAll("_"," ")].filter(Boolean).join(" · ")}</p><p className="mt-3 text-sm text-[#52657d]">{job.public_summary || "Explore the role and application requirements."}</p><p className="mt-4 text-xs font-semibold text-[#52657d]">{salary(job)}</p><Link href={`/jobs/${job.public_slug || job.role_id}`} className="mt-5 inline-flex rounded-lg bg-[#1b3a63] px-4 py-2.5 text-sm font-semibold text-white">View job and apply</Link></article>)}</div> : <div className="rounded-xl border border-dashed border-[#cbd6e2] bg-white p-10 text-center"><h3 className="font-semibold">No matching vacancies</h3><p className="mt-2 text-sm text-[#718096]">Try another keyword or location. New opportunities will appear here when agencies publish them.</p></div>}
    </section>
    <footer className="border-t border-[#e4eaf1] bg-white px-5 py-6 text-center text-xs text-[#8190a2]">OptiFlow Recruitment · Public job listings</footer>
  </main>;
}
