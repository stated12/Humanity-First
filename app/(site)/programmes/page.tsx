import Link from "next/link";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/programmes", { title: "Programmes", description: "Youth Cooperation Programme, Cooperation & Leadership Programme and Train the Cooperation Facilitators." }); }
export default async function Page() {
  const { data } = await db().from("programmes").select("*").eq("is_published", true).order("sort_order");
  return (<><Track path="/programmes" /><PageHead kicker="Programmes" title="Programmes for young people, leaders and facilitators" intro="Free for students and young people. Institutional programmes help sustain the initiative."><div className="mb-4"><Breadcrumbs items={[{ name: "Programmes" }]} /></div></PageHead>
    <div className="wrap grid gap-5 py-10 md:grid-cols-3">{(data || []).map((p: any) => <Link key={p.id} href={`/programmes/${p.slug}`} className="card block p-6 transition hover:border-gold"><p className="kicker">{p.kind}</p><h2 className="mt-1 text-2xl">{p.title}</h2><p className="mt-2 text-sm text-muted">{p.summary}</p>{p.is_sample && <div className="mt-3"><Sample label="Outline" /></div>}<span className="mt-3 inline-block text-sm font-semibold text-navy">Learn more →</span></Link>)}</div></>);
}
