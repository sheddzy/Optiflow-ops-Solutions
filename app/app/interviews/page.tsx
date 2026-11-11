import Link from "next/link";
import { redirect } from "next/navigation";
import { neonAuth } from "@/lib/auth/neon";
import { getAgency,getCurrentAgencyMembership,recruitmentData } from "@/lib/recruitment/data";
import { signOutAction } from "../actions";
import InterviewWorkspace from "./InterviewWorkspace";

export const dynamic="force-dynamic";
type Row=Record<string,unknown>;
const val=(v:unknown)=>v==null?"":String(v);
export default async function InterviewsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
 const [{data:session},query]=await Promise.all([neonAuth.getSession(),searchParams]);
 if(!session?.user)redirect("/auth/sign-in");
 const membership=await getCurrentAgencyMembership();if(!membership)redirect("/app/setup");
 const [agency,apps,interviews]=await Promise.all([
  getAgency(membership.agency_id),
  recruitmentData<Row[]>(`applications?select=id,candidates(first_name,last_name,email),roles(job_title)&agency_id=eq.${membership.agency_id}&order=created_at.desc&limit=300`).catch(()=>[]),
  recruitmentData<Row[]>(`interviews?select=id,candidate_name_snapshot,candidate_email_snapshot,meeting_title,meeting_provider,scheduled_at,duration_minutes,meeting_url,status&agency_id=eq.${membership.agency_id}&order=scheduled_at.desc&limit=100`).catch(()=>[]),
 ]);
 const applicationRows=apps.map(a=>({id:val(a.id),candidate_name:`${val((a.candidates as Row|null)?.first_name)} ${val((a.candidates as Row|null)?.last_name)}`.trim(),candidate_email:val((a.candidates as Row|null)?.email),job_title:val((a.roles as Row|null)?.job_title)})).filter(a=>a.id);
 const interviewRows=interviews.map(i=>({id:val(i.id),candidate_name_snapshot:val(i.candidate_name_snapshot)||null,candidate_email_snapshot:val(i.candidate_email_snapshot)||null,meeting_title:val(i.meeting_title)||null,meeting_provider:val(i.meeting_provider)||null,scheduled_at:val(i.scheduled_at),duration_minutes:Number(i.duration_minutes)||60,meeting_url:val(i.meeting_url)||null,status:val(i.status)}));
 return <div className="min-h-screen bg-[#f4f7fb] text-[#172b4d]"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4eaf1] bg-white px-5 py-4 sm:px-8"><div><Link href="/app" className="text-sm font-bold text-[#1b3a63]">OptiFlow Recruitment</Link><h1 className="mt-1 text-xl font-bold">Interview scheduling</h1><p className="text-xs text-[#718096]">{agency?.name??"Agency workspace"}</p></div><div className="flex gap-3"><Link href="/app" className="text-sm text-[#0b7886]">Workspace</Link><form action={signOutAction}><button className="text-sm text-[#52657d]">Sign out</button></form></div></header><main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{typeof query.integration==="string"?<p className="mb-5 rounded-lg border border-[#dce4ed] bg-white p-3 text-sm text-[#52657d]">Integration status: {query.integration.replaceAll("_"," ")}.</p>:null}<InterviewWorkspace applications={applicationRows} interviews={interviewRows}/></main></div>;
}
