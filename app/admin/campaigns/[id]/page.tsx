import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";
import { sendCampaignBatch } from "@/lib/newsletter";
import { smtpConfigured } from "@/lib/env";
import RichEditor from "@/components/RichEditor";
export const dynamic = "force-dynamic";
async function save(fd: FormData) {
  "use server"; const a = await requirePerm("newsletter.write"); const id = String(fd.get("id")); const subject = String(fd.get("subject") || "").trim().slice(0, 200); if (!subject) redirect(`/admin/campaigns/${id}?e=Subject%20required`);
  const sched = String(fd.get("scheduled_at") || ""); const row: any = { subject, preheader: String(fd.get("preheader") || "").slice(0, 200) || null, body_html: sanitizeHtml(String(fd.get("body_html") || "")), scheduled_at: sched ? new Date(sched).toISOString() : null };
  if (fd.get("do") === "schedule" && sched) row.status = "scheduled";
  let cid = id; if (id === "new") { const r = await db().from("newsletter_campaigns").insert(row).select("id").single(); cid = r.data?.id; } else { const { data: c } = await db().from("newsletter_campaigns").select("status").eq("id", id).maybeSingle(); if (c && ["sending", "sent"].includes(c.status)) redirect(`/admin/campaigns/${id}?e=Already%20sent`); await db().from("newsletter_campaigns").update(row).eq("id", id); }
  await audit(a, "save", "newsletter_campaigns", cid); redirect(`/admin/campaigns/${cid}?ok=1`);
}
async function sendNow(fd: FormData) { "use server"; const a = await requirePerm("newsletter.write"); const id = String(fd.get("id")); const r = await sendCampaignBatch(id, 40); await audit(a, "send_batch", "newsletter_campaigns", id); redirect(`/admin/campaigns/${id}?${r.ok ? "ok=" + (r.done ? "done" : "more") : "e=" + encodeURIComponent(r.error || "Failed")}`); }
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; e?: string }> }) {
  await requirePerm("newsletter.write"); const { id } = await params; const sp = await searchParams; let c: any = {}; if (id !== "new") { const { data } = await db().from("newsletter_campaigns").select("*").eq("id", id).maybeSingle(); if (!data) notFound(); c = data; }
  const locked = ["sending", "sent"].includes(c.status);
  return (<div className="max-w-3xl"><Link href="/admin/campaigns" className="text-sm underline">← Campaigns</Link><h1 className="mt-2 text-3xl">{id === "new" ? "New campaign" : "Campaign"}</h1>{sp.e && <p className="mt-3 bg-red-50 p-3 text-red-800">{sp.e}</p>}{sp.ok && <p className="mt-3 bg-green-50 p-3 text-green-800">{sp.ok === "more" ? "A batch was sent. Press Send again (or wait for the daily job) to continue." : sp.ok === "done" ? "All recipients processed." : "Saved."}</p>}
    {!smtpConfigured() && <p className="mt-3 bg-yellow-50 p-3 text-sm">Email (SMTP) is not configured in Vercel, so sending is disabled. You can still write and save campaigns.</p>}
    <form action={save} className="card mt-4 space-y-3 p-5"><input type="hidden" name="id" value={id} /><div><label className="label" htmlFor="s">Subject *</label><input id="s" name="subject" defaultValue={c.subject || ""} required className="input" /></div><div><label className="label" htmlFor="p">Preheader</label><input id="p" name="preheader" defaultValue={c.preheader || ""} className="input" /></div><div><label className="label">Message</label><RichEditor name="body_html" defaultValue={c.body_html || ""} draftKey={"campaign-" + id} /></div>
      <div><label className="label" htmlFor="sa">Schedule for (optional)</label><input id="sa" type="datetime-local" name="scheduled_at" defaultValue={c.scheduled_at ? new Date(c.scheduled_at).toISOString().slice(0, 16) : ""} className="input max-w-xs" /></div>
      {!locked && <div className="flex gap-3"><button name="do" value="save" className="btn btn-dark">Save draft</button><button name="do" value="schedule" className="btn btn-line">Save and schedule</button></div>}</form>
    {id !== "new" && !locked && <form action={sendNow} className="mt-4"><input type="hidden" name="id" value={id} /><button className="btn btn-gold" disabled={!smtpConfigured()}>Send now to active subscribers</button><p className="mt-1 text-xs text-muted">Sends in batches of 40. Only subscribers who confirmed consent receive it; every email includes an unsubscribe link.</p></form>}
    {c.status === "sending" && <form action={sendNow} className="mt-4"><input type="hidden" name="id" value={id} /><button className="btn btn-gold">Send next batch ({c.sent_count}/{c.recipients_total})</button></form>}</div>);
}
