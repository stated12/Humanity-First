import type { Metadata } from "next";
import { cache } from "react";
import { db } from "./db";
import { SITE_URL } from "./env";
import { getSettings } from "./settings";

export const ART_SELECT = "id,slug,title,excerpt,featured_image,image_alt,published_at,reading_time,is_featured,category_id,topic_id,hc_authors(name,slug),hc_categories(name,slug)";
export const nowIso = () => new Date().toISOString();

/** Per-page SEO: database overrides (Admin > SEO) win over the defaults passed in. */
export async function pageMeta(path: string, d: { title: string; description?: string; image?: string | null; type?: "website" | "article"; noindex?: boolean }): Promise<Metadata> {
  const [s, { data: o }] = await Promise.all([getSettings(), db().from("seo_entries").select("*").eq("path", path).maybeSingle()]);
  const title = (o?.title || d.title || s.seo_default_title || "").toString(); const description = (o?.description || d.description || s.seo_default_description || "").toString();
  const img = o?.og_image || d.image || "/brand/og.jpg"; const url = SITE_URL + path;
  return { title, description, alternates: { canonical: url }, robots: o?.noindex || d.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url, type: d.type || "website", siteName: "The Humanity & Cooperation Initiative", images: [{ url: img.startsWith("http") ? img : SITE_URL + img }] },
    twitter: { card: "summary_large_image", title, description, images: [img.startsWith("http") ? img : SITE_URL + img] } };
}
export const getNav = cache(async (loc: "header" | "footer") => { const { data } = await db().from("navigation_items").select("*").eq("location", loc).eq("is_visible", true).order("sort_order"); return (data || []) as any[]; });
export const getTopics = cache(async () => { const { data } = await db().from("topics").select("id,slug,name,summary,sort_order").eq("is_published", true).order("sort_order"); return (data || []) as any[]; });
export const getCategories = cache(async () => { const { data } = await db().from("categories").select("id,slug,name,description,sort_order").eq("is_active", true).order("sort_order"); return (data || []) as any[]; });
export async function getPage(slug: string) { const { data } = await db().from("pages").select("*").eq("slug", slug).eq("is_published", true).maybeSingle(); return data as any; }
export async function getSponsors(where: "show_publicly" | "show_on_articles" | "show_on_webinars") { const { data } = await db().from("sponsors").select("*").eq("is_active", true).eq(where, true).order("sort_order"); return (data || []) as any[]; }
export async function publishedArticles(opts: { limit?: number; category_id?: string; topic_id?: string; ids?: string[]; featured?: boolean; q?: string; offset?: number } = {}) {
  let q = db().from("articles").select(ART_SELECT, { count: "exact" }).eq("status", "published").eq("is_visible", true).lte("published_at", nowIso());
  if (opts.category_id) q = q.eq("category_id", opts.category_id); if (opts.topic_id) q = q.eq("topic_id", opts.topic_id); if (opts.ids) q = q.in("id", opts.ids); if (opts.featured) q = q.eq("is_featured", true);
  if (opts.q) { const t = opts.q.replace(/[%,()]/g, " ").trim(); if (t) q = q.or(`title.ilike.%${t}%,excerpt.ilike.%${t}%`); }
  q = q.order("published_at", { ascending: false }); const off = opts.offset || 0; q = q.range(off, off + (opts.limit || 24) - 1);
  const { data, count } = await q; return { rows: (data || []) as any[], count: count || 0 };
}
export const publicWebinars = async () => { const { data } = await db().from("webinars").select("*").eq("is_published", true).order("starts_at", { ascending: true, nullsFirst: false }); return (data || []) as any[]; };
export const isUpcoming = (w: any) => w.status === "scheduled" && (!w.starts_at || new Date(w.starts_at) > new Date());
export const hasRecording = (w: any) => !!w.recording_url;
export function whenText(w: any) { return w.starts_at ? new Date(w.starts_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: w.timezone || "UTC" }) + " (" + (w.timezone || "UTC") + ")" : "Date to be announced"; }
/** Embeds only YouTube / Vimeo links as an iframe (privacy-enhanced domain for YouTube). Returns null otherwise. */
export function embedUrl(u?: string | null): string | null {
  if (!u) return null; try { const x = new URL(u); const h = x.hostname.replace(/^www\./, "");
    if (h === "youtu.be") return `https://www.youtube-nocookie.com/embed/${x.pathname.slice(1)}`;
    if (h === "youtube.com" || h === "m.youtube.com") { const id = x.pathname.startsWith("/embed/") || x.pathname.startsWith("/live/") ? x.pathname.split("/")[2] : x.searchParams.get("v"); return id && /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null; }
    if (h === "vimeo.com") { const id = x.pathname.split("/").filter(Boolean)[0]; return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null; }
  } catch { /* ignore */ } return null;
}
export const idOf = (s: string) => /^[0-9a-f-]{36}$/i.test(s);
