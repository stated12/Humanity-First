import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormBox from "@/components/FormBox";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/circles", { title: "Cooperation Circles", description: "Start or join a Cooperation Circle: community-led groups for listening, learning and acting together. Free guidance, activities and facilitation notes." }); }
const SECTIONS: [string, string][] = [["how_it_works", "How Circles work"], ["guideline", "Starting a Circle: guidelines"], ["toolkit_activity", "Toolkit activities"], ["discussion_theme", "Discussion themes"], ["facilitation", "Facilitation guidance"], ["exercise", "Exercises"]];
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; const [{ data: c }, { data: dir }, { data: st }] = await Promise.all([db().from("circle_content").select("*").eq("is_published", true).order("sort_order"), db().from("circles").select("name,setting,location,description").eq("is_published", true).eq("status", "approved").order("name"), db().from("stories").select("slug,title").eq("status", "published").eq("category", "Cooperation Circles").limit(4)]);
  const rows: any[] = c || [];
  return (<><Track path="/circles" /><PageHead kicker="Cooperation Circles" title="Small groups. Real conversations." intro="A Cooperation Circle is a community-led group that meets regularly to listen, learn and act together. Anyone can start one. Everything on this page is free."><div className="mb-4"><Breadcrumbs items={[{ name: "Cooperation Circles" }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_400px]"><div className="space-y-10">{SECTIONS.map(([k, label]) => { const items = rows.filter((x) => x.kind === k); return items.length ? <section key={k}><h2 className="text-2xl md:text-3xl">{label}</h2><div className="mt-4 space-y-4">{items.map((x) => <details key={x.id} className="card p-4" open={k === "how_it_works"}><summary className="cursor-pointer font-serif text-xl text-navy">{x.title}</summary><div className="article-body mt-3 max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(x.body || "") }} /></details>)}</div></section> : null; })}
      <section><h2 className="text-2xl md:text-3xl">Circles directory</h2>{(dir || []).length ? <ul className="mt-4 grid gap-3 sm:grid-cols-2">{(dir || []).map((x: any) => <li key={x.name} className="card p-4"><p className="font-serif text-lg text-navy">{x.name}</p><p className="text-sm text-muted">{[x.setting, x.location].filter(Boolean).join(" · ")}</p>{x.description && <p className="mt-1 text-sm">{x.description}</p>}</li>)}</ul> : <p className="mt-3 text-muted">No circles are listed yet. Be the first to register one.</p>}</section></div>
      <div id="apply"><FormBox formKey="circle_application" ret="/circles" sent={sp.sent} cta="Send application" /></div></div></>);
}
