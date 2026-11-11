"use client";
import { useState } from "react";

type Application={id:string;candidate_name:string;candidate_email:string;job_title:string};
type Interview={id:string;candidate_name_snapshot:string|null;candidate_email_snapshot:string|null;meeting_title:string|null;meeting_provider:string|null;scheduled_at:string;duration_minutes:number;meeting_url:string|null;status:string};
export default function InterviewWorkspace({applications,interviews}:{applications:Application[];interviews:Interview[]}) {
 const [busy,setBusy]=useState(false); const [notice,setNotice]=useState(""); const [rescheduleAt,setRescheduleAt]=useState<Record<string,string>>({}); const [rescheduleDuration,setRescheduleDuration]=useState<Record<string,string>>({});
 const [applicationId,setApplicationId]=useState(applications[0]?.id??"");
 const [provider,setProvider]=useState("google_meet"); const [calendar,setCalendar]=useState("google");
 const [scheduledAt,setScheduledAt]=useState(""); const [duration,setDuration]=useState("45");
 const [emails,setEmails]=useState(""); const [title,setTitle]=useState("");
 async function schedule(event:React.FormEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true);setNotice("");
  try {
   const response=await fetch("/api/interviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    applicationId,meetingProvider:provider,calendarProvider:calendar,scheduledAt:new Date(scheduledAt).toISOString(),durationMinutes:Number(duration),
    timezone:"Africa/Lagos",interviewerEmails:emails.split(",").map(v=>v.trim()).filter(Boolean),meetingTitle:title||"Candidate interview",
   })});
   const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not schedule interview.");
   setNotice("Interview created and calendar invitations requested.");window.location.reload();
  } catch(error) {setNotice(error instanceof Error?error.message:"Scheduling failed.");}
  finally {setBusy(false);}
 }
 async function reschedule(id:string) {
  const value=rescheduleAt[id]; if(!value){setNotice("Choose a new date and time.");return;}
  setBusy(true);setNotice("");
  try {const response=await fetch(`/api/interviews/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({scheduledAt:new Date(value).toISOString(),durationMinutes:Number(rescheduleDuration[id]||45)})});const data=await response.json();if(!response.ok)throw new Error(data.error);setNotice("Interview rescheduled and calendar event updated.");window.location.reload();}
  catch(error){setNotice(error instanceof Error?error.message:"Rescheduling failed.");}finally{setBusy(false);}
 }
 async function cancel(id:string) {
  if(!window.confirm("Cancel this interview and remove its calendar event?"))return;
  setBusy(true);setNotice("");
  try {const response=await fetch(`/api/interviews/${id}`,{method:"DELETE"});const data=await response.json();if(!response.ok)throw new Error(data.error);setNotice("Interview cancelled.");window.location.reload();}
  catch(error){setNotice(error instanceof Error?error.message:"Cancellation failed.");}finally{setBusy(false);}
 }
 return <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
  <section className="rounded-xl border border-[#e5ebf2] bg-white p-5"><h2 className="font-bold text-[#1b3a63]">Schedule an interview</h2><p className="mt-1 text-xs leading-5 text-[#718096]">Connect the relevant provider first. Availability is checked against the connected calendar before a meeting is created.</p>
   <div className="mt-4 grid gap-2 sm:grid-cols-3"><a href="/api/integrations/google/connect" className="rounded-lg border p-3 text-center text-xs font-semibold text-[#1b3a63]">Connect Google</a><a href="/api/integrations/microsoft/connect" className="rounded-lg border p-3 text-center text-xs font-semibold text-[#1b3a63]">Connect Microsoft</a><a href="/api/integrations/zoom/connect" className="rounded-lg border p-3 text-center text-xs font-semibold text-[#1b3a63]">Connect Zoom</a></div>
   <form onSubmit={schedule} className="mt-5 grid gap-3">
    <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Candidate / application<select required value={applicationId} onChange={e=>setApplicationId(e.target.value)} className="rounded-lg border p-3 text-sm font-normal"><option value="">Select application</option>{applications.map(a=><option key={a.id} value={a.id}>{a.candidate_name} · {a.job_title}</option>)}</select></label>
    <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Meeting platform<select value={provider} onChange={e=>setProvider(e.target.value)} className="rounded-lg border p-3 text-sm font-normal"><option value="google_meet">Google Meet</option><option value="microsoft_teams">Microsoft Teams</option><option value="zoom">Zoom</option></select></label>
    {provider==="zoom"?<label className="grid gap-1 text-xs font-semibold text-[#52657d]">Calendar for availability and invitations<select value={calendar} onChange={e=>setCalendar(e.target.value)} className="rounded-lg border p-3 text-sm font-normal"><option value="google">Google Calendar</option><option value="microsoft">Outlook Calendar</option></select></label>:null}
    <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Interview title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="First-stage interview" className="rounded-lg border p-3 text-sm font-normal"/></label>
    <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Date and time<input required type="datetime-local" value={scheduledAt} onChange={e=>setScheduledAt(e.target.value)} className="rounded-lg border p-3 text-sm font-normal"/></label>
    <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Duration<select value={duration} onChange={e=>setDuration(e.target.value)} className="rounded-lg border p-3 text-sm font-normal"><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option><option value="90">90 minutes</option><option value="120">120 minutes</option></select></label>
    <label className="grid gap-1 text-xs font-semibold text-[#52657d]">Interviewer email addresses (comma-separated)<input required type="text" value={emails} onChange={e=>setEmails(e.target.value)} placeholder="interviewer@company.com" className="rounded-lg border p-3 text-sm font-normal"/></label>
    <button disabled={busy||!applicationId} className="rounded-lg bg-[#1b3a63] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy?"Working…":"Check availability and schedule"}</button>
   </form>{notice?<p role="status" className="mt-3 text-xs text-[#52657d]">{notice}</p>:null}
  </section>
  <section className="rounded-xl border border-[#e5ebf2] bg-white p-5"><h2 className="font-bold text-[#1b3a63]">Interview calendar</h2><p className="mt-1 text-xs text-[#718096]">Upcoming and previous interviews for this agency.</p><div className="mt-4 divide-y divide-[#edf1f5]">{interviews.length?interviews.map(item=><article key={item.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold">{item.candidate_name_snapshot||item.candidate_email_snapshot||"Candidate interview"}</p><p className="mt-1 text-xs text-[#718096]">{item.meeting_title} · {item.meeting_provider?.replaceAll("_"," ")}</p><p className="mt-1 text-xs text-[#718096]">{new Date(item.scheduled_at).toLocaleString("en-NG",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Lagos"})} · {item.duration_minutes} min</p><p className="mt-1 text-xs text-[#718096]">Status: {item.status}</p>{item.meeting_url?<a href={item.meeting_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-[#0b7886]">Open meeting link</a>:null}</div>{item.status!=="cancelled"&&item.status!=="completed"?<div className="mt-3 flex flex-wrap gap-2"><input type="datetime-local" value={rescheduleAt[item.id]??""} onChange={e=>setRescheduleAt(v=>({...v,[item.id]:e.target.value}))} className="rounded border border-[#dce4ed] px-2 py-1.5 text-xs"/><select value={rescheduleDuration[item.id]??String(item.duration_minutes)} onChange={e=>setRescheduleDuration(v=>({...v,[item.id]:e.target.value}))} className="rounded border border-[#dce4ed] px-2 py-1.5 text-xs"><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option><option value="90">90 min</option><option value="120">120 min</option></select><button disabled={busy} onClick={()=>reschedule(item.id)} className="rounded-lg bg-[#edf4fb] px-3 py-2 text-xs font-semibold text-[#1b3a63]">Reschedule</button><button disabled={busy} onClick={()=>cancel(item.id)} className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-xs font-semibold text-[#9b3c3c]">Cancel</button></div>:null}</div></article>):<p className="py-8 text-sm text-[#718096]">No interviews have been scheduled yet.</p>}</div></section>
 </div>;
}
