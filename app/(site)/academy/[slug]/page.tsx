import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta, publishedArticles, isUpcoming, whenText, getTopics } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import SupportCta from "@/components/SupportCta";
import Track from "@/components/Track";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/env";
const get = async (slug: string) => (await db().from("topics").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const t = await get(slug); if (!t) return {}; return pageMeta(`/academy/${slug}`, { title: t.seo_title || `${t.name} | Cooperation Academy`, description: t.seo_description || t.summary }); }
const Block = ({ id, title, html }: { id: string; title: string; html?: string }) => html ? <section id={id} className="scroll-mt-24"><h2 className="text-2xl md:text-3xl">{title}</h2><div className="article-body mt-3 max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} /></section> : null;
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const t = await get(slug); if (!t) notFound();
  const [arts, webs, res, all] = await Promise.all([publishedArticles({ topic_id: t.id, limit: 12 }), db().from("webinars").select("*").eq("is_published", true).eq("topic_id", t.id).order("starts_at", { ascending: false, nullsFirst: true }), db().from("resources").select("slug,title,description,kind").eq("is_published", true).eq("topic_id", t.id), getTopics()]);
  const ld = { "@context": "https://schema.org", "@type": "Course", name: t.name, description: t.summary, provider: { "@type": "Organization", name: "The Humanity & Cooperation Initiative", url: SITE_URL }, isAccessibleForFree: true };
  return (<><Track path={`/academy/${slug}`} /><JsonLd data={ld} /><PageHead kicker="Cooperation Academy" title={t.name} intro={t.summary}><div className="mb-4"><Breadcrumbs items={[{ name: "Cooperation Academy", href: "/academy" }, { name: t.name }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_300px]"><div className="space-y-10">
      <Block id="intro" title="Introduction" html={t.introduction} /><Block id="why" title="Why this subject matters" html={t.why_it_matters} /><Block id="objectives" title="Learning objectives" html={t.objectives} />
      <section id="articles"><h2 className="text-2xl md:text-3xl">Related articles</h2>{arts.rows.length ? <div className="mt-4 grid gap-5 sm:grid-cols-2">{arts.rows.map((a) => <ArticleCard key={a.id} a={a} />)}</div> : <p className="mt-3 text-muted">Articles for this topic will appear here.</p>}</section>
      <section id="webinars"><h2 className="text-2xl md:text-3xl">Related webinars</h2>{(webs.data || []).length ? <ul className="mt-4 space-y-3">{(webs.data || []).map((w: any) => <li key={w.id} className="card p-4"><Link href={`/webinars/${w.slug}`} className="font-serif text-xl text-navy hover:underline">{w.title}</Link><p className="text-sm text-muted">{isUpcoming(w) ? whenText(w) : w.recording_url ? "Recording available" : "Date to be announced"}</p></li>)}</ul> : <p className="mt-3 text-muted">No webinars are linked to this topic yet. <Link className="underline" href="/webinars">See all webinars</Link>.</p>}</section>
      <Block id="tools" title="Practical tools" html={t.practical_tools} />{(res.data || []).length > 0 && <ul className="space-y-2">{(res.data || []).map((r: any) => <li key={r.slug}><Link href={`/toolkit/${r.slug}`} className="underline">{r.title}</Link> <span className="text-sm text-muted">({r.kind})</span></li>)}</ul>}
      <Block id="exercises" title="Exercises" html={t.exercises} /><Block id="reflect" title="Reflection questions" html={t.reflection_questions} /><Block id="further" title="Further learning" html={t.further_learning} /></div>
      <aside className="space-y-6 lg:sticky lg:top-40 lg:self-start"><nav aria-label="On this page" className="card p-4 text-sm"><p className="kicker">On this page</p><ul className="mt-2 space-y-1">{[["intro", "Introduction"], ["why", "Why it matters"], ["objectives", "Objectives"], ["articles", "Articles"], ["webinars", "Webinars"], ["tools", "Tools"], ["exercises", "Exercises"], ["reflect", "Reflection"], ["further", "Further learning"]].map(([h, l]) => <li key={h}><a href={`#${h}`} className="underline-offset-2 hover:underline">{l}</a></li>)}</ul></nav>
        <nav aria-label="Other topics" className="card p-4 text-sm"><p className="kicker">Other topics</p><ul className="mt-2 space-y-1">{all.filter((x) => x.slug !== slug).map((x) => <li key={x.id}><Link href={`/academy/${x.slug}`} className="hover:underline">{x.name}</Link></li>)}</ul></nav><SupportCta /></aside></div></>);
}
