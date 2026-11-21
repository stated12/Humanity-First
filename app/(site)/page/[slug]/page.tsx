import { notFound } from "next/navigation";
import { getPage, pageMeta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const p = await getPage(slug); if (!p) return {}; return pageMeta(`/page/${slug}`, { title: p.seo_title || p.title, description: p.seo_description || undefined }); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = await getPage(slug); if (!p) notFound();
  return (<><PageHead title={p.title}><div className="mb-4"><Breadcrumbs items={[{ name: p.title }]} /></div></PageHead><div className="wrap max-w-3xl py-10"><div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.body || "") }} /></div></>);
}
