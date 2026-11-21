import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/env";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();
  const [a, t, c, w, r, s, p, ch, pg] = await Promise.all([
    db().from("articles").select("slug,updated_at").eq("status", "published").eq("is_visible", true).lte("published_at", now), db().from("topics").select("slug").eq("is_published", true), db().from("categories").select("slug").eq("is_active", true),
    db().from("webinars").select("slug,updated_at").eq("is_published", true), db().from("resources").select("slug,updated_at").eq("is_published", true), db().from("stories").select("slug,updated_at").eq("status", "published"),
    db().from("programmes").select("slug").eq("is_published", true), db().from("challenge_submissions").select("slug,updated_at").eq("status", "published"), db().from("pages").select("slug,updated_at").eq("is_published", true)]);
  const u = (path: string, d?: string, pr = 0.6): MetadataRoute.Sitemap[number] => ({ url: SITE_URL + path, lastModified: d ? new Date(d) : new Date(), priority: pr });
  const fixed = ["", "/about", "/academy", "/articles", "/webinars", "/webinars/recordings", "/toolkit", "/programmes", "/circles", "/stories", "/challenge", "/challenge/showcase", "/research", "/support", "/contribute", "/contact", "/newsletter"].map((x) => u(x, undefined, x === "" ? 1 : 0.8));
  return [...fixed, ...(t.data || []).map((x: any) => u("/academy/" + x.slug, undefined, 0.8)), ...(c.data || []).map((x: any) => u("/articles?category=" + x.slug, undefined, 0.5)), ...(a.data || []).map((x: any) => u("/articles/" + x.slug, x.updated_at, 0.7)),
    ...(w.data || []).map((x: any) => u("/webinars/" + x.slug, x.updated_at)), ...(r.data || []).map((x: any) => u("/toolkit/" + x.slug, x.updated_at)), ...(s.data || []).map((x: any) => u("/stories/" + x.slug, x.updated_at)),
    ...(p.data || []).map((x: any) => u("/programmes/" + x.slug)), ...(ch.data || []).filter((x: any) => x.slug).map((x: any) => u("/challenge/" + x.slug, x.updated_at)), ...(pg.data || []).map((x: any) => u(x.slug === "about" ? "/about" : "/page/" + x.slug, x.updated_at, 0.3))];
}
