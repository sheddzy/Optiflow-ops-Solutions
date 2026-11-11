import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { getProviderAccessToken, type CalendarProvider } from "@/lib/recruitment/providers";

export const dynamic="force-dynamic";
const schema=z.object({
  applicationId:z.string().uuid(),
  meetingProvider:z.enum(["google_meet","microsoft_teams","zoom"]),
  calendarProvider:z.enum(["google","microsoft"]).optional(),
  scheduledAt:z.string().datetime(),
  durationMinutes:z.number().int().min(15).max(240),
  timezone:z.string().min(1).max(80).default("Africa/Lagos"),
  interviewerEmails:z.array(z.string().email()).min(1).max(20),
  meetingTitle:z.string().trim().min(3).max(180),
  meetingDescription:z.string().max(4000).optional().default(""),
});

type Application={id:string;candidate_id:string;candidates:{first_name:string;last_name:string;email:string|null}|null;roles:{job_title:string}|null};
async function providerFetch(url:string,token:string,init:RequestInit={}) {
  const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",...(init.headers??{})},cache:"no-store"});
  const data=await response.json().catch(()=>null);
  if(!response.ok) throw new Error(data?.error?.message??data?.error_description??data?.message??"Calendar provider request failed.");
  return data;
}
async function ensureFree(calendarProvider:"google"|"microsoft",token:string,start:Date,end:Date,timezone:string) {
  if(calendarProvider==="google") {
    const data=await providerFetch("https://www.googleapis.com/calendar/v3/freeBusy",token,{method:"POST",body:JSON.stringify({timeMin:start.toISOString(),timeMax:end.toISOString(),timeZone:timezone,items:[{id:"primary"}]})});
    const busy=data.calendars?.primary?.busy??[];
    if(busy.length) throw new Error("The connected calendar has a conflicting event at this time.");
  } else {
    const url=new URL("https://graph.microsoft.com/v1.0/me/calendarView");
    url.searchParams.set("startDateTime",start.toISOString()); url.searchParams.set("endDateTime",end.toISOString());
    const data=await providerFetch(url.toString(),token,{headers:{Prefer:`outlook.timezone="${timezone}"`}});
    if((data.value??[]).length) throw new Error("The connected calendar has a conflicting event at this time.");
  }
}
export async function POST(request:NextRequest) {
  const [{data:session},membership]=await Promise.all([neonAuth.getSession(),getCurrentAgencyMembership()]);
  if(!session?.user || !membership) return NextResponse.json({error:"Sign in to schedule an interview."},{status:401});
  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Check the interview details."},{status:400});
  const input=parsed.data;
  const start=new Date(input.scheduledAt), end=new Date(start.getTime()+input.durationMinutes*60000);
  if(start.getTime()<Date.now()+5*60000) return NextResponse.json({error:"Choose an interview time at least five minutes in the future."},{status:400});
  try {
    const apps=await recruitmentData<Application[]>(`applications?select=id,candidate_id,candidates(first_name,last_name,email),roles(job_title)&id=eq.${input.applicationId}&agency_id=eq.${membership.agency_id}&limit=1`);
    const application=apps[0]; if(!application) return NextResponse.json({error:"Application not found in this agency."},{status:404});
    const candidate=application.candidates;
    if(!candidate?.email) return NextResponse.json({error:"Add the candidate's email address before scheduling."},{status:400});
    const calendarProvider:CalendarProvider=input.meetingProvider==="google_meet"?"google":input.meetingProvider==="microsoft_teams"?"microsoft":(input.calendarProvider??"google");
    const {token}=await getProviderAccessToken(membership.agency_id,session.user.id,calendarProvider);
    await ensureFree(calendarProvider as "google"|"microsoft",token,start,end,input.timezone);
    const attendees=[{email:candidate.email},...input.interviewerEmails.map(email=>({email}))];
    let meetingUrl="",eventId="",meetingId="";
    if(input.meetingProvider==="google_meet") {
      const event=await providerFetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all",token,{method:"POST",body:JSON.stringify({
        summary:input.meetingTitle,description:input.meetingDescription,start:{dateTime:start.toISOString(),timeZone:input.timezone},end:{dateTime:end.toISOString(),timeZone:input.timezone},attendees,
        conferenceData:{createRequest:{requestId:crypto.randomUUID(),conferenceSolutionKey:{type:"hangoutsMeet"}}},
      })});
      eventId=event.id; meetingUrl=event.hangoutLink??event.conferenceData?.entryPoints?.find((p:{entryPointType:string;uri:string})=>p.entryPointType==="video")?.uri??"";
      if(!meetingUrl) throw new Error("Google created the calendar event but has not returned the Meet link yet. Refresh the interview record shortly.");
    } else if(input.meetingProvider==="microsoft_teams") {
      const event=await providerFetch("https://graph.microsoft.com/v1.0/me/events",token,{method:"POST",body:JSON.stringify({
        subject:input.meetingTitle,body:{contentType:"text",content:input.meetingDescription},start:{dateTime:start.toISOString().replace("Z",""),timeZone:"UTC"},end:{dateTime:end.toISOString().replace("Z",""),timeZone:"UTC"},
        attendees:attendees.map(a=>({emailAddress:{address:a.email},type:"required"})),isOnlineMeeting:true,onlineMeetingProvider:"teamsForBusiness",
      })});
      eventId=event.id; meetingUrl=event.onlineMeeting?.joinUrl??"";
      if(!meetingUrl) throw new Error("Microsoft created the calendar event but did not return a Teams join link.");
    } else {
      const zoom=await getProviderAccessToken(membership.agency_id,session.user.id,"zoom");
      const meeting=await providerFetch("https://api.zoom.us/v2/users/me/meetings",zoom.token,{method:"POST",body:JSON.stringify({
        topic:input.meetingTitle,type:2,start_time:start.toISOString(),duration:input.durationMinutes,timezone:input.timezone,agenda:input.meetingDescription,
        settings:{join_before_host:false,waiting_room:true,meeting_invitees:attendees.map(a=>({email:a.email}))},
      })});
      meetingId=String(meeting.id); meetingUrl=meeting.join_url;
      if(calendarProvider==="google") {
        const event=await providerFetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all",token,{method:"POST",body:JSON.stringify({summary:input.meetingTitle,description:`${input.meetingDescription}\n\nJoin Zoom: ${meetingUrl}`,start:{dateTime:start.toISOString(),timeZone:input.timezone},end:{dateTime:end.toISOString(),timeZone:input.timezone},attendees})});
        eventId=event.id;
      } else {
        const event=await providerFetch("https://graph.microsoft.com/v1.0/me/events",token,{method:"POST",body:JSON.stringify({subject:input.meetingTitle,body:{contentType:"text",content:`${input.meetingDescription}\n\nJoin Zoom: ${meetingUrl}`},start:{dateTime:start.toISOString().replace("Z",""),timeZone:"UTC"},end:{dateTime:end.toISOString().replace("Z",""),timeZone:"UTC"},attendees:attendees.map(a=>({emailAddress:{address:a.email},type:"required"}))})});
        eventId=event.id;
      }
    }
    const interview=await recruitmentData<{id:string}[]>("interviews",{method:"POST",body:{
      agency_id:membership.agency_id,application_id:input.applicationId,interview_type:"video",status:"scheduled",scheduled_at:start.toISOString(),duration_minutes:input.durationMinutes,
      location_or_link:meetingUrl,interviewer_email:input.interviewerEmails[0],interviewer_name:null,meeting_provider:input.meetingProvider,
      calendar_provider:calendarProvider,provider_event_id:eventId,provider_meeting_id:meetingId||null,meeting_url:meetingUrl,timezone:input.timezone,
      interviewer_emails:input.interviewerEmails,candidate_email_snapshot:candidate.email,candidate_name_snapshot:`${candidate.first_name} ${candidate.last_name}`,
      meeting_title:input.meetingTitle,meeting_description:input.meetingDescription,
    },prefer:"return=representation"});
    if(process.env.RESEND_API_KEY && process.env.RESEND_FROM) {
      const recipients=[candidate.email,...input.interviewerEmails];
      await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({
        from:process.env.RESEND_FROM,to:recipients,subject:`Interview scheduled: ${input.meetingTitle}`,
        text:`Your interview is scheduled for ${start.toLocaleString("en-NG",{timeZone:input.timezone})}.\n\nJoin: ${meetingUrl}\nDuration: ${input.durationMinutes} minutes.`,
      }),cache:"no-store"}).catch(()=>null);
    }
    return NextResponse.json({success:true,interview:interview[0],meetingUrl},{status:201});
  } catch(error) {
    return NextResponse.json({error:error instanceof Error?error.message:"Interview could not be scheduled."},{status:400});
  }
}
