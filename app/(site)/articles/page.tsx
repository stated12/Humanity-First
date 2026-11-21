import Link from "next/link";
import { getCategories, publishedArticles, pageMeta, getTopics } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import Track from "@/components/Track";
import { db } from "@/lib/db";
export async function generateMetadata() { return pageMeta("/articles", { title: "Article library", description: "Forty original articles on understanding people, communication, trust, leadership and cooperation. Free to read." }); }
const PER = 18;
export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; topic?: string; tag?: string; q?: string; page?: string }> }) {
  const sp = await searchParams; const [cats, topics] = await Promise.all([getCategories(), getTopics()]); const cat = cats.find((c) => c.slug === sp.category); const top = topics.find((c) => c.slug === sp.topic); const page = Math.max(1, Number(sp.page) || 1);
  let ids: string[] | undefined;
  if (sp.tag) { const { data: tg } = await db().from("tags").select("id").eq("slug", sp.tag).maybeSingle(); if (tg) { const { data: rel } = await db().from("article_tag_relations").select("article_id").eq("tag_id", tg.id); ids = (rel || []).map((r: any) => r.article_id); } else ids = []; }
  const { rows, count } = ids && !ids.length ? { rows: [], count: 0 } : await publishedArticles({ category_id: cat?.id, topic_id: top?.id, ids, q: sp.q, limit: PER, offset: (page - 1) * PER });
  const qs = (o: Record<string, string | undefined>) => { const p = new URLSearchParams(); for (const [k, v] of Object.entries({ category: sp.category, topic: sp.topic, tag: sp.tag, q: sp.q, ...o })) if (v) p.set(k, v); const s = p.toString(); return "/articles" + (s ? "?" + s : ""); };
  return (<><Track path="/articles" /><PageHead kicker="Article library" title={cat ? cat.name : "Articles on understanding and cooperation"} intro={cat?.description || "Original articles, free to read and share. Browse by category or topic, or search."}><div className="mb-4"><Breadcrumbs items={[{ name: "Articles" }]} /></div></PageHead>
    <div className="wrap py-8"><form className="flex flex-wrap gap-2" role="search"><input name="q" defaultValue={sp.q} placeholder="Search articles" aria-label="Search articles" className="input max-w-sm" />{sp.category && <input type="hidden" name="category" value={sp.category} />}<button className="btn btn-dark">Search</button></form>
      <div className="mt-4 flex flex-wrap gap-2 text-sm"><Link href="/articles" className={`border px-3 py-1 ${!sp.category ? "border-navy bg-navy text-white" : "border-line"}`}>All</Link>{cats.map((c) => <Link key={c.id} href={qs({ category: c.slug, page: undefined })} className={`border px-3 py-1 ${sp.category === c.slug ? "border-navy bg-navy text-white" : "border-line hover:border-gold"}`}>{c.name}</Link>)}</div>
      {(top || sp.tag || sp.q) && <p className="mt-3 text-sm text-muted">Filtered{top ? ` by topic “${top.name}”` : ""}{sp.tag ? ` by tag “${sp.tag}”` : ""}{sp.q ? ` by “${sp.q}”` : ""}. <Link href="/articles" className="underline">Clear</Link></p>}
      <p className="mt-4 text-sm text-muted">{count} article{count === 1 ? "" : "s"}</p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map((a) => <ArticleCard key={a.id} a={a} />)}</div>{!rows.length && <p className="mt-6 text-muted">No articles match. Try another category or search.</p>}
      {count > PER && <div className="mt-8 flex gap-4">{page > 1 && <Link className="btn btn-line" href={qs({ page: String(page - 1) })}>← Previous</Link>}{page * PER < count && <Link className="btn btn-line" href={qs({ page: String(page + 1) })}>Next →</Link>}</div>}</div></>);
}
