import { db } from "@/lib/db";
import { pageMeta } from "@/lib/content";
import { submitChallenge } from "@/app/actions";
import PageHead from "@/components/PageHead";
import Breadcrumbs from "@/components/Breadcrumbs";
export async function generateMetadata() { return pageMeta("/challenge/submit", { title: "Submit a Challenge project" }); }
export default async function Page({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const sp = await searchParams; const { data: areas } = await db().from("challenge_areas").select("id,name").order("sort_order");
  const F = ({ n, l, r, t }: { n: string; l: string; r?: boolean; t?: boolean }) => <div><label className="label" htmlFor={n}>{l}{r && " *"}</label>{t ? <textarea id={n} name={n} rows={4} required={r} className="input" /> : <input id={n} name={n} type={n === "contact_email" ? "email" : "text"} required={r} className="input" />}</div>;
  return (<><PageHead kicker="Global Cooperation Challenge" title="Submit a project"><div className="mb-4"><Breadcrumbs items={[{ name: "Challenge", href: "/challenge" }, { name: "Submit" }]} /></div></PageHead>
    <div className="wrap max-w-2xl py-10">{sp.sent === "ok" ? <p role="status" className="bg-green-50 p-4 text-green-900">Thank you. Your project has been received and will be reviewed before anything is published.</p> : <form action={submitChallenge} encType="multipart/form-data" className="card space-y-4 p-6"><input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />{sp.sent === "err" && <p role="alert" className="bg-red-50 p-3 text-red-800">Please complete the required fields and the consent box.</p>}
      <F n="title" l="Project title" r /><F n="group_name" l="Group, school or organisation" r /><F n="location" l="Location" /><div><label className="label" htmlFor="area_id">Category</label><select id="area_id" name="area_id" className="input"><option value="">Choose</option>{(areas || []).map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      <F n="contact_name" l="Contact person" r /><F n="contact_email" l="Contact email (kept private)" r /><F n="summary" l="Summary (a few sentences)" r t /><F n="challenge_identified" l="The shared challenge you identified" t /><F n="solution" l="The collaborative solution you built" t /><F n="impact" l="Impact: what changed (only what really happened)" t /><F n="link_url" l="Link to more information (optional)" />
      <div><label className="label" htmlFor="image">Image (optional, up to 4 MB, JPG/PNG/WebP)</label><input id="image" name="image" type="file" accept="image/*" /></div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" required className="mt-1" /><span>I confirm the information is accurate, that I have permission to share it, and I agree to the <a href="/page/privacy-policy" className="underline">privacy policy</a>.</span></label><button className="btn btn-dark">Submit project</button></form>}</div></>);
}
