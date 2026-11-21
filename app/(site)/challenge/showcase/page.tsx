import Link from "next/link";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/challenge/showcase", { title: "Challenge showcase", description: "Published projects from the Global Cooperation Challenge." }); }
export default async function Page() {
  const { data } = await db().from("challenge_submissions").select("slug,title,group_name,location,summary,image_url,is_featured,recognition").eq("status", "published").order("is_featured", { ascending: false }).order("created_at", { ascending: false });
  return (<><Track path="/challenge/showcase" /><PageHead kicker="Global Cooperation Challenge" title="Showcase" intro="Projects that have been reviewed and approved for publication."><div className="mb-4"><Breadcrumbs items={[{ name: "Challenge", href: "/challenge" }, { name: "Showcase" }]} /></div></PageHead>
    <div className="wrap py-10">{(data || []).length ? <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{(data || []).map((p: any) => <li key={p.slug} className="card p-5">{p.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.image_url} alt="" className="mb-3 aspect-[16/9] w-full object-cover" loading="lazy" />}{(p.is_featured || p.recognition) && <span className="badge">{p.recognition || "Featured project"}</span>}<h2 className="mt-2 text-xl"><Link href={`/challenge/${p.slug}`} className="hover:underline">{p.title}</Link></h2><p className="text-sm text-muted">{[p.group_name, p.location].filter(Boolean).join(" · ")}</p><p className="mt-2 line-clamp-3 text-sm">{p.summary}</p></li>)}</ul> : <p className="text-muted">No projects have been published yet. <Link href="/challenge/submit" className="underline">Submit yours</Link>.</p>}</div></>);
}
