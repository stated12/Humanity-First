import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePerm, audit } from "@/lib/auth";
export const dynamic = "force-dynamic"; export const maxDuration = 60;

const ZERO = "00000000-0000-0000-0000-000000000000";
const chunk = <T,>(a: T[], n: number) => { const o: T[][] = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

/** Loads the starter content (40 articles, topics, toolkit, programmes, forms, navigation, pages...) from data/seed.json.
 *  Runs only on a fresh site (no articles yet), so it cannot overwrite real work. Avoids pasting large SQL on a phone. */
async function loadStarter(fd: FormData) {
  "use server";
  const a = await requirePerm("users.manage");
  if (fd.get("confirm") !== "on") redirect("/admin/seed?e=" + encodeURIComponent("Tick the confirmation box first."));
  const { count } = await db().from("articles").select("*", { count: "exact", head: true });
  if ((count || 0) > 0) redirect("/admin/seed?e=" + encodeURIComponent("Starter content is already loaded (articles exist). Nothing was changed."));
  const seed: any = (await import("@/data/seed.json")).default;
  const fail = (step: string, msg: string): never => redirect("/admin/seed?e=" + encodeURIComponent(`${step}: ${msg}`.slice(0, 300)));
  // Clear half-loaded starter rows from an earlier failed attempt. Roles, users and settings are never deleted.
  const wipe: [string, string, string][] = [["article_tag_relations", "article_id", ZERO], ["tags", "id", ZERO], ["resources", "id", ZERO], ["resource_categories", "id", ZERO], ["circle_content", "id", ZERO], ["programme_modules", "id", ZERO], ["programmes", "id", ZERO], ["webinars", "id", ZERO], ["stories", "id", ZERO], ["challenge_areas", "id", ZERO], ["support_options", "id", ZERO], ["navigation_items", "id", ZERO], ["pages", "id", ZERO], ["forms", "key", ""], ["topics", "id", ZERO], ["categories", "id", ZERO]];
  for (const [t, col, v] of wipe) { const r = await db().from(t).delete().neq(col, v); if (r.error) fail("clearing " + t, r.error.message); }
  const r0 = await db().from("authors").delete().eq("slug", "orivana-editorial-team"); if (r0.error) fail("clearing authors", r0.error.message);
  const up = async (t: string, conflict: string) => { for (const c of chunk(seed[t] || [], 50)) { const r = await db().from(t).upsert(c, { onConflict: conflict, ignoreDuplicates: true }); if (r.error) fail(t, r.error.message); } };
  const ins = async (t: string, n = 50) => { for (const c of chunk(seed[t] || [], n)) { const r = await db().from(t).insert(c); if (r.error) fail(t, r.error.message); } };
  await up("roles", "role"); await up("role_permissions", "role,permission"); await up("site_settings", "key");
  for (const t of ["categories", "topics", "authors"]) await ins(t, 20);
  await ins("articles", 4); await ins("tags"); await ins("article_tag_relations", 100);
  for (const t of ["resource_categories", "resources", "circle_content", "programmes", "programme_modules", "webinars", "stories", "challenge_areas", "support_options", "navigation_items", "pages", "forms"]) await ins(t, 20);
  await audit(a, "load_starter_content", "seed"); redirect("/admin/seed?ok=1");
}
export default async function Page({ searchParams }: { searchParams: Promise<{ e?: string; ok?: string }> }) {
  await requirePerm("users.manage"); const sp = await searchParams;
  const { count } = await db().from("articles").select("*", { count: "exact", head: true });
  return (<div className="max-w-2xl"><h1 className="text-3xl">Load starter content</h1>
    <p className="mt-2 text-muted">Loads the 40 articles, 10 Academy topics, toolkit, programmes, Circles guidance, forms, navigation and the About and policy pages. Use this once on a new site.</p>
    {sp.ok && <p role="status" className="mt-3 bg-green-50 p-3 text-green-900">Starter content loaded. Open the website to see it.</p>}{sp.e && <p role="alert" className="mt-3 bg-red-50 p-3 text-red-800">{sp.e}</p>}
    <p className="card mt-4 p-4">Articles currently on the site: <b>{count || 0}</b></p>
    {(count || 0) === 0 ? <form action={loadStarter} className="card mt-4 space-y-3 p-5"><label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" className="mt-1" /><span>I understand this loads the starter content, and replaces any half-loaded starter rows from an earlier attempt.</span></label><button className="btn btn-dark">Load starter content</button></form> : <p className="mt-4 text-sm text-muted">Already loaded. Edit content from the other admin screens.</p>}</div>);
}
