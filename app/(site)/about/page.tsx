import { getPage, pageMeta } from "@/lib/content";
import { notFound } from "next/navigation";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import SupportCta from "@/components/SupportCta";
import { sanitizeHtml } from "@/lib/sanitize";
import Track from "@/components/Track";
export async function generateMetadata() { const p = await getPage("about"); return pageMeta("/about", { title: p?.seo_title || "About the Initiative", description: p?.seo_description || "About The Humanity & Cooperation Initiative, an ORIVANA initiative in collaboration with Randall S. Pitts and The Humanity Movement." }); }
export default async function Page() {
  const p = await getPage("about"); if (!p) notFound();
  return (<><Track path="/about" /><PageHead kicker="About" title={p.title}><div className="mb-4"><Breadcrumbs items={[{ name: "About" }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_320px]"><div className="article-body max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.body || "") }} /><div className="space-y-6">
      <div className="card flex items-center justify-center gap-4 p-5">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/orivana-logo.png" alt="ORIVANA" className="h-20 w-20" />{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/humanity-movement-logo.png" alt="The Humanity Movement" className="h-16 w-auto" /></div><SupportCta /></div></div></>);
}
