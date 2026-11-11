import { NextRequest, NextResponse } from "next/server";
import { publicRecruitmentRpc } from "@/lib/recruitment/public";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  try {
    const jobs = await publicRecruitmentRpc<unknown[]>("list_public_vacancies", {
      p_search: params.get("q")?.slice(0,100) || null,
      p_location: params.get("location")?.slice(0,100) || null,
      p_workplace_type: params.get("workplace") || null,
      p_employment_type: params.get("employment") || null,
    });
    return NextResponse.json({ jobs }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ error: "Job listings are temporarily unavailable." }, { status: 503 });
  }
}
