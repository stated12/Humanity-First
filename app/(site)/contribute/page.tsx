import Link from "next/link";
import { pageMeta } from "@/lib/content";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FormBox from "@/components/FormBox";
import Track from "@/components/Track";
export async function generateMetadata() { return pageMeta("/contribute", { title: "Contribute", description: "Write articles, share stories, facilitate circles or help in other ways. Contributors are welcome from anywhere." }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams;
  return (<><Track path="/contribute" /><PageHead kicker="Contribute" title="Add your voice" intro="Students, teachers, practitioners and community members are welcome to contribute. Contributing is free and unpaid unless we agree otherwise in writing."><div className="mb-4"><Breadcrumbs items={[{ name: "Contribute" }]} /></div></PageHead>
    <div className="wrap grid gap-10 py-10 lg:grid-cols-[1fr_420px]"><div className="space-y-5"><h2 className="text-3xl">How it works</h2><ol className="list-decimal space-y-2 pl-5"><li>Send the form with a short note about yourself and what you would like to contribute.</li><li>Once approved, create an account (or sign in with the same email). A contributor dashboard unlocks.</li><li>Write and submit an article. Our editors review it, may ask for changes, and publish it with your name and short biography.</li></ol>
      <h2 className="text-2xl">What we welcome</h2><ul className="list-disc space-y-1 pl-5"><li>Original articles of around 800 to 1,000 words on cooperation, communication, empathy and related subjects</li><li>Stories of cooperation (<Link href="/stories#share" className="underline">share a story</Link>)</li><li>Facilitators for Cooperation Circles and webinar speakers</li><li>Translators, designers and volunteers</li></ul><p className="text-sm text-muted">We do not publish invented research, statistics or quotations. Already a contributor? <Link href="/contributor" className="underline">Open your dashboard</Link>.</p></div>
      <FormBox formKey="contributor_application" ret="/contribute" sent={sp.sent} cta="Apply to contribute" /></div></>);
}
