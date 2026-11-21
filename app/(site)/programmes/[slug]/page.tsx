import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import { applyFacilitator } from "@/app/actions";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormBox from "@/components/FormBox";
import SupportCta from "@/components/SupportCta";
import Track from "@/components/Track";
const get = async (slug: string) => (await db().from("programmes").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const p = await get(slug); if (!p) return {}; return pageMeta(`/programmes/${slug}`, { title: p.seo_title || p.title, description: p.seo_description || p.summary, image: p.image_url }); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ sent?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const p = await get(slug); if (!p) notFound();
  const { data: mods } = await db().from("programme_modules").select("*").eq("programme_id", p.id).eq("is_published", true).order("sort_order");
  const formKey = p.kind === "youth" ? "youth_participation" : p.kind === "leadership" ? "leadership_enquiry" : null;
  return (<><Track path={`/programmes/${slug}`} /><PageHead kicker="Programme" title={p.title} intro={p.summary}><div className="mb-4"><Breadcrumbs items={[{ name: "Programmes", href: "/programmes" }, { name: p.title }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_380px]"><div className="space-y-8">
      <div className="grid gap-3 text-sm sm:grid-cols-3">{[["Audience", p.audience], ["Format", p.format], ["Duration", p.duration]].filter(([, v]) => v).map(([k, v]) => <div key={k} className="card p-3"><p className="kicker">{k}</p><p>{v}</p></div>)}</div>
      {p.body && <div className="article-body max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(p.body) }} />}
      {(mods || []).length > 0 && <section><h2 className="text-2xl md:text-3xl">Programme modules</h2><ol className="mt-4 space-y-3">{(mods || []).map((m: any, i: number) => <li key={m.id} className="card p-4"><p className="kicker">Module {i + 1}</p><h3 className="text-xl">{m.title}</h3>{m.summary && <p className="mt-1 text-sm text-muted">{m.summary}</p>}{m.body && <div className="article-body mt-2 max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.body) }} />}</li>)}</ol></section>}
      {p.kind === "facilitator" && <p className="border-l-4 border-gold bg-soft p-4 text-sm">This is a learning pathway. No official certification is offered unless a certificate is explicitly stated for a specific cohort. Completion is recorded as a note of participation.</p>}</div>
      <aside className="space-y-6">{p.kind === "facilitator" ? <form action={applyFacilitator} id="apply" className="card space-y-3 p-5"><h2 className="text-2xl">Apply to take part</h2><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden /><input type="hidden" name="programme_id" value={p.id} />
        {sp.sent === "ok" && <p role="status" className="bg-green-50 p-3 text-green-900">Thank you. We have received your application.</p>}{sp.sent === "err" && <p role="alert" className="bg-red-50 p-3 text-red-800">Please check the required fields and consent.</p>}
        {[["name", "Name *", true], ["email", "Email *", true], ["phone", "Phone", false], ["organisation", "Organisation", false], ["location", "Location", false]].map(([n, l, r]) => <div key={n as string}><label className="label" htmlFor={"a_" + n}>{l}</label><input id={"a_" + n} name={n as string} type={n === "email" ? "email" : "text"} required={!!r} className="input" /></div>)}
        <div><label className="label" htmlFor="a_exp">Relevant experience</label><textarea id="a_exp" name="experience" rows={3} className="input" /></div><div><label className="label" htmlFor="a_mot">Why do you want to take part?</label><textarea id="a_mot" name="motivation" rows={3} className="input" /></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" required className="mt-1" /><span>I agree that my details are used to process this application, as described in the <a className="underline" href="/page/privacy-policy">privacy policy</a>.</span></label><button className="btn btn-dark">Submit application</button></form> : formKey ? <FormBox formKey={formKey} ret={`/programmes/${slug}`} sent={sp.sent} /> : null}<SupportCta /></aside></div></>);
}
