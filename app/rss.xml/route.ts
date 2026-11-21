import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/env";
import { esc } from "@/lib/format";
export const dynamic = "force-dynamic";
export async function GET() {
  const { data } = await db().from("articles").select("slug,title,excerpt,published_at").eq("status", "published").eq("is_visible", true).lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }).limit(40);
  const items = (data || []).map((a: any) => `<item><title>${esc(a.title)}</title><link>${SITE_URL}/articles/${a.slug}</link><guid>${SITE_URL}/articles/${a.slug}</guid><pubDate>${new Date(a.published_at).toUTCString()}</pubDate><description>${esc(a.excerpt || "")}</description></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>The Humanity &amp; Cooperation Initiative</title><link>${SITE_URL}</link><description>Articles on understanding and cooperation</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
