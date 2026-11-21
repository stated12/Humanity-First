import Link from "next/link";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/research", { title: "Research, dialogue & knowledge", description: "Interviews, conversations, reports and perspectives on cooperation." }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const sp = await searchParams; let q = db().from("research_items").select("slug,title,kind,summary,author_name,organisation").eq("is_published", true).order("published_at", { ascending: false }); if (sp.kind) q = q.eq("kind", sp.kind); const { data } = await q;
  const kinds = ["interview", "conversation", "research", "report", "knowledge_paper", "perspective", "expert_contribution", "university_collaboration"];
  return (<><Track path="/research" /><PageHead kicker="Research, dialogue & knowledge" title="Ideas, conversations and evidence" intro="Interviews, reports, expert contributions and university collaborations. Items are published only when they are real and credited."><div className="mb-4"><Breadcrumbs items={[{ name: "Research & dialogue" }]} /></div></PageHead>
    <div className="wrap py-10"><div className="flex flex-wrap gap-2 text-sm"><Link href="/research" className={`border px-3 py-1 ${!sp.kind ? "border-navy bg-navy text-white" : "border-line"}`}>All</Link>{kinds.map((k) => <Link key={k} href={`/research?kind=${k}`} className={`border px-3 py-1 capitalize ${sp.kind === k ? "border-navy bg-navy text-white" : "border-line"}`}>{k.replace(/_/g, " ")}</Link>)}</div>
      {(data || []).length ? <ul className="mt-6 grid gap-4 md:grid-cols-2">{(data || []).map((r: any) => <li key={r.slug} className="card p-5"><p className="kicker">{r.kind.replace(/_/g, " ")}</p><h2 className="mt-1 text-xl"><Link href={`/research/${r.slug}`} className="hover:underline">{r.title}</Link></h2><p className="text-sm text-muted">{[r.author_name, r.organisation].filter(Boolean).join(", ")}</p><p className="mt-2 text-sm">{r.summary}</p></li>)}</ul> : <p className="mt-6 text-muted">Nothing has been published here yet. Interviews, conversations and knowledge papers will appear as they are completed. To contribute, <Link href="/contribute" className="underline">get in touch</Link>.</p>}</div></>);
}
