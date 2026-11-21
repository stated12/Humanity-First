import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  if (!(await allow("track", 120, 600))) return NextResponse.json({ ok: false }, { status: 429 });
  let b: any; try { b = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const p = String(b.p || "/").split("?")[0].slice(0, 200); const a = typeof b.a === "string" && /^[0-9a-f-]{36}$/i.test(b.a) ? b.a : null;
  if (!p.startsWith("/") || p.startsWith("/admin") || p.startsWith("/api")) return NextResponse.json({ ok: true });
  await db().rpc("track_view", { p_article: a, p_path: p }); return NextResponse.json({ ok: true });
}
