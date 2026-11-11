"use client";

import { useState } from "react";

export default function CopyVacancyPost({ title, description, responsibilities, requirements, location, employmentType, workplaceType, salary }: {
  title: string; description: string; responsibilities: string; requirements: string;
  location: string; employmentType: string; workplaceType: string; salary: string;
}) {
  const [copied, setCopied] = useState(false);
  const post = [
    title,
    "",
    description,
    responsibilities ? `\nResponsibilities\n${responsibilities}` : "",
    requirements ? `\nRequirements\n${requirements}` : "",
    "",
    location ? `Location: ${location}` : "",
    employmentType ? `Employment type: ${employmentType.replaceAll("_", " ")}` : "",
    workplaceType ? `Work arrangement: ${workplaceType}` : "",
    salary ? `Salary: ${salary}` : "",
  ].filter(Boolean).join("\n");
  async function copy() {
    try {
      await navigator.clipboard.writeText(post);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return <button type="button" onClick={copy} className="rounded-lg border border-[#dce4ed] bg-white px-3 py-2 text-xs font-semibold text-[#1b3a63] hover:bg-[#f5f8fb]">{copied ? "Copied" : "Copy job post"}</button>;
}
