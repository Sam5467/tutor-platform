import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Called once a day by Vercel (see vercel.json). The free Supabase plan
// pauses a project after a week without activity; this small read keeps it
// awake.
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await supabase
    .from("site_settings")
    .select("students_open")
    .limit(1);

  return NextResponse.json(
    { ok: !error },
    { status: error ? 500 : 200, headers: { "Cache-Control": "no-store" } }
  );
}
