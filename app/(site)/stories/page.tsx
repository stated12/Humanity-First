import Link from "next/link";
import { db } from "@/lib/db";
import { pageMeta, nowIso } from "@/lib/content";
import { dateFmt } from "@/lib/format";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormBox from "@/components/FormBox";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/stories", { title: "Humanity in Practice", description: "Stories of people and groups cooperating across differences, and a place to share your own." }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; const { data } = await db().from("stories").select("*").eq("status", "published").lte("published_at", nowIso()).order("published_at", { ascending: false });
  return (<><Track path="/stories" /><PageHead kicker="Humanity in Practice" title="Stories of cooperation" intro="Real and illustrative stories of people working together across differences. Stories marked illustrative are examples, not reports of real events."><div className="mb-4"><Breadcrumbs items={[{ name: "Humanity in Practice" }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_400px]"><ul className="space-y-4">{(data || []).map((s: any) => <li key={s.id} className="card p-5">{s.is_sample && <Sample label="Illustrative story" />}<h2 className="mt-1 text-2xl"><Link href={`/stories/${s.slug}`} className="hover:underline">{s.title}</Link></h2><p className="mt-1 text-sm text-muted">{[s.author_name, s.location, s.published_at && dateFmt(s.published_at)].filter(Boolean).join(" · ")}</p><p className="mt-2">{s.excerpt}</p></li>)}{!(data || []).length && <li className="text-muted">Stories will appear here.</li>}</ul>
      <div id="share"><FormBox formKey="story_submission" ret="/stories" sent={sp.sent} cta="Submit your story" /></div></div></>);
}
