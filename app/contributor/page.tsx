import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/supabase-server";
import RichEditor from "@/components/RichEditor";
import { submitArticle } from "./actions";
import { isContributor } from "@/lib/contributor";
export const dynamic = "force-dynamic"; export const metadata = { title: "Contributor dashboard", robots: { index: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ ok?: string; e?: string; id?: string }> }) {
  const u = await currentUser(); if (!u) redirect("/login?next=/contributor"); const sp = await searchParams; const c = await isContributor(u.id, u.email);
  const { data: mine } = c ? await db().from("articles").select("id,slug,title,status,updated_at").eq("writer_user_id", u.id).order("updated_at", { ascending: false }) : { data: [] };
  const edit: any = sp.id && c ? (await db().from("articles").select("*").eq("id", sp.id).eq("writer_user_id", u.id).in("status", ["draft", "review"]).maybeSingle()).data : null;
  const { data: reviews } = (mine || []).length ? await db().from("editorial_reviews").select("*").in("article_id", (mine || []).map((m: any) => m.id)).order("created_at", { ascending: false }) : { data: [] };
  const msg: Record<string, string> = { short: "Please add a title and a full article (at least a few paragraphs) to submit for review. You can save a shorter piece as a draft.", rate: "Too many submissions. Please try later.", locked: "That article can no longer be edited.", save: "Could not save." };
  return (<div className="wrap py-10"><h1 className="text-4xl">Contributor dashboard</h1>
    {!c ? <p className="mt-4 text-muted">Your account is not an approved contributor yet. <Link className="underline" href="/contribute">Apply here</Link>. If you have already been approved, make sure you are signed in with the email you applied with.</p> : (<div className="mt-6 grid gap-8 lg:grid-cols-3">
      <form action={submitArticle} encType="multipart/form-data" className="card space-y-3 p-5 lg:col-span-2"><h2 className="text-2xl">{edit ? "Edit your article" : "Write an article"}</h2>{edit && <input type="hidden" name="id" value={edit.id} />}
        {sp.ok === "1" && <p role="status" className="bg-green-50 p-3 text-green-900">Submitted for editorial review. We will be in touch.</p>}{sp.ok === "draft" && <p role="status" className="bg-green-50 p-3 text-green-900">Draft saved.</p>}{sp.e && <p role="alert" className="bg-red-50 p-3 text-red-800">{msg[sp.e] || "Error"}</p>}
        <p className="text-sm text-muted">Please write original work. Do not include invented research, statistics or quotations. Aim for about 800 to 1,000 words. Editors may suggest changes before publishing.</p>
        <div><label className="label" htmlFor="t">Title *</label><input id="t" name="title" defaultValue={edit?.title || ""} required className="input" /></div><div><label className="label" htmlFor="x">Short summary</label><textarea id="x" name="excerpt" rows={2} defaultValue={edit?.excerpt || ""} className="input" /></div>
        <div><label className="label">Article *</label><RichEditor key={edit?.id || "new"} name="body" defaultValue={edit?.body || ""} draftKey={"contributor-" + (edit?.id || "new")} /></div>
        <div><label className="label" htmlFor="im">Image (optional, up to 4 MB; only images you have the right to use)</label><input id="im" type="file" name="image" accept="image/*" /></div><div><label className="label" htmlFor="ia">Image description (alt text)</label><input id="ia" name="image_alt" defaultValue={edit?.image_alt || ""} className="input" /></div>
        <div className="flex gap-3"><button name="intent" value="submit" className="btn btn-dark">Submit for review</button><button name="intent" value="draft" className="btn btn-line">Save draft</button></div></form>
      <aside><h2 className="text-2xl">Your articles</h2><ul className="mt-3 divide-y divide-line">{(mine || []).map((m: any) => <li key={m.id} className="py-3 text-sm"><b>{m.title}</b><br /><span className="badge">{m.status}</span> {["draft", "review"].includes(m.status) && <Link href={`/contributor?id=${m.id}`} className="underline">Edit</Link>}{m.status === "published" && <Link href={`/articles/${m.slug}`} className="underline">View</Link>}{(reviews || []).filter((r: any) => r.article_id === m.id && r.comment && r.reviewer_id !== u.id).slice(0, 1).map((r: any) => <p key={r.id} className="mt-1 text-muted">Editor: {r.comment}</p>)}</li>)}{!(mine || []).length && <li className="py-3 text-sm text-muted">Nothing yet.</li>}</ul></aside></div>)}</div>);
}
