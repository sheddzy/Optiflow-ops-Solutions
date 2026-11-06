import { NextResponse } from "next/server";
import { publicClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Quick production check: open /api/health. It reveals no keys, only whether the site can read the database. */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const db = publicClient();
  if (!db) {
    // Variables were missing when this deploy was BUILT. Add them in Netlify, then redeploy.
    return NextResponse.json({ configured: false, database: "not checked", publishedServices: null }, { status: 503, headers });
  }
  const { count, error } = await db.from("services").select("id", { count: "exact", head: true }).eq("published", true);
  if (error) return NextResponse.json({ configured: true, database: "error", code: error.code ?? "unknown", publishedServices: null }, { status: 503, headers });
  return NextResponse.json({ configured: true, database: "ok", publishedServices: count }, { headers });
}
