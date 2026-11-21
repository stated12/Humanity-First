import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/supabase-server";
import { logout, saveProfile } from "@/app/actions";
import { isContributor } from "@/lib/contributor";
export const dynamic = "force-dynamic"; export const metadata = { title: "My account", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const u = await currentUser(); if (!u) redirect("/login?next=/account"); const sp = await searchParams;
  const [{ data: p }, c] = await Promise.all([db().from("profiles").select("*").eq("id", u.id).maybeSingle(), isContributor(u.id, u.email)]);
  const { data: regs } = await db().from("webinar_registrations").select("created_at,hc_webinars(title,slug)").ilike("email", u.email || "").order("created_at", { ascending: false });
  return (<div className="wrap max-w-3xl py-10"><h1 className="text-4xl">My account</h1><p className="mt-1 text-muted">{u.email}</p>{sp.ok && <p className="mt-3 bg-green-50 p-3 text-green-900">Saved.</p>}
    <form action={saveProfile} className="card mt-6 space-y-3 p-5"><h2 className="text-2xl">Profile</h2><div><label className="label" htmlFor="fn">Name</label><input id="fn" name="full_name" defaultValue={p?.full_name || ""} className="input" /></div><div><label className="label" htmlFor="ph">Phone</label><input id="ph" name="phone" defaultValue={p?.phone || ""} className="input" /></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="newsletter_pref" defaultChecked={!!p?.newsletter_pref} />I would like to hear about new articles and webinars</label><button className="btn btn-dark">Save</button></form>
    <section className="card mt-6 p-5"><h2 className="text-2xl">Contributing</h2>{c ? <p className="mt-2">You are an approved contributor. <Link href="/contributor" className="underline">Open the contributor dashboard</Link>.</p> : <p className="mt-2 text-muted">Want to write for the initiative? <Link href="/contribute" className="underline">Apply to contribute</Link>.</p>}</section>
    {(regs || []).length > 0 && <section className="card mt-6 p-5"><h2 className="text-2xl">My webinar registrations</h2><ul className="mt-2 list-disc pl-5">{(regs || []).map((r: any, i: number) => <li key={i}>{r.hc_webinars ? <Link className="underline" href={`/webinars/${r.hc_webinars.slug}`}>{r.hc_webinars.title}</Link> : "Webinar"}</li>)}</ul></section>}
    <form action={logout} className="mt-6"><button className="btn btn-line">Sign out</button></form></div>);
}
