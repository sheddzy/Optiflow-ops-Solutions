import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publicRecruitmentRpc } from "@/lib/recruitment/public";

export const dynamic = "force-dynamic";

const schema = z.object({
  roleId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).optional().default(""),
  resumeUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.website) {
    return NextResponse.json({ error: "Check the application details and try again." }, { status: 400 });
  }
  try {
    const applicationId = await publicRecruitmentRpc<string>("apply_to_public_vacancy", {
      p_role_id: parsed.data.roleId,
      p_first_name: parsed.data.firstName,
      p_last_name: parsed.data.lastName,
      p_email: parsed.data.email,
      p_phone: parsed.data.phone || null,
      p_resume_url: parsed.data.resumeUrl || null,
      p_consent: true,
      p_source: "public_job_board",
    });
    return NextResponse.json({ success: true, applicationId }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const unavailable = message.includes("vacancy_not_available");
    return NextResponse.json({ error: unavailable ? "This vacancy is no longer accepting applications." : "Application could not be submitted. Please try again." }, { status: unavailable ? 404 : 400 });
  }
}
