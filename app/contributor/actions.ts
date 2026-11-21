"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/supabase-server";
import { sanitizeHtml, readingTime, stripHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/format";
import { notify } from "@/lib/notify";
import { uploadImage } from "@/lib/upload";
import { allow } from "@/lib/ratelimit";
import { isContributor } from "@/lib/contributor";

export async function submitArticle(fd: FormData) {
  const u = await currentUser(); if (!u) redirect("/login?next=/contributor"); const c = await isContributor(u.id, u.email); if (!c) redirect("/contributor");
  if (!(await allow("submit-article", 10, 3600))) redirect("/contributor?e=rate");
  const title = String(fd.get("title") || "").trim().slice(0, 200), body = sanitizeHtml(String(fd.get("body") || "")); const draft = fd.get("intent") === "draft";
  if (!title || (!draft && stripHtml(body).length < 300)) redirect("/contributor?e=short");
  const img = (await uploadImage(fd.get("image"), "submissions")) || null; const id = String(fd.get("id") || "");
  const row: any = { title, excerpt: String(fd.get("excerpt") || "").trim().slice(0, 400) || null, body, reading_time: readingTime(body), status: draft ? "draft" : "review", writer_user_id: u.id, author_id: c.author_id || null, is_visible: true };
  if (img) row.featured_image = img; if (img || fd.get("image_alt")) row.image_alt = String(fd.get("image_alt") || "").trim().slice(0, 200) || null;
  if (id) { const { data: own } = await db().from("articles").select("id,status").eq("id", id).eq("writer_user_id", u.id).maybeSingle(); if (!own || !["draft", "review"].includes(own.status)) redirect("/contributor?e=locked"); await db().from("articles").update(row).eq("id", id); }
  else { row.slug = slugify(title) + "-" + Math.random().toString(36).slice(2, 6); const r = await db().from("articles").insert(row).select("id").single(); if (r.error) redirect("/contributor?e=save"); if (!draft) await db().from("editorial_reviews").insert({ article_id: r.data.id, reviewer_id: u.id, reviewer_email: u.email, decision: "submitted", comment: "Submitted by contributor" }); }
  if (!draft) await notify("article_submitted", `Article submitted: ${title}`, u.email, "/admin/articles?status=review", "articles.review");
  redirect("/contributor?ok=" + (draft ? "draft" : "1"));
}
