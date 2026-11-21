import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { getSponsors, pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormBox from "@/components/FormBox";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/support", { title: "Support the initiative", description: "Sponsorship, institutional programmes, voluntary contributions and partnerships that keep learning free for students and communities." }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; const s = await getSettings(); const [{ data: opts }, sponsors] = await Promise.all([db().from("support_options").select("*").eq("is_active", true).order("sort_order"), getSponsors("show_publicly")]);
  return (<><Track path="/support" /><PageHead kicker="Support" title="Keeping learning free for students and communities" intro={s.free_note}><div className="mb-4"><Breadcrumbs items={[{ name: "Support" }]} /></div></PageHead>
    <div className="wrap py-10"><p className="max-w-3xl text-lg text-muted">Articles, webinars and tools are free to read, attend and use. The initiative is sustained by sponsors, institutions that run programmes with us, and people who contribute voluntarily. There are no paywalls.</p>
      <ul className="mt-8 grid gap-5 md:grid-cols-2">{(opts || []).map((o: any) => <li key={o.id} className="card p-6"><p className="kicker">{o.kind}</p><h2 className="mt-1 text-2xl">{o.title}</h2><p className="mt-2 text-muted">{o.description}</p>{o.amount_note && <p className="mt-2 text-sm font-semibold">{o.amount_note}</p>}<a href={o.cta_url || "#enquiry"} className="btn btn-dark mt-4">{o.cta_label || "Get in touch"}</a></li>)}</ul>
      {(s.support_bank_details || s.support_upi) && <section className="card mt-10 border-l-4 border-l-gold p-6"><h2 className="text-2xl">Voluntary contribution</h2>{s.payments_note && <p className="mt-2 text-muted">{s.payments_note}</p>}{s.support_upi && <p className="mt-3"><b>UPI:</b> {s.support_upi}</p>}{s.support_bank_details && <pre className="mt-3 whitespace-pre-wrap font-sans text-sm">{s.support_bank_details}</pre>}<p className="mt-3 text-xs text-muted">Contributions are voluntary and do not buy editorial influence. Write to us if you would like a receipt.</p></section>}
      {sponsors.length > 0 && <section className="mt-10"><h2 className="text-2xl">Sponsors and partners</h2><p className="text-sm text-muted">{s.sponsor_note}</p><ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{sponsors.map((x) => <li key={x.id} className="card p-4"><p className="kicker">{x.tier.replace(/_/g, " ")}</p><p className="font-serif text-lg text-navy">{x.website ? <a href={x.website} target="_blank" rel="sponsored noopener noreferrer" className="underline">{x.name}</a> : x.name}</p>{x.blurb && <p className="text-sm text-muted">{x.blurb}</p>}</li>)}</ul></section>}
      <div id="enquiry" className="mt-10 max-w-2xl"><FormBox formKey="sponsorship_enquiry" ret="/support" sent={sp.sent} cta="Send enquiry" /></div></div></>);
}
