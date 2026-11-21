import Link from "next/link";
import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/challenge", { title: "Global Cooperation Challenge", description: "Groups of any kind can submit a collaborative project addressing a shared challenge. Selected projects are featured and recognised." }); }
export default async function Page() {
  const { data: areas } = await db().from("challenge_areas").select("*").order("sort_order");
  return (<><Track path="/challenge" /><PageHead kicker="Global Cooperation Challenge" title="Show what cooperation can do" intro="The Challenge invites schools, community groups, organisations and informal teams to design and carry out a project in which people work together to address a shared problem."><div className="mb-4"><Breadcrumbs items={[{ name: "Global Cooperation Challenge" }]} /></div><div className="flex flex-wrap gap-3"><Link href="/challenge/submit" className="btn btn-dark">Submit a project</Link><Link href="/challenge/showcase" className="btn btn-line">View the showcase</Link></div></PageHead>
    <div className="wrap grid gap-10 py-10 md:grid-cols-2"><section><h2 className="text-3xl">Guidelines</h2><ol className="mt-4 list-decimal space-y-2 pl-5"><li>Your project must involve people from at least two different groups, viewpoints or backgrounds working together.</li><li>Describe the shared challenge you identified, the solution you built together, and what changed as a result.</li><li>Be honest. Describe only what actually happened and do not claim results you cannot support.</li><li>Respect privacy. Do not include personal details of people who have not agreed, and take particular care with children.</li><li>Participation is free. Submissions are reviewed before anything is published.</li></ol>
      <h2 className="mt-8 text-3xl">What happens next</h2><p className="mt-2 text-muted">Submitted projects are reviewed by the team. Approved projects are published in the showcase, and selected projects receive recognition as featured projects. Recognition is a recognition of effort and does not imply an award or certification unless stated.</p></section>
      <section><h2 className="text-3xl">Categories</h2><ul className="mt-4 space-y-3">{(areas || []).map((a: any) => <li key={a.id} className="card p-4"><p className="font-serif text-lg text-navy">{a.name}</p><p className="text-sm text-muted">{a.description}</p></li>)}</ul></section></div></>);
}
