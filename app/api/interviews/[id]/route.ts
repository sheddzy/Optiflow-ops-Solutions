import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { getProviderAccessToken } from "@/lib/recruitment/providers";

export const dynamic="force-dynamic";
type Interview={id:string;meeting_provider:"google_meet"|"microsoft_teams"|"zoom";calendar_provider:"google"|"microsoft"|"zoom";provider_event_id:string|null;provider_meeting_id:string|null;scheduled_at:string;duration_minutes:number;meeting_title:string|null;meeting_description:string|null;timezone:string;interviewer_emails:string[];candidate_email_snapshot:string|null;meeting_url:string|null;status:string};
const schema=z.object({scheduledAt:z.string().datetime(),durationMinutes:z.number().int().min(15).max(240)});
async function providerFetch(url:string,token:string,init:RequestInit={}) {
 const response=await fetch(url,{...init,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",...(init.headers??{})},cache:"no-store"});
 const data=await response.json().catch(()=>null);
 if(!response.ok) throw new Error(data?.error?.message??data?.message??"Calendar provider update failed.");
 return data;
}
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const [{data:session},membership,{id}]=await Promise.all([neonAuth.getSession(),getCurrentAgencyMembership(),params]);
 if(!session?.user||!membership) return NextResponse.json({error:"Sign in to reschedule an interview."},{status:401});
 const parsed=schema.safeParse(await request.json().catch(()=>null)); if(!parsed.success) return NextResponse.json({error:"Check the new interview date and duration."},{status:400});
 try {
  const rows=await recruitmentData<Interview[]>(`interviews?select=id,meeting_provider,calendar_provider,provider_event_id,provider_meeting_id,scheduled_at,duration_minutes,meeting_title,meeting_description,timezone,interviewer_emails,candidate_email_snapshot,meeting_url&id=eq.${id}&agency_id=eq.${membership.agency_id}&limit=1`);
  const interview=rows[0]; if(!interview||interview.status==="cancelled") return NextResponse.json({error:"Interview not found or already cancelled."},{status:404});
  const start=new Date(parsed.data.scheduledAt),end=new Date(start.getTime()+parsed.data.durationMinutes*60000);
  if(start.getTime()<Date.now()+5*60000) return NextResponse.json({error:"Choose a future time."},{status:400});
  const calendarProvider=interview.calendar_provider==="microsoft"?"microsoft":"google";
  const {token}=await getProviderAccessToken(membership.agency_id,session.user.id,calendarProvider);
  if(calendarProvider==="google"&&interview.provider_event_id) {
   const busy=await providerFetch("https://www.googleapis.com/calendar/v3/freeBusy",token,{method:"POST",body:JSON.stringify({timeMin:start.toISOString(),timeMax:end.toISOString(),timeZone:interview.timezone,items:[{id:"primary"}]})});
   if((busy.calendars?.primary?.busy??[]).some((b:{start:string;end:string})=>new Date(b.start)<end&&new Date(b.end)>start)) throw new Error("The connected calendar has a conflicting event at this time.");
   await providerFetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(interview.provider_event_id)}?sendUpdates=all`,token,{method:"PATCH",body:JSON.stringify({start:{dateTime:start.toISOString(),timeZone:interview.timezone},end:{dateTime:end.toISOString(),timeZone:interview.timezone}})});
  } else if(calendarProvider==="microsoft"&&interview.provider_event_id) {
   const view=await providerFetch(`https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${encodeURIComponent(start.toISOString())}&endDateTime=${encodeURIComponent(end.toISOString())}`,token);
   if((view.value??[]).some((event:{id:string})=>event.id!==interview.provider_event_id)) throw new Error("The connected calendar has a conflicting event at this time.");
   await providerFetch(`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(interview.provider_event_id)}`,token,{method:"PATCH",body:JSON.stringify({start:{dateTime:start.toISOString().replace("Z",""),timeZone:"UTC"},end:{dateTime:end.toISOString().replace("Z",""),timeZone:"UTC"}})});
  }
  if(interview.meeting_provider==="zoom"&&interview.provider_meeting_id) {
   const zoom=await getProviderAccessToken(membership.agency_id,session.user.id,"zoom");
   await providerFetch(`https://api.zoom.us/v2/meetings/${interview.provider_meeting_id}`,zoom.token,{method:"PATCH",body:JSON.stringify({start_time:start.toISOString(),duration:parsed.data.durationMinutes,timezone:interview.timezone})});
  }
  await recruitmentData(`interviews?id=eq.${id}&agency_id=eq.${membership.agency_id}`,{method:"PATCH",body:{scheduled_at:start.toISOString(),duration_minutes:parsed.data.durationMinutes,status:"scheduled"},prefer:"return=minimal"});
  return NextResponse.json({success:true});
 } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Interview could not be rescheduled."},{status:400}); }
}
export async function DELETE(_request:NextRequest,{params}:{params:Promise<{id:string}>}) {
 const [{data:session},membership,{id}]=await Promise.all([neonAuth.getSession(),getCurrentAgencyMembership(),params]);
 if(!session?.user||!membership) return NextResponse.json({error:"Sign in to cancel an interview."},{status:401});
 try {
  const rows=await recruitmentData<Interview[]>(`interviews?select=id,meeting_provider,calendar_provider,provider_event_id,provider_meeting_id,scheduled_at,duration_minutes,meeting_title,meeting_description,timezone,interviewer_emails,candidate_email_snapshot,meeting_url&id=eq.${id}&agency_id=eq.${membership.agency_id}&limit=1`);
  const interview=rows[0]; if(!interview) return NextResponse.json({error:"Interview not found."},{status:404});
  const provider=interview.calendar_provider==="microsoft"?"microsoft":"google";
  const {token}=await getProviderAccessToken(membership.agency_id,session.user.id,provider);
  if(interview.provider_event_id) {
   const url=provider==="google"?`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(interview.provider_event_id)}?sendUpdates=all`:`https://graph.microsoft.com/v1.0/me/events/${encodeURIComponent(interview.provider_event_id)}`;
   await providerFetch(url,token,{method:"DELETE"});
  }
  if(interview.meeting_provider==="zoom"&&interview.provider_meeting_id) {
   const zoom=await getProviderAccessToken(membership.agency_id,session.user.id,"zoom");
   await providerFetch(`https://api.zoom.us/v2/meetings/${interview.provider_meeting_id}`,zoom.token,{method:"DELETE"});
  }
  await recruitmentData(`interviews?id=eq.${id}&agency_id=eq.${membership.agency_id}`,{method:"PATCH",body:{status:"cancelled",cancelled_at:new Date().toISOString()},prefer:"return=minimal"});
  return NextResponse.json({success:true});
 } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Interview could not be cancelled."},{status:400}); }
}
