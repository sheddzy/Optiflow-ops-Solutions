import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership, recruitmentData } from "@/lib/recruitment/data";
import { encryptToken } from "@/lib/recruitment/token-crypto";

export const dynamic = "force-dynamic";
type Provider="google"|"microsoft"|"zoom";
const tokenEndpoints:Record<Provider,string>={google:"https://oauth2.googleapis.com/token",microsoft:"https://login.microsoftonline.com/common/oauth2/v2.0/token",zoom:"https://zoom.us/oauth/token"};
const scopes:Record<Provider,string[]>={google:["calendar.events","calendar.freebusy"],microsoft:["Calendars.ReadWrite","OnlineMeetings.ReadWrite","offline_access"],zoom:["meeting:write:meeting","meeting:read:meeting"]};

export async function GET(request:NextRequest,{params}:{params:Promise<{provider:string}>}) {
  const {provider:raw}=await params;
  if(!["google","microsoft","zoom"].includes(raw)) return NextResponse.json({error:"Unsupported provider."},{status:404});
  const provider=raw as Provider;
  const jar=await cookies();
  const expected=jar.get("recruitment_oauth_state")?.value;
  const actual=request.nextUrl.searchParams.get("state");
  jar.delete("recruitment_oauth_state"); jar.delete("recruitment_oauth_provider");
  if(!expected || !actual || expected!==actual) return NextResponse.redirect(new URL("/app/interviews?integration=invalid_state",request.url));
  const error=request.nextUrl.searchParams.get("error");
  const code=request.nextUrl.searchParams.get("code");
  if(error || !code) return NextResponse.redirect(new URL("/app/interviews?integration=denied",request.url));
  const [{data:session},membership]=await Promise.all([neonAuth.getSession(),getCurrentAgencyMembership()]);
  if(!session?.user || !membership) return NextResponse.redirect(new URL("/auth/sign-in",request.url));
  const prefix=provider==="google"?"GOOGLE":provider==="microsoft"?"MICROSOFT":"ZOOM";
  const clientId=process.env[`${prefix}_CLIENT_ID`]; const clientSecret=process.env[`${prefix}_CLIENT_SECRET`];
  if(!clientId || !clientSecret) return NextResponse.redirect(new URL("/app/interviews?integration=not_configured",request.url));
  const redirectUri=`${process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin}/api/integrations/${provider}/callback`;
  const body=new URLSearchParams({grant_type:"authorization_code",code,redirect_uri:redirectUri,client_id:clientId,client_secret:clientSecret});
  const headers:Record<string,string>={"Content-Type":"application/x-www-form-urlencoded"};
  if(provider==="zoom") { headers.Authorization=`Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`; body.delete("client_id"); body.delete("client_secret"); }
  const tokenResponse=await fetch(tokenEndpoints[provider],{method:"POST",headers,body,cache:"no-store"});
  const token=await tokenResponse.json() as {access_token?:string;refresh_token?:string;expires_in?:number;scope?:string;token_type?:string};
  if(!tokenResponse.ok || !token.access_token) return NextResponse.redirect(new URL("/app/interviews?integration=token_error",request.url));
  let accountEmail:string|null=null;
  if(provider==="google") {
    const user=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${token.access_token}`}}).then(r=>r.ok?r.json():null).catch(()=>null) as {email?:string}|null;
    accountEmail=user?.email ?? null;
  } else if(provider==="microsoft") {
    const user=await fetch("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName",{headers:{Authorization:`Bearer ${token.access_token}`}}).then(r=>r.ok?r.json():null).catch(()=>null) as {mail?:string;userPrincipalName?:string}|null;
    accountEmail=user?.mail ?? user?.userPrincipalName ?? null;
  }
  await recruitmentData("calendar_connections?on_conflict=agency_id,user_id,provider",{
    method:"POST",
    body:{agency_id:membership.agency_id,user_id:session.user.id,provider,provider_account_email:accountEmail,
      access_token_encrypted:encryptToken(token.access_token),
      refresh_token_encrypted:token.refresh_token?encryptToken(token.refresh_token):null,
      token_expires_at:new Date(Date.now()+(token.expires_in??3600)*1000).toISOString(),
      scopes:token.scope?.split(" ") ?? scopes[provider],connection_status:"active",last_error:null},
    prefer:"resolution=merge-duplicates,return=minimal",
  });
  return NextResponse.redirect(new URL("/app/interviews?integration=connected",request.url));
}
