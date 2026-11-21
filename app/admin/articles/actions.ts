"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requireAny, audit } from "@/lib/auth";
import { sanitizeHtml, readingTime } from "@/lib/sanitize";
import { slugify } from "@/lib/format";
import { uploadImage } from "@/lib/upload";

const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
export async function saveArticle(fd: FormData) {
  const a = await requireAny(["articles.write", "articles.review", "articles.publish"]); const id = s(fd, "id") || "new"; const back = `/admin/articles/${id}`;
  if (!can(a, "articles.write") && !can(a, "articles.review")) redirect("/admin?denied=articles.write");
  const title = s(fd, "title"); if (!title) redirect(`${back}?e=${encodeURIComponent("Title is required")}`);
  const body = sanitizeHtml(s(fd, "body")); let status = s(fd, "status") || "draft"; let note = "";
  if (!["draft", "review", "scheduled", "published", "archived"].includes(status)) status = "draft";
  if (["published", "scheduled", "archived"].includes(status) && !can(a, "articles.publish")) { status = "review"; note = "You do not have permission to publish, so the article was sent for review instead."; }
  const publish_at = s(fd, "publish_at") ? new Date(s(fd, "publish_at")).toISOString() : null;
  if (status === "scheduled" && !publish_at) redirect(`${back}?e=${encodeURIComponent("Choose a publish date and time to schedule")}`);
  let prev: any = null; if (id !== "new") { prev = (await db().from("articles").select("status,published_at,slug").eq("id", id).maybeSingle()).data; if (!prev) redirect("/admin/articles"); }
  const img = await uploadImage(fd.get("featured_image__file"), "articles");
  const row: any = { title, slug: slugify(s(fd, "slug") || title) || "article-" + Date.now().toString(36), excerpt: s(fd, "excerpt") || null, body, status, category_id: s(fd, "category_id") || null, topic_id: s(fd, "topic_id") || null, author_id: s(fd, "author_id") || null,
    featured_image: img || s(fd, "featured_image") || null, image_alt: s(fd, "image_alt") || null, image_credit: s(fd, "image_credit") || null, related_ids: fd.getAll("related_ids").map(String).filter((x) => /^[0-9a-f-]{36}$/i.test(x)),
    publish_at: status === "scheduled" ? publish_at : null, is_featured: fd.get("is_featured") === "on", is_visible: fd.get("is_visible") === "on", reading_time: readingTime(body), seo_title: s(fd, "seo_title") || null, seo_description: s(fd, "seo_description") || null, is_sample: false };
  if (status === "published" && !(prev?.published_at)) row.published_at = new Date().toISOString();
  const q = id === "new" ? db().from("articles").insert(row).select("id").single() : db().from("articles").update(row).eq("id", id).select("id").single(); const { data, error } = await q;
  if (error) redirect(`${back}?e=${encodeURIComponent(error.message.includes("duplicate") ? "That URL slug is already used by another article." : error.message.slice(0, 160))}`);
  const aid = data.id as string;
  // tags
  const names = s(fd, "tags").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 12);
  await db().from("article_tag_relations").delete().eq("article_id", aid);
  for (const n of names) { const slug = slugify(n); if (!slug) continue; let { data: t } = await db().from("tags").select("id").eq("slug", slug).maybeSingle(); if (!t) t = (await db().from("tags").insert({ slug, name: n }).select("id").single()).data; if (t) await db().from("article_tag_relations").upsert({ article_id: aid, tag_id: t.id }); }
  if (!prev || prev.status !== status || s(fd, "comment")) await db().from("editorial_reviews").insert({ article_id: aid, reviewer_id: a.id, reviewer_email: a.email, decision: status === "published" ? "published" : status === "review" ? (s(fd, "comment") ? "changes_requested" : "submitted") : status === "draft" && prev ? "returned" : "approved", comment: s(fd, "comment") || null });
  await audit(a, id === "new" ? "create" : "update", "articles", aid, { status }); revalidatePath("/", "layout");
  redirect(`/admin/articles/${aid}?ok=1${note ? "&n=" + encodeURIComponent(note) : ""}`);
}
export async function deleteArticle(fd: FormData) {
  const a = await requireAny(["articles.publish"]); const id = s(fd, "id"); await db().from("articles").delete().eq("id", id); await audit(a, "delete", "articles", id); revalidatePath("/", "layout"); redirect("/admin/articles?ok=1");
}
