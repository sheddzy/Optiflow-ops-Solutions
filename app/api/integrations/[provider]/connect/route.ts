import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { neonAuth } from "@/lib/auth/neon";
import { getCurrentAgencyMembership } from "@/lib/recruitment/data";

export const dynamic = "force-dynamic";
type Provider = "google" | "microsoft" | "zoom";
const config = {
  google: { env:"GOOGLE", auth:"https://accounts.google.com/o/oauth2/v2/auth", scope:"openid email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.freebusy" },
  microsoft: { env:"MICROSOFT", auth:"https://login.microsoftonline.com/common/oauth2/v2.0/authorize", scope:"openid profile email offline_access User.Read Calendars.ReadWrite OnlineMeetings.ReadWrite" },
  zoom: { env:"ZOOM", auth:"https://zoom.us/oauth/authorize", scope:"meeting:write:meeting meeting:read:meeting user:read:user" },
} as const;

export async function GET(request:NextRequest,{params}:{params:Promise<{provider:string}>}) {
  const {provider:raw}=await params;
  if(!["google","microsoft","zoom"].includes(raw)) return NextResponse.json({error:"Unsupported provider."},{status:404});
  const provider=raw as Provider;
  const [{data:session},membership]=await Promise.all([neonAuth.getSession(),getCurrentAgencyMembership()]);
  if(!session?.user || !membership) return NextResponse.redirect(new URL("/auth/sign-in",request.url));
  const settings=config[provider];
  const clientId=process.env[`${settings.env}_CLIENT_ID`];
  if(!clientId) return NextResponse.json({error:`${provider} OAuth is not configured yet.`},{status:503});
  const state=crypto.randomUUID();
  const redirectUri=`${process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin}/api/integrations/${provider}/callback`;
  const url=new URL(settings.auth);
  url.searchParams.set("client_id",clientId);
  url.searchParams.set("redirect_uri",redirectUri);
  url.searchParams.set("response_type","code");
  url.searchParams.set("scope",settings.scope);
  url.searchParams.set("state",state);
  if(provider==="google") { url.searchParams.set("access_type","offline"); url.searchParams.set("prompt","consent"); }
  if(provider==="microsoft") url.searchParams.set("response_mode","query");
  const jar=await cookies();
  jar.set("recruitment_oauth_state",state,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});
  jar.set("recruitment_oauth_provider",provider,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:600});
  return NextResponse.redirect(url);
}
