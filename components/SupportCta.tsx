import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { getSponsors } from "@/lib/content";
/** Free-access note plus clearly labelled sponsor note and a support call-to-action. Never blocks content. */
export default async function SupportCta({ where }: { where?: "show_on_articles" | "show_on_webinars" }) {
  const s = await getSettings(); const sp = where ? await getSponsors(where) : [];
  return (<aside className="card border-l-4 border-l-gold p-5" aria-label="Support this initiative">
    {sp.length > 0 && <div className="mb-4 border-b border-line pb-4"><p className="kicker">Supported by (sponsor)</p><div className="mt-2 flex flex-wrap gap-4">{sp.map((x) => <a key={x.id} href={x.website || "#"} target="_blank" rel="sponsored noopener noreferrer" className="text-sm font-semibold underline">{x.name}</a>)}</div><p className="mt-2 text-xs text-muted">{s.sponsor_note}</p></div>}
    <p className="font-serif text-xl text-navy">{s.free_note || "Everything here is free for students, teachers and community groups."}</p>
    <p className="mt-1 text-sm text-muted">This work is kept open through sponsorship, institutional programmes and voluntary contributions.</p><Link href="/support" className="btn btn-gold mt-3">Support the initiative</Link></aside>);
}
