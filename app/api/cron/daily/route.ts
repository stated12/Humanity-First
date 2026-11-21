import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendCampaignBatch } from "@/lib/newsletter";
import { notify } from "@/lib/notify";
export const dynamic = "force-dynamic"; export const maxDuration = 60;
/** Daily job (Vercel Cron). Protected by CRON_SECRET: Vercel sends it as a Bearer token. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET; if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  const now = new Date().toISOString(); const out: Record<string, any> = {};
  const a = await db().from("articles").update({ status: "published", published_at: now }).eq("status", "scheduled").lte("publish_at", now).select("id"); out.articles = (a.data || []).length;
  const { data: camps } = await db().from("newsletter_campaigns").select("id").or(`status.eq.sending,and(status.eq.scheduled,scheduled_at.lte.${now})`).limit(3); out.campaigns = 0;
  for (const c of camps || []) { const r = await sendCampaignBatch(c.id, 80); if (r.ok) out.campaigns++; }
  const w = await db().from("webinars").update({ status: "completed" }).eq("status", "scheduled").lt("starts_at", new Date(Date.now() - 864e5).toISOString()).select("id"); out.webinars_completed = (w.data || []).length;
  if (out.webinars_completed) await notify("webinar_completed", `${out.webinars_completed} webinar(s) marked completed`, "Add recordings in Admin > Webinars.", "/admin/webinars", "webinars.write");
  return NextResponse.json({ ok: true, ...out });
}
