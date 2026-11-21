import Link from "next/link";
import { publicWebinars, isUpcoming, whenText, pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sample from "@/components/Sample";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/webinars", { title: "Webinars", description: "Free webinars on understanding, communication and cooperation: upcoming sessions, past sessions and recordings." }); }
export default async function Page() {
  const all = await publicWebinars(); const up = all.filter(isUpcoming); const past = all.filter((w) => !isUpcoming(w) && w.status !== "draft").reverse();
  const Card = ({ w }: { w: any }) => (<li className="card p-5"><div className="flex flex-wrap items-center gap-2">{w.is_sample && <Sample />}{w.recording_url && <span className="badge">Recording</span>}</div><h3 className="mt-1 text-xl"><Link href={`/webinars/${w.slug}`} className="hover:underline">{w.title}</Link></h3><p className="mt-1 text-sm text-muted">{whenText(w)}</p>{w.summary && <p className="mt-2 text-sm">{w.summary}</p>}</li>);
  return (<><Track path="/webinars" /><PageHead kicker="Webinars" title="Learn together, live and on demand" intro="Webinars are free to attend. Dates and speakers are shown only once they are confirmed."><div className="mb-4"><Breadcrumbs items={[{ name: "Webinars" }]} /></div><div className="mt-4"><Link href="/webinars/recordings" className="btn btn-dark">Recordings library</Link></div></PageHead>
    <div className="wrap py-10"><h2 className="text-3xl">Upcoming</h2>{up.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2">{up.map((w) => <Card key={w.id} w={w} />)}</ul> : <p className="mt-3 text-muted">No upcoming webinars are scheduled yet. Subscribe to the newsletter to hear when dates are announced.</p>}
      <h2 className="mt-12 text-3xl">Past webinars</h2>{past.length ? <ul className="mt-4 grid gap-4 md:grid-cols-2">{past.map((w) => <Card key={w.id} w={w} />)}</ul> : <p className="mt-3 text-muted">Past sessions and recordings will be listed here.</p>}</div></>);
}
