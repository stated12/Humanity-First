import Link from "next/link";
import { db } from "@/lib/db";
import { requirePerm } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Page() {
  await requirePerm("newsletter.write"); const { data } = await db().from("newsletter_campaigns").select("*").order("created_at", { ascending: false }).limit(100);
  return (<div className="max-w-4xl"><div className="flex items-center justify-between"><h1 className="text-3xl">Newsletter campaigns</h1><Link href="/admin/campaigns/new" className="btn btn-dark">+ New campaign</Link></div><div className="card mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-soft"><tr><th className="p-3">Subject</th><th>Status</th><th>Sent</th><th /></tr></thead><tbody>{(data || []).map((c: any) => <tr key={c.id} className="border-t border-line"><td className="p-3">{c.subject}</td><td><span className="badge">{c.status}</span></td><td>{c.sent_count}/{c.recipients_total}</td><td className="p-3 text-right"><Link href={`/admin/campaigns/${c.id}`} className="underline">Open</Link></td></tr>)}{!(data || []).length && <tr><td colSpan={4} className="p-6 text-center text-muted">No campaigns yet.</td></tr>}</tbody></table></div></div>);
}
