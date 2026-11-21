import Link from "next/link";
import { db } from "@/lib/db";
import { publishedArticles, pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
export async function generateMetadata() { return pageMeta("/search", { title: "Search", noindex: true }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams; const q = (sp.q || "").replace(/[%,()]/g, " ").trim().slice(0, 80); let arts: any[] = [], res: any[] = [], webs: any[] = [], tops: any[] = [];
  if (q) { const [a, r, w, t] = await Promise.all([publishedArticles({ q, limit: 10 }), db().from("resources").select("slug,title").eq("is_published", true).ilike("title", `%${q}%`).limit(8), db().from("webinars").select("slug,title").eq("is_published", true).ilike("title", `%${q}%`).limit(8), db().from("topics").select("slug,name").eq("is_published", true).ilike("name", `%${q}%`).limit(8)]); arts = a.rows; res = r.data || []; webs = w.data || []; tops = t.data || []; }
  const L = ({ h, items }: { h: string; items: { href: string; t: string }[] }) => items.length ? <section className="mt-6"><h2 className="text-xl">{h}</h2><ul className="mt-2 list-disc pl-5">{items.map((i) => <li key={i.href}><Link href={i.href} className="underline">{i.t}</Link></li>)}</ul></section> : null;
  return (<><PageHead title="Search"><form role="search" className="flex max-w-xl gap-2"><input name="q" defaultValue={q} aria-label="Search" className="input" autoFocus /><button className="btn btn-dark">Search</button></form></PageHead><div className="wrap py-8">{q && !arts.length && !res.length && !webs.length && !tops.length && <p className="text-muted">No results for “{q}”.</p>}
    <L h="Articles" items={arts.map((a) => ({ href: `/articles/${a.slug}`, t: a.title }))} /><L h="Academy topics" items={tops.map((a) => ({ href: `/academy/${a.slug}`, t: a.name }))} /><L h="Toolkit" items={res.map((a) => ({ href: `/toolkit/${a.slug}`, t: a.title }))} /><L h="Webinars" items={webs.map((a) => ({ href: `/webinars/${a.slug}`, t: a.title }))} /></div></>);
}
