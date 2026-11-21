import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Track from "@/components/Track";
const get = async (slug: string) => (await db().from("challenge_submissions").select("slug,title,group_name,location,summary,challenge_identified,solution,impact,image_url,link_url,is_featured,recognition").eq("slug", slug).eq("status", "published").maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const p = await get(slug); if (!p) return {}; return pageMeta(`/challenge/${slug}`, { title: p.title, description: p.summary, image: p.image_url }); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = await get(slug); if (!p) notFound();
  const S = ({ h, t }: { h: string; t?: string }) => t ? <section><h2 className="text-2xl">{h}</h2><p className="mt-2 whitespace-pre-line">{t}</p></section> : null;
  return (<><Track path={`/challenge/${slug}`} /><PageHead kicker="Challenge project" title={p.title} intro={[p.group_name, p.location].filter(Boolean).join(" · ")}><div className="mb-4"><Breadcrumbs items={[{ name: "Challenge", href: "/challenge" }, { name: "Showcase", href: "/challenge/showcase" }, { name: p.title }]} /></div>{(p.is_featured || p.recognition) && <span className="badge">{p.recognition || "Featured project"}</span>}</PageHead>
    <div className="wrap max-w-3xl space-y-6 py-10">{p.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image_url} alt="" className="w-full" />}<p className="text-lg">{p.summary}</p><S h="The shared challenge" t={p.challenge_identified} /><S h="The collaborative solution" t={p.solution} /><S h="Impact" t={p.impact} />{p.link_url && /^https?:\/\//.test(p.link_url) && <p><a href={p.link_url} target="_blank" rel="noopener noreferrer nofollow" className="underline">More information</a></p>}</div></>);
}
