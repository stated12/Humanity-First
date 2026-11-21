import { db } from "./db";
import { sendMail, wrapMail, unsubLink } from "./mail";
import { sanitizeHtml } from "./sanitize";
import { smtpConfigured } from "./env";
/** Sends one batch of a campaign to active subscribers using a created_at cursor so it can resume. Returns remaining flag. */
export async function sendCampaignBatch(id: string, max = 40): Promise<{ ok: boolean; done: boolean; sent: number; error?: string }> {
  if (!smtpConfigured()) return { ok: false, done: false, sent: 0, error: "Email (SMTP) is not configured in Vercel, so nothing can be sent." };
  const { data: c } = await db().from("newsletter_campaigns").select("*").eq("id", id).maybeSingle(); if (!c) return { ok: false, done: true, sent: 0, error: "Not found" };
  if (c.status === "sent") return { ok: true, done: true, sent: 0 };
  if (c.status !== "sending") { let q = db().from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("status", "active"); const { count } = await q; await db().from("newsletter_campaigns").update({ status: "sending", recipients_total: count || 0, sent_count: 0, failed_count: 0, last_subscriber_created: null }).eq("id", id); c.last_subscriber_created = null; c.sent_count = 0; c.failed_count = 0; }
  let q = db().from("newsletter_subscribers").select("id,email,token,created_at").eq("status", "active").order("created_at").limit(max); if (c.last_subscriber_created) q = q.gt("created_at", c.last_subscriber_created);
  const { data: subs } = await q; let sent = 0, failed = 0, last = c.last_subscriber_created; const body = sanitizeHtml(c.body_html || "");
  for (const sb of subs || []) { const ok = await sendMail(sb.email, c.subject, wrapMail(c.subject, (c.preheader ? `<p style="color:#777">${c.preheader.replace(/</g, "&lt;")}</p>` : "") + body, `· <a href="${unsubLink(sb.token)}">Unsubscribe</a>`)); ok ? sent++ : failed++; last = sb.created_at; }
  const done = (subs || []).length < max;
  await db().from("newsletter_campaigns").update({ sent_count: (c.sent_count || 0) + sent, failed_count: (c.failed_count || 0) + failed, last_subscriber_created: last, ...(done ? { status: "sent", sent_at: new Date().toISOString() } : {}) }).eq("id", id);
  return { ok: true, done, sent };
}
