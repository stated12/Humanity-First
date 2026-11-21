import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pageMeta, isUpcoming, whenText, embedUrl, publishedArticles } from "@/lib/content";
import { sanitizeHtml } from "@/lib/sanitize";
import { registerWebinar } from "@/app/actions";
import { SITE_URL } from "@/lib/env";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import SupportCta from "@/components/SupportCta";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
import JsonLd from "@/components/JsonLd";
const get = async (slug: string) => (await db().from("webinars").select("*").eq("slug", slug).eq("is_published", true).maybeSingle()).data as any;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const w = await get(slug); if (!w) return {}; return pageMeta(`/webinars/${slug}`, { title: w.seo_title || w.title, description: w.seo_description || w.summary, image: w.image_url }); }
export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ r?: string }> }) {
  const { slug } = await params; const sp = await searchParams; const w = await get(slug); if (!w) notFound();
  const [spk, mats, arts, res] = await Promise.all([w.speaker_ids?.length ? db().from("speakers").select("*").in("id", w.speaker_ids) : { data: [] }, db().from("webinar_materials").select("*").eq("webinar_id", w.id).order("sort_order"), w.related_article_ids?.length ? publishedArticles({ ids: w.related_article_ids }) : { rows: [] }, w.related_resource_ids?.length ? db().from("resources").select("slug,title").in("id", w.related_resource_ids).eq("is_published", true) : { data: [] }]);
  const rec = embedUrl(w.recording_url); const live = embedUrl(w.video_url); const up = isUpcoming(w);
  const ld = { "@context": "https://schema.org", "@type": "Event", name: w.title, description: w.summary, ...(w.starts_at ? { startDate: w.starts_at } : {}), ...(w.ends_at ? { endDate: w.ends_at } : {}), eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode", eventStatus: w.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled", location: { "@type": "VirtualLocation", url: `${SITE_URL}/webinars/${slug}` }, isAccessibleForFree: true, organizer: { "@type": "Organization", name: "The Humanity & Cooperation Initiative" } };
  return (<><Track path={`/webinars/${slug}`} />{w.starts_at && <JsonLd data={ld} />}<PageHead kicker="Webinar" title={w.title} intro={w.summary}><div className="mb-4"><Breadcrumbs items={[{ name: "Webinars", href: "/webinars" }, { name: w.title }]} /></div>{w.is_sample && <Sample />}</PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_340px]"><div className="space-y-8">
      {rec ? <div><h2 className="text-2xl">Watch the recording</h2><div className="mt-3 aspect-video"><iframe src={rec} title={`Recording: ${w.title}`} className="h-full w-full" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div></div> : w.recording_url && <p><a href={w.recording_url} className="btn btn-dark" target="_blank" rel="noopener noreferrer">Watch the recording</a></p>}
      {live && up && <div><h2 className="text-2xl">Live stream</h2><div className="mt-3 aspect-video"><iframe src={live} title={`Live: ${w.title}`} className="h-full w-full" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen /></div></div>}
      {w.description && <div className="article-body max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(w.description) }} />}
      {(spk.data || []).length > 0 && <section><h2 className="text-2xl">Speakers</h2><ul className="mt-3 grid gap-4 sm:grid-cols-2">{(spk.data || []).map((x: any) => <li key={x.id} className="card flex gap-3 p-4">{x.photo_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={x.photo_url} alt={x.name} className="h-16 w-16 rounded-full object-cover" />}<div><p className="font-serif text-lg text-navy">{x.name}</p><p className="text-sm text-muted">{[x.designation, x.organisation].filter(Boolean).join(", ")}</p>{x.bio && <p className="mt-1 text-sm">{x.bio}</p>}</div></li>)}</ul></section>}
      {(mats.data || []).length > 0 && <section><h2 className="text-2xl">Materials</h2><ul className="mt-3 list-disc pl-5">{(mats.data || []).map((m: any) => <li key={m.id}><a href={m.file_url} target="_blank" rel="noopener noreferrer" className="underline">{m.title}</a></li>)}</ul></section>}
      {(res.data || []).length > 0 && <section><h2 className="text-2xl">Related tools</h2><ul className="mt-3 list-disc pl-5">{(res.data || []).map((r: any) => <li key={r.slug}><Link href={`/toolkit/${r.slug}`} className="underline">{r.title}</Link></li>)}</ul></section>}
      {arts.rows.length > 0 && <section><h2 className="text-2xl">Related articles</h2><div className="mt-3 grid gap-4 sm:grid-cols-2">{arts.rows.map((a: any) => <ArticleCard key={a.id} a={a} />)}</div></section>}</div>
      <aside className="space-y-6"><div className="card p-5"><p className="kicker">When</p><p className="font-serif text-xl text-navy">{whenText(w)}</p>
        {w.status === "cancelled" && <p className="mt-3 font-semibold text-red-700">This webinar has been cancelled.</p>}
        {up && w.on_site_registration && <form action={registerWebinar} id="register" className="mt-4 space-y-3"><input type="hidden" name="slug" value={slug} /><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
          {sp.r === "ok" && <p role="status" className="bg-green-50 p-2 text-sm text-green-900">You are registered. Check your email if email is enabled.</p>}{sp.r === "dup" && <p className="bg-yellow-50 p-2 text-sm">This email is already registered.</p>}{sp.r === "full" && <p className="bg-yellow-50 p-2 text-sm">This webinar is full.</p>}{(sp.r === "err" || sp.r === "closed") && <p role="alert" className="bg-red-50 p-2 text-sm text-red-800">Registration could not be completed.</p>}
          <div><label className="label" htmlFor="rn">Name *</label><input id="rn" name="name" required className="input" /></div><div><label className="label" htmlFor="re">Email *</label><input id="re" name="email" type="email" required className="input" /></div><div><label className="label" htmlFor="ro">Organisation</label><input id="ro" name="organisation" className="input" /></div><div><label className="label" htmlFor="rc">Country</label><input id="rc" name="country" className="input" /></div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" required className="mt-1" /><span>I agree that my details are used for this webinar, as described in the <a href="/page/privacy-policy" className="underline">privacy policy</a>.</span></label><button className="btn btn-dark w-full">Register (free)</button></form>}
        {up && !w.on_site_registration && w.registration_url && <a href={w.registration_url} target="_blank" rel="noopener noreferrer" className="btn btn-dark mt-4 w-full">Register (free)</a>}
        {up && w.registration_details && <p className="mt-3 text-sm text-muted">{w.registration_details}</p>}{up && !w.on_site_registration && !w.registration_url && !w.registration_details && <p className="mt-3 text-sm text-muted">Registration details will be announced.</p>}</div>
        <SupportCta where="show_on_webinars" /></aside></div></>);
}
