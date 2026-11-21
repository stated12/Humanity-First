import Link from "next/link";
import { db } from "@/lib/db";
import { pageMeta, getTopics } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/toolkit", { title: "Humanity Toolkit", description: "Free guides, worksheets, exercises and activities for cooperation, dialogue and listening. Searchable and downloadable." }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; topic?: string }> }) {
  const sp = await searchParams; const [{ data: cats }, topics] = await Promise.all([db().from("resource_categories").select("*").order("sort_order"), getTopics()]);
  let q = db().from("resources").select("id,slug,title,description,kind,file_url,external_url,downloads,tags,is_sample,category_id").eq("is_published", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false }).limit(100);
  const c = (cats || []).find((x: any) => x.slug === sp.category); if (c) q = q.eq("category_id", c.id); const t = topics.find((x) => x.slug === sp.topic); if (t) q = q.eq("topic_id", t.id);
  if (sp.q) { const s = sp.q.replace(/[%,()]/g, " ").trim(); if (s) q = q.or(`title.ilike.%${s}%,description.ilike.%${s}%`); }
  const { data } = await q; const rows: any[] = data || [];
  return (<><Track path="/toolkit" /><PageHead kicker="Humanity Toolkit" title="Practical tools for cooperation" intro="Guides, worksheets, exercises and activities. Free to use in classrooms, communities and workplaces."><div className="mb-4"><Breadcrumbs items={[{ name: "Toolkit" }]} /></div></PageHead>
    <div className="wrap py-8"><form className="flex flex-wrap gap-2" role="search"><input name="q" defaultValue={sp.q} placeholder="Search the toolkit" aria-label="Search the toolkit" className="input max-w-sm" /><select name="category" defaultValue={sp.category || ""} aria-label="Category" className="input max-w-xs"><option value="">All categories</option>{(cats || []).map((x: any) => <option key={x.id} value={x.slug}>{x.name}</option>)}</select><select name="topic" defaultValue={sp.topic || ""} aria-label="Topic" className="input max-w-xs"><option value="">All topics</option>{topics.map((x) => <option key={x.id} value={x.slug}>{x.name}</option>)}</select><button className="btn btn-dark">Filter</button></form>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map((r) => <li key={r.id} className="card flex flex-col p-5"><p className="kicker">{r.kind}</p><h2 className="mt-1 text-xl"><Link href={`/toolkit/${r.slug}`} className="hover:underline">{r.title}</Link></h2><p className="mt-2 line-clamp-3 text-sm text-muted">{r.description}</p><div className="mt-auto flex items-center justify-between pt-3 text-sm">{r.is_sample ? <Sample label="Starter" /> : <span />}{(r.file_url || r.external_url) && <Link href={`/toolkit/download/${r.id}`} className="font-semibold underline">Download</Link>}</div></li>)}</ul>{!rows.length && <p className="mt-6 text-muted">Nothing matches. Try a different search.</p>}</div></>);
}
