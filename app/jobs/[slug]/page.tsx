import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";
type Job = { role_id:string; agency_name:string; job_title:string; public_slug:string|null; public_summary:string|null; description:string|null; responsibilities:string|null; requirements:string|null; location:string|null; employment_type:string|null; workplace_type:string|null; salary_min:number|null; salary_max:number|null; salary_currency:string; application_deadline:string|null; published_at:string|null };
async function getJob(slug:string) {
  const base=process.env.NEXT_PUBLIC_SITE_URL ?? "https://optiflowops.online";
  const response=await fetch(`${base}/api/public/jobs`,{cache:"no-store"});
  if(!response.ok) return null;
  const data=await response.json() as {jobs:Job[]};
  return data.jobs.find(job=>job.public_slug===slug || job.role_id===slug) ?? null;
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params; const job=await getJob(slug);
  return {title:job?job.job_title+" | OptiFlow Jobs":"Job not found",description:job?.public_summary ?? "View job opportunities on OptiFlow Recruitment.",alternates:{canonical:job?`/jobs/${job.public_slug||job.role_id}`:"/jobs"},openGraph:{title:job?.job_title??"OptiFlow Jobs",description:job?.public_summary??"Explore current job opportunities."}};
}
export default async function PublicJobDetail({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params; const job=await getJob(slug); if(!job) notFound();
  const salary=job.salary_min==null&&job.salary_max==null?"Not disclosed":`${job.salary_currency} ${job.salary_min??"—"} – ${job.salary_max??"—"}`;
  return <main className="min-h-screen bg-[#f4f7fb] px-5 py-8 text-[#172b4d] sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/jobs" className="text-sm font-semibold text-[#0b7886]">← All jobs</Link><div className="mt-5 grid gap-6 lg:grid-cols-[1fr_360px]"><article className="rounded-xl border border-[#e5ebf2] bg-white p-6 sm:p-8"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"JobPosting",title:job.job_title,description:job.description||job.public_summary||"",datePosted:job.published_at||undefined,validThrough:job.application_deadline||undefined,employmentType:job.employment_type?.toUpperCase(),hiringOrganization:{"@type":"Organization",name:job.agency_name},jobLocation:job.location?{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:job.location}}:undefined,jobLocationType:job.workplace_type==="remote"?"TELECOMMUTE":undefined})}}/><p className="text-xs font-semibold text-[#0b7886]">{job.agency_name}</p><h1 className="mt-2 text-2xl font-bold text-[#1b3a63]">{job.job_title}</h1><p className="mt-3 text-sm text-[#718096]">{[job.location,job.workplace_type,job.employment_type?.replaceAll("_"," ")].filter(Boolean).join(" · ")}</p><p className="mt-3 text-sm font-semibold">{salary}</p><div className="prose prose-sm mt-7 max-w-none whitespace-pre-wrap text-[#52657d]"><h2>About the role</h2>{job.description || job.public_summary || "Details will be provided by the hiring agency."}{job.responsibilities?<><h2>Responsibilities</h2>{job.responsibilities}</>:null}{job.requirements?<><h2>Requirements</h2>{job.requirements}</>:null}</div>{job.application_deadline?<p className="mt-7 text-xs text-[#718096]">Application deadline: {job.application_deadline}</p>:null}</article><aside className="h-fit rounded-xl border border-[#e5ebf2] bg-white p-5"><h2 className="font-bold text-[#1b3a63]">Apply for this position</h2><p className="mt-1 text-xs leading-5 text-[#718096]">Submit your details. The recruiting agency will receive your application in its dashboard.</p><ApplyForm roleId={job.role_id}/></aside></div></div></main>;
}
