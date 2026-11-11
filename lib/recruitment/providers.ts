import "server-only";
import { recruitmentData } from "@/lib/recruitment/data";
import { decryptToken, encryptToken } from "@/lib/recruitment/token-crypto";

export type CalendarProvider = "google" | "microsoft" | "zoom";
type Connection = { id:string; provider:CalendarProvider; access_token_encrypted:string; refresh_token_encrypted:string|null; token_expires_at:string|null; provider_account_email:string|null };
const tokenUrl:Record<CalendarProvider,string>={google:"https://oauth2.googleapis.com/token",microsoft:"https://login.microsoftonline.com/common/oauth2/v2.0/token",zoom:"https://zoom.us/oauth/token"};

export async function getProviderAccessToken(agencyId:string,userId:string,provider:CalendarProvider) {
  const rows=await recruitmentData<Connection[]>(`calendar_connections?select=id,provider,access_token_encrypted,refresh_token_encrypted,token_expires_at,provider_account_email&agency_id=eq.${agencyId}&user_id=eq.${encodeURIComponent(userId)}&provider=eq.${provider}&connection_status=eq.active&limit=1`);
  const connection=rows[0];
  if(!connection) throw new Error(`Connect your ${provider} account before scheduling.`);
  const expired=!connection.token_expires_at || new Date(connection.token_expires_at).getTime()<Date.now()+60000;
  if(!expired) return {token:decryptToken(connection.access_token_encrypted),connection};
  if(!connection.refresh_token_encrypted) throw new Error(`Your ${provider} connection expired. Reconnect it.`);
  const prefix=provider==="google"?"GOOGLE":provider==="microsoft"?"MICROSOFT":"ZOOM";
  const clientId=process.env[`${prefix}_CLIENT_ID`], clientSecret=process.env[`${prefix}_CLIENT_SECRET`];
  if(!clientId || !clientSecret) throw new Error(`${provider} OAuth credentials are not configured.`);
  const refreshToken=decryptToken(connection.refresh_token_encrypted);
  const body=new URLSearchParams({grant_type:"refresh_token",refresh_token:refreshToken});
  const headers:Record<string,string>={"Content-Type":"application/x-www-form-urlencoded"};
  if(provider==="zoom") { headers.Authorization=`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`; }
  else { body.set("client_id",clientId); body.set("client_secret",clientSecret); }
  const response=await fetch(tokenUrl[provider],{method:"POST",headers,body,cache:"no-store"});
  const data=await response.json() as {access_token?:string;refresh_token?:string;expires_in?:number};
  if(!response.ok || !data.access_token) {
    await recruitmentData(`calendar_connections?id=eq.${connection.id}&agency_id=eq.${agencyId}`,{method:"PATCH",body:{connection_status:"error",last_error:"Token refresh failed"},prefer:"return=minimal"});
    throw new Error(`Could not refresh your ${provider} connection. Reconnect it.`);
  }
  await recruitmentData(`calendar_connections?id=eq.${connection.id}&agency_id=eq.${agencyId}`,{method:"PATCH",body:{
    access_token_encrypted:encryptToken(data.access_token),
    refresh_token_encrypted:data.refresh_token?encryptToken(data.refresh_token):connection.refresh_token_encrypted,
    token_expires_at:new Date(Date.now()+(data.expires_in??3600)*1000).toISOString(),
    connection_status:"active",last_error:null,
  },prefer:"return=minimal"});
  return {token:data.access_token,connection};
}
