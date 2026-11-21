import Link from "next/link";
import { db } from "@/lib/db";
import { requirePerm, can } from "@/lib/auth";
export const dynamic = "force-dynamic";
const cnt = async (t: string, f?: (q: any) => any) => { let q = db().from(t).select("*", { count: "exact", head: true }); if (f) q = f(q); const { count } = await q; return count || 0; };
export default async function Page({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const a = await requirePerm("dashboard.read"); const sp = await searchParams; const d7 = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10), d30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const A = can(a, "analytics.read");
  const [pub, review, draft, sched, web, wreg, forms, subs, chal, fac, circ, v7, v30, top] = await Promise.all([
    cnt("articles", (q) => q.eq("status", "published")), cnt("articles", (q) => q.eq("status", "review")), cnt("articles", (q) => q.eq("status", "draft")), cnt("articles", (q) => q.eq("status", "scheduled")),
    cnt("webinars", (q) => q.eq("is_published", true)), cnt("webinar_registrations"), can(a, "forms.read") ? cnt("form_submissions", (q) => q.eq("status", "new")) : 0,
    can(a, "newsletter.write") ? cnt("newsletter_subscribers", (q) => q.eq("status", "active")) : 0, can(a, "challenge.write") ? cnt("challenge_submissions", (q) => q.in("status", ["submitted", "under_review"])) : 0,
    can(a, "facilitators.write") ? cnt("facilitators", (q) => q.in("status", ["applied", "under_review"])) : 0, can(a, "circles.write") ? cnt("circles", (q) => q.eq("status", "pending")) : 0,
    A ? db().from("page_views").select("views").gte("day", d7).limit(20000) : { data: [] }, A ? db().from("page_views").select("views").gte("day", d30).limit(50000) : { data: [] },
    A ? db().from("article_views").select("article_id,views").gte("day", d30).limit(20000) : { data: [] }]);
  const sum = (r: any) => (r.data || []).reduce((x: number, y: any) => x + (y.views || 0), 0);
  const m = new Map<string, number>(); for (const r of (top as any).data || []) m.set(r.article_id, (m.get(r.article_id) || 0) + r.views); const best = Array.from(m.entries()).sort((x, y) => y[1] - x[1]).slice(0, 5);
  const { data: arts } = best.length ? await db().from("articles").select("id,title").in("id", best.map((b) => b[0])) : { data: [] };
  const Tile = ({ n, l, href }: { n: any; l: string; href?: string }) => { const c = (<div className="card p-4"><p className="text-3xl font-bold text-navy">{n}</p><p className="text-sm text-muted">{l}</p></div>); return href ? <Link href={href}>{c}</Link> : c; };
  return (<div><h1 className="text-3xl">Dashboard</h1>{sp.denied && <p className="mt-3 bg-yellow-50 p-3">You do not have permission for that area ({sp.denied}).</p>}
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"><Tile n={pub} l="Published articles" href="/admin/articles?status=published" /><Tile n={review} l="Articles awaiting review" href="/admin/articles?status=review" /><Tile n={draft} l="Draft articles" href="/admin/articles?status=draft" /><Tile n={sched} l="Scheduled articles" href="/admin/articles?status=scheduled" />
      <Tile n={web} l="Published webinars" href="/admin/webinars" /><Tile n={wreg} l="Webinar registrations" href="/admin/webinar-registrations" />
      {can(a, "forms.read") && <Tile n={forms} l="New form submissions" href="/admin/submissions" />}{can(a, "newsletter.write") && <Tile n={subs} l="Newsletter subscribers" href="/admin/subscribers" />}
      {can(a, "challenge.write") && <Tile n={chal} l="Challenge projects to review" href="/admin/challenge-submissions" />}{can(a, "facilitators.write") && <Tile n={fac} l="Facilitator applications" href="/admin/facilitators" />}{can(a, "circles.write") && <Tile n={circ} l="Circles awaiting approval" href="/admin/circles" />}
      {A && <><Tile n={sum(v7).toLocaleString("en-IN")} l="Page views, 7 days" href="/admin/analytics" /><Tile n={sum(v30).toLocaleString("en-IN")} l="Page views, 30 days" href="/admin/analytics" /></>}</div>
    {A && <section className="card mt-6 p-5"><h2 className="text-xl">Top articles (30 days)</h2><ol className="mt-2 list-decimal pl-5 text-sm">{best.map(([id, v]) => <li key={id}>{(arts || []).find((x: any) => x.id === id)?.title || id}: {v} views</li>)}{!best.length && <li className="list-none text-muted">No readership data yet. Figures come from real visits to the site.</li>}</ol></section>}</div>);
}
