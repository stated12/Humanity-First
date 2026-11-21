import { db } from "./db";
import { slugify } from "./format";
/** Server-only helpers (kept out of "use server" files so they cannot be called from the browser). */
export async function grantContributor(userId: string, email: string, name?: string | null) {
  await db().from("user_roles").upsert({ user_id: userId, role: "contributor" });
  const { data: au } = await db().from("authors").select("id").eq("user_id", userId).maybeSingle();
  if (au) return au.id as string;
  const { data: created } = await db().from("authors").insert({ user_id: userId, name: name || email.split("@")[0], slug: slugify(name || email.split("@")[0]) + "-" + Math.random().toString(36).slice(2, 5), email, is_active: true }).select("id").single();
  return (created?.id as string) || null;
}
/** Returns { author_id } when the user is a contributor (role granted, or an approved application exists for their email). */
export async function isContributor(userId: string, email?: string | null): Promise<{ author_id: string | null } | null> {
  const { data: r } = await db().from("user_roles").select("role").eq("user_id", userId).eq("role", "contributor").maybeSingle();
  if (!r && email) {
    const { data: ap } = await db().from("form_submissions").select("id,name").eq("form_key", "contributor_application").eq("status", "approved").ilike("email", email).limit(1).maybeSingle();
    if (!ap) return null; const id = await grantContributor(userId, email, ap.name); return { author_id: id };
  }
  if (!r) return null;
  const { data: au } = await db().from("authors").select("id").eq("user_id", userId).maybeSingle();
  return { author_id: au?.id || (await grantContributor(userId, email || "", null)) };
}
