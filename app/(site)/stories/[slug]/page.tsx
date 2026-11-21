import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta, nowIso } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import { dateFmt } from "@/lib/format";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SupportCta from "@/components/SupportCta";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
const get = async (slug: string) => (await db().from("stories").select("*").eq("slug", slug).eq("status", "published").lte("published_at", nowIso()).maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const s = await get(slug); if (!s) return {}; return pageMeta(`/stories/${slug}`, { title: s.seo_title || s.title, description: s.seo_description || s.excerpt, image: s.featured_image, type: "article" }); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await get(slug); if (!s) notFound();
  return (<><Track path={`/stories/${slug}`} /><div className="wrap max-w-3xl py-10"><Breadcrumbs items={[{ name: "Humanity in Practice", href: "/stories" }, { name: s.title }]} />{s.is_sample && <div className="mt-4"><Sample label="Illustrative story: an example, not a report of real events" /></div>}<h1 className="mt-4 text-4xl md:text-5xl">{s.title}</h1><p className="mt-3 text-sm text-muted">{[s.author_name, s.location, s.published_at && dateFmt(s.published_at)].filter(Boolean).join(" · ")}</p>
    {s.featured_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={s.featured_image} alt={s.image_alt || ""} className="mt-6 w-full" />}<div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: sanitizeHtml(s.body || "") }} /><div className="mt-10"><SupportCta /></div></div></>);
}
