import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ART_SELECT, pageMeta, publishedArticles, nowIso } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import { dateFmt } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import { getSettings } from "@/lib/settings";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import SupportCta from "@/components/SupportCta";
import NewsletterForm from "@/components/NewsletterForm";
import Track from "@/components/Track";
import JsonLd from "@/components/JsonLd";
async function get(slug: string) {
  const { data } = await db().from("articles").select("*," + "hc_authors(name,slug,bio,designation,organisation),hc_categories(name,slug),hc_topics(name,slug)").eq("slug", slug).eq("status", "published").eq("is_visible", true).lte("published_at", nowIso()).maybeSingle(); return data as any;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const a = await get(slug); if (!a) return {}; return pageMeta(`/articles/${slug}`, { title: a.seo_title || a.title, description: a.seo_description || a.excerpt, image: a.featured_image, type: "article" }); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ nl?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const a = await get(slug); if (!a) notFound(); const s = await getSettings();
  const [{ data: rel }, { data: tg }] = await Promise.all([a.related_ids?.length ? db().from("articles").select(ART_SELECT).in("id", a.related_ids).eq("status", "published") : { data: [] }, db().from("article_tag_relations").select("hc_tags(name,slug)").eq("article_id", a.id)]);
  let related: any[] = rel || []; if (!related.length) related = (await publishedArticles({ category_id: a.category_id, limit: 4 })).rows.filter((x) => x.id !== a.id).slice(0, 3);
  const tags = (tg || []).map((x: any) => x.hc_tags).filter(Boolean); const url = `${SITE_URL}/articles/${slug}`;
  const ld = { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt, datePublished: a.published_at, dateModified: a.updated_at, mainEntityOfPage: url, image: a.featured_image ? [a.featured_image] : [`${SITE_URL}/brand/og.jpg`], author: { "@type": "Person", name: a.hc_authors?.name || "ORIVANA Editorial Team" }, publisher: { "@type": "Organization", name: "The Humanity & Cooperation Initiative", logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/orivana-logo.png` } }, isAccessibleForFree: true };
  return (<><Track articleId={a.id} path={`/articles/${slug}`} /><JsonLd data={ld} />
    <article className="wrap max-w-3xl py-8 md:py-12"><Breadcrumbs items={[{ name: "Articles", href: "/articles" }, ...(a.hc_categories ? [{ name: a.hc_categories.name, href: `/articles?category=${a.hc_categories.slug}` }] : []), { name: a.title }]} />
      {a.hc_categories && <p className="kicker mt-6">{a.hc_categories.name}</p>}<h1 className="mt-2 text-4xl md:text-5xl">{a.title}</h1>{a.excerpt && <p className="mt-4 text-xl text-muted">{a.excerpt}</p>}
      <p className="mt-4 text-sm text-muted">By {a.hc_authors?.name || "ORIVANA Editorial Team"}{a.published_at ? " · " + dateFmt(a.published_at) : ""}{a.reading_time ? ` · ${a.reading_time} min read` : ""}</p>
      {a.featured_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.featured_image} alt={a.image_alt || ""} className="mt-6 w-full" />}
      <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.body || "") }} />
      {tags.length > 0 && <p className="mt-8 flex flex-wrap gap-2 text-sm">{tags.map((t: any) => <Link key={t.slug} href={`/articles?tag=${t.slug}`} className="border border-line px-2 py-0.5 hover:border-gold">{t.name}</Link>)}</p>}
      {a.hc_topics && <p className="mt-6 text-sm">Continue learning: <Link href={`/academy/${a.hc_topics.slug}`} className="font-semibold underline">Cooperation Academy · {a.hc_topics.name}</Link></p>}
      <div className="mt-8"><SupportCta where="show_on_articles" /></div>
      {a.hc_authors?.bio && <div className="mt-8 border-t border-line pt-6"><p className="kicker">About the author</p><p className="mt-1 font-serif text-lg text-navy">{a.hc_authors.name}</p><p className="text-sm text-muted">{a.hc_authors.bio}</p></div>}
    </article>
    {related.length > 0 && <section className="bg-soft"><div className="wrap py-10"><h2 className="text-2xl">Related articles</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <ArticleCard key={r.id} a={r} />)}</div></div></section>}
    <section className="wrap max-w-3xl py-10"><h2 className="text-2xl">Get new articles by email</h2><div className="mt-3"><NewsletterForm ret={`/articles/${slug}`} status={sp.nl} /></div><p className="mt-4 text-xs text-muted">{s.sponsor_note}</p></section></>);
}
