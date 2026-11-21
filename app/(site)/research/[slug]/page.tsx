import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
const get = async (slug: string) => (await db().from("research_items").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const r = await get(slug); if (!r) return {}; return pageMeta(`/research/${slug}`, { title: r.seo_title || r.title, description: r.seo_description || r.summary, image: r.image_url }); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const r = await get(slug); if (!r) notFound();
  return (<><Track path={`/research/${slug}`} /><PageHead kicker={r.kind.replace(/_/g, " ")} title={r.title} intro={[r.author_name, r.organisation].filter(Boolean).join(", ")}><div className="mb-4"><Breadcrumbs items={[{ name: "Research", href: "/research" }, { name: r.title }]} /></div>{r.is_sample && <Sample />}</PageHead>
    <div className="wrap max-w-3xl py-10">{r.summary && <p className="text-xl text-muted">{r.summary}</p>}<div className="article-body mt-6" dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.body || "") }} />{r.file_url && <p className="mt-6"><a href={r.file_url} className="btn btn-dark" target="_blank" rel="noopener noreferrer">Download</a></p>}{r.external_url && /^https?:\/\//.test(r.external_url) && <p className="mt-3"><a href={r.external_url} className="underline" target="_blank" rel="noopener noreferrer">Read at the source</a></p>}</div></>);
}
