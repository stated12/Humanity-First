import Link from "next/link";
import { getTopics, pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/academy", { title: "Cooperation Academy", description: "Ten free learning topics on understanding, communication, empathy and cooperation, each with articles, webinars, tools, exercises and reflection questions." }); }
export default async function Page() {
  const topics = await getTopics();
  return (<><Track path="/academy" /><PageHead kicker="Cooperation Academy" title="Ten subjects for learning to cooperate" intro="Each topic brings together an introduction, learning objectives, articles, webinars, practical tools, exercises and reflection questions. Free for everyone."><div className="mb-4"><Breadcrumbs items={[{ name: "Cooperation Academy" }]} /></div></PageHead>
    <div className="wrap grid gap-5 py-10 sm:grid-cols-2 lg:grid-cols-3">{topics.map((t, i) => <Link key={t.id} href={`/academy/${t.slug}`} className="card block p-6 transition hover:border-gold"><span className="text-sm font-bold text-gold-dark">Topic {i + 1}</span><h2 className="mt-1 text-2xl">{t.name}</h2><p className="mt-2 text-sm text-muted">{t.summary}</p><span className="mt-3 inline-block text-sm font-semibold text-navy">Open topic →</span></Link>)}</div></>);
}
