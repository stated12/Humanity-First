import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SupportCta from "@/components/SupportCta";
import Track from "@/components/Track";
const get = async (slug: string) => (await db().from("resources").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const r = await get(slug); if (!r) return {}; return pageMeta(`/toolkit/${slug}`, { title: r.title, description: r.description }); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const r = await get(slug); if (!r) notFound();
  return (<><Track path={`/toolkit/${slug}`} /><PageHead kicker={r.kind} title={r.title} intro={r.description}><div className="mb-4"><Breadcrumbs items={[{ name: "Toolkit", href: "/toolkit" }, { name: r.title }]} /></div>{(r.file_url || r.external_url) && <Link href={`/toolkit/download/${r.id}`} className="btn btn-dark">{r.file_url ? "Download" : "Open resource"}</Link>}</PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_320px]"><div>{r.body ? <div className="article-body max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(r.body) }} /> : <p className="text-muted">Download the resource above.</p>}{r.audience && <p className="mt-6 text-sm text-muted">For: {r.audience}</p>}<p className="mt-2 text-xs text-muted">{r.downloads} downloads</p></div><SupportCta /></div></>);
}
