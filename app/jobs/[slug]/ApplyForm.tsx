"use client";
import { useState } from "react";

export default function ApplyForm({roleId}:{roleId:string}) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formElement=event.currentTarget; const form=new FormData(formElement);
    const payload={roleId,firstName:String(form.get("firstName")||""),lastName:String(form.get("lastName")||""),email:String(form.get("email")||""),phone:String(form.get("phone")||""),resumeUrl:String(form.get("resumeUrl")||""),consent:form.get("consent")==="on",website:String(form.get("website")||"")};
    try { const response=await fetch("/api/public/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}); const result=await response.json(); if(!response.ok) throw new Error(result.error||"Application failed."); setMessage("Application submitted. The recruitment team has received your details."); formElement.reset(); }
    catch(error) { setMessage(error instanceof Error?error.message:"Application could not be submitted."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-5 grid gap-3"><input name="firstName" required maxLength={100} placeholder="First name" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/><input name="lastName" required maxLength={100} placeholder="Last name" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/><input name="email" required type="email" placeholder="Email address" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/><input name="phone" type="tel" placeholder="Phone number" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/><label className="grid gap-1 text-xs text-[#52657d]">CV link (optional)<input name="resumeUrl" type="url" placeholder="HTTPS link to your CV" className="rounded-lg border border-[#dce4ed] p-3 text-sm"/></label><label className="flex items-start gap-2 text-xs leading-5 text-[#52657d]"><input name="consent" type="checkbox" required className="mt-1"/>I consent to the recruitment agency processing my information for this application.</label><input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden"/><button disabled={busy} className="rounded-lg bg-[#0b7886] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy?"Submitting…":"Submit application"}</button>{message?<p role="status" className="text-xs leading-5 text-[#52657d]">{message}</p>:null}</form>;
}
