import Link from "next/link";
import { publicWebinars, hasRecording, pageMeta, whenText } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/webinars/recordings", { title: "Recorded webinars library", description: "Watch past webinars on cooperation, communication and understanding." }); }
export default async function Page() {
  const rec = (await publicWebinars()).filter(hasRecording);
  return (<><Track path="/webinars/recordings" /><PageHead kicker="Webinars" title="Recordings library" intro="Watch past webinars at any time."><div className="mb-4"><Breadcrumbs items={[{ name: "Webinars", href: "/webinars" }, { name: "Recordings" }]} /></div></PageHead>
    <div className="wrap py-10">{rec.length ? <ul className="grid gap-4 md:grid-cols-2">{rec.map((w) => <li key={w.id} className="card p-5"><h2 className="text-xl"><Link href={`/webinars/${w.slug}`} className="hover:underline">{w.title}</Link></h2><p className="mt-1 text-sm text-muted">{whenText(w)}</p></li>)}</ul> : <p className="text-muted">Recordings will appear here after webinars have taken place. <Link href="/webinars" className="underline">See upcoming webinars</Link>.</p>}</div></>);
}
