import Link from "next/link";
import { db } from "@/lib/db";
import { requireAny } from "@/lib/auth";
export const dynamic = "force-dynamic";
const ST = ["draft", "review", "scheduled", "published", "archived"]; const PER = 40;
export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string; ok?: string }> }) {
  await requireAny(["articles.write", "articles.review", "articles.publish"]); const sp = await searchParams; const page = Math.max(1, Number(sp.page) || 1);
  let q = db().from("articles").select("id,title,slug,status,published_at,updated_at,is_featured,hc_categories(name)", { count: "exact" }).order("updated_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  if (sp.status && ST.includes(sp.status)) q = q.eq("status", sp.status); if (sp.q) { const t = sp.q.replace(/[%,()]/g, " ").trim(); if (t) q = q.ilike("title", `%${t}%`); }
  const { data, count } = await q; const link = (o: Record<string, string>) => "/admin/articles?" + new URLSearchParams({ ...(sp.status ? { status: sp.status } : {}), ...(sp.q ? { q: sp.q } : {}), ...o }).toString();
  return (<div><div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-3xl">Articles</h1><Link href="/admin/articles/new" className="btn btn-dark">+ New article</Link></div>{sp.ok && <p className="mt-3 bg-green-50 p-2 text-green-800">Done.</p>}
    <form className="mt-4 flex flex-wrap gap-2"><input name="q" defaultValue={sp.q} placeholder="Search titles" className="input max-w-xs" /><select name="status" defaultValue={sp.status || ""} className="input max-w-[180px]"><option value="">All statuses</option>{ST.map((x) => <option key={x}>{x}</option>)}</select><button className="btn btn-line">Filter</button></form>
    <p className="mt-3 text-sm text-muted">{count || 0} articles</p>
    <div className="card mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">Title</th><th>Category</th><th>Status</th><th>Updated</th><th /></tr></thead><tbody>{(data || []).map((a: any) => <tr key={a.id} className="border-t border-line"><td className="p-3">{a.title}{a.is_featured && <span className="badge ml-2">Featured</span>}</td><td>{a.hc_categories?.name}</td><td><span className="badge">{a.status}</span></td><td>{new Date(a.updated_at).toLocaleDateString("en-IN")}</td><td className="p-3 text-right"><Link href={`/admin/articles/${a.id}`} className="underline">Edit</Link></td></tr>)}{!(data || []).length && <tr><td colSpan={5} className="p-6 text-center text-muted">No articles.</td></tr>}</tbody></table></div>
    <div className="mt-4 flex gap-4 text-sm">{page > 1 && <Link className="underline" href={link({ page: String(page - 1) })}>← Previous</Link>}{page * PER < (count || 0) && <Link className="underline" href={link({ page: String(page + 1) })}>Next →</Link>}</div></div>);
}
