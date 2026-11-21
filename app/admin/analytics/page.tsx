import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("analytics.read"); const d30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const [{ data: pv }, { data: av }] = await Promise.all([db().from("page_views").select("day,path,views").gte("day", d30).limit(50000), db().from("article_views").select("article_id,views").gte("day", d30).limit(50000)]);
  const byDay = new Map<string, number>(), byPath = new Map<string, number>(), byArt = new Map<string, number>();
  for (const r of pv || []) { byDay.set(r.day, (byDay.get(r.day) || 0) + r.views); byPath.set(r.path, (byPath.get(r.path) || 0) + r.views); } for (const r of av || []) byArt.set(r.article_id, (byArt.get(r.article_id) || 0) + r.views);
  const days = Array.from(byDay.entries()).sort(); const max = Math.max(1, ...days.map((d) => d[1])); const paths = Array.from(byPath.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15); const arts = Array.from(byArt.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const { data: titles } = arts.length ? await db().from("articles").select("id,title").in("id", arts.map((a) => a[0])) : { data: [] };
  return (<div className="max-w-4xl"><h1 className="text-3xl">Analytics (last 30 days)</h1><p className="text-sm text-muted">First-party, cookie-free page views. No personal data or IP addresses are stored.</p>
    <section className="card mt-4 p-5"><h2 className="text-xl">Views per day</h2><div className="mt-3 flex h-32 items-end gap-1" role="img" aria-label="Views per day">{days.map(([d, v]) => <div key={d} title={`${d}: ${v}`} className="flex-1 bg-navy" style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />)}{!days.length && <p className="text-sm text-muted">No visits recorded yet.</p>}</div></section>
    <div className="mt-4 grid gap-4 md:grid-cols-2"><section className="card p-5"><h2 className="text-xl">Top pages</h2><ol className="mt-2 list-decimal pl-5 text-sm">{paths.map(([p, v]) => <li key={p}>{p}: {v}</li>)}</ol></section><section className="card p-5"><h2 className="text-xl">Top articles</h2><ol className="mt-2 list-decimal pl-5 text-sm">{arts.map(([id, v]) => <li key={id}>{(titles || []).find((t: any) => t.id === id)?.title || id}: {v}</li>)}</ol></section></div></div>);
}
